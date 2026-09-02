<?php

declare(strict_types=1);

namespace App\Domains\Afiliados\Services;

use App\Domains\Afiliados\Models\Afiliado;
use App\Domains\Afiliados\Models\AfiliadoComissao;
use App\Domains\Afiliados\Models\AfiliadoPagamento;
use App\Domains\Afiliados\Notifications\AfiliadoComissaoCreditadaNotification;
use App\Domains\Afiliados\Notifications\AfiliadoPagamentoEfectuadoNotification;
use App\Domains\Condominio\Models\Condominio;
use App\Domains\Empresa\Models\EmpresaGestora;
use App\Domains\Payment\Models\OrdemCompra;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Motor de comissões: cada pagamento de um cliente indicado gera uma comissão
 * calculada sobre o valor SEM imposto (subtotal / base + activação).
 *
 * Origens cobertas (todas as receitas da ONDAKA pagas pela empresa gestora):
 *  - plataforma_facturas (subscrição core)  → registarPagamentoFacturaPlataforma()
 *  - ordens_compra (add-ons, pacotes SMS…)  → registarPagamentoOrdem()
 */
class AfiliadoComissaoService
{
    public function __construct(
        protected AfiliadoService $afiliados,
        protected AfiliadoConfigService $config,
    ) {}

    // -----------------------------------------------------------------
    // Pontos de entrada (hooks)
    // -----------------------------------------------------------------

    public function registarPagamentoFacturaPlataforma(int $facturaId): ?AfiliadoComissao
    {
        $f = DB::table('plataforma_facturas')->where('id', $facturaId)->first();
        if (! $f || $f->estado !== 'paga') {
            return null;
        }
        $sub = DB::table('subscricoes')->where('id', $f->subscricao_id)->first();
        if (! $sub) {
            return null;
        }
        $empresa = EmpresaGestora::find($sub->empresa_gestora_id);

        return $this->registar(
            empresa: $empresa,
            origemType: AfiliadoComissao::ORIGEM_FACTURA_PLATAFORMA,
            origemId: (int) $f->id,
            origemNumero: (string) $f->numero,
            descricao: sprintf(
                'Subscrição ONDAKA — factura %s (%s a %s)',
                $f->numero,
                Carbon::parse((string) $f->periodo_referencia_inicio)->format('d/m/Y'),
                Carbon::parse((string) $f->periodo_referencia_fim)->format('d/m/Y'),
            ),
            valorTotal: (string) $f->valor_total_kz,
            valorImposto: (string) $f->imposto_valor_kz,
            valorBase: (string) $f->subtotal_kz,
            pagoEm: $f->data_pagamento ? Carbon::parse((string) $f->data_pagamento) : now(),
            meta: ['imposto_tipo' => $f->imposto_tipo, 'imposto_taxa_pct' => $f->imposto_taxa_pct],
        );
    }

    public function registarPagamentoOrdem(OrdemCompra $ordem): ?AfiliadoComissao
    {
        if ($ordem->estado !== 'aprovada') {
            return null;
        }
        $empresa = $this->empresaDaOrdem($ordem);
        $base = bcadd($this->dec($ordem->valor_base), $this->dec($ordem->valor_activacao), 2);

        return $this->registar(
            empresa: $empresa,
            origemType: AfiliadoComissao::ORIGEM_ORDEM_COMPRA,
            origemId: (int) $ordem->id,
            origemNumero: (string) $ordem->numero,
            descricao: 'Loja ONDAKA — '.$ordem->descricao_item.' (ordem '.$ordem->numero.')',
            valorTotal: $this->dec($ordem->valor_total),
            valorImposto: $this->dec($ordem->valor_iva),
            valorBase: $base,
            pagoEm: $ordem->aprovada_em ? Carbon::parse((string) $ordem->aprovada_em) : now(),
            meta: ['tipo_item' => $ordem->tipo_item, 'owner_type' => class_basename((string) $ordem->owner_type)],
        );
    }

    protected function empresaDaOrdem(OrdemCompra $o): ?EmpresaGestora
    {
        if ($o->owner_type === EmpresaGestora::class) {
            return EmpresaGestora::find($o->owner_id);
        }
        if ($o->owner_type === Condominio::class) {
            $c = Condominio::find($o->owner_id);

            return $c && $c->empresa_gestora_id ? EmpresaGestora::find($c->empresa_gestora_id) : null;
        }

        return null;
    }

    // -----------------------------------------------------------------
    // Núcleo
    // -----------------------------------------------------------------

    /**
     * Regista a comissão de um pagamento. Idempotente por (origem_type, origem_id).
     * Devolve null quando não há afiliado, atribuição expirada, programa inactivo ou valor zero.
     */
    public function registar(
        ?EmpresaGestora $empresa,
        string $origemType,
        int $origemId,
        ?string $origemNumero,
        string $descricao,
        string $valorTotal,
        string $valorImposto,
        string $valorBase,
        ?Carbon $pagoEm = null,
        array $meta = [],
    ): ?AfiliadoComissao {
        if (! $empresa || ! $this->config->programaActivo()) {
            return null;
        }
        if (AfiliadoComissao::where('origem_type', $origemType)->where('origem_id', $origemId)->exists()) {
            return null; // já registada (webhook duplicado / reprocessamento)
        }
        if (! $this->afiliados->atribuicaoValida($empresa)) {
            return null;
        }
        $af = Afiliado::find($empresa->afiliado_id);
        if (! $af || ! $af->estaActivo()) {
            return null;
        }

        $valorBase = $this->dec($valorBase);
        if (bccomp($valorBase, '0.00', 2) <= 0) {
            return null;
        }

        $taxa = $this->afiliados->taxaEfectiva($af);
        $valorComissao = bcdiv(bcmul($valorBase, $taxa, 4), '100', 2);
        $carencia = max(0, $this->config->int('afiliado_carencia_dias'));
        $agora = now();
        $aprovada = $carencia === 0;

        $c = AfiliadoComissao::create([
            'afiliado_id' => $af->id,
            'empresa_gestora_id' => $empresa->id,
            'origem_type' => $origemType,
            'origem_id' => $origemId,
            'origem_numero' => $origemNumero,
            'descricao' => Str::limit($descricao, 250, ''),
            'valor_pago_total_kz' => $this->dec($valorTotal),
            'valor_imposto_kz' => $this->dec($valorImposto),
            'valor_base_kz' => $valorBase,
            'taxa_pct' => $taxa,
            'valor_comissao_kz' => $valorComissao,
            'nivel' => $af->nivel,
            'estado' => $aprovada ? AfiliadoComissao::ESTADO_APROVADA : AfiliadoComissao::ESTADO_PENDENTE,
            'pago_pelo_cliente_em' => $pagoEm ?? $agora,
            'disponivel_em' => $agora->copy()->addDays($carencia)->toDateString(),
            'aprovada_em' => $aprovada ? $agora : null,
            'meta_json' => $meta + ['cliente' => $empresa->nome],
        ]);

        Log::info('Comissão de afiliado registada', [
            'comissao_id' => $c->id, 'afiliado_id' => $af->id, 'empresa_id' => $empresa->id,
            'origem' => $origemType.'#'.$origemId, 'base' => $valorBase, 'taxa' => $taxa, 'comissao' => $valorComissao,
        ]);

        try {
            $this->afiliados->recalcularNivel($af);
        } catch (\Throwable $e) {
            Log::warning('Afiliados: recalcular nível falhou: '.$e->getMessage());
        }
        try {
            $af->loadMissing('user');
            $af->user?->notify(new AfiliadoComissaoCreditadaNotification($c));
        } catch (\Throwable $e) {
            Log::warning('Afiliados: notificação de comissão falhou: '.$e->getMessage());
        }

        return $c;
    }

    // -----------------------------------------------------------------
    // Estados
    // -----------------------------------------------------------------

    public function aprovar(AfiliadoComissao $c, ?int $adminId = null): void
    {
        if ($c->estado !== AfiliadoComissao::ESTADO_PENDENTE) {
            return;
        }
        $meta = $c->meta_json ?? [];
        if ($adminId) {
            $meta['aprovada_por_user_id'] = $adminId;
        }
        $c->update([
            'estado' => AfiliadoComissao::ESTADO_APROVADA,
            'aprovada_em' => now(),
            'meta_json' => $meta,
        ]);
    }

    /** Cron diário: comissões cuja carência terminou passam a aprovadas. */
    public function aprovarVencidas(): int
    {
        $n = 0;
        AfiliadoComissao::where('estado', AfiliadoComissao::ESTADO_PENDENTE)
            ->whereDate('disponivel_em', '<=', now()->toDateString())
            ->orderBy('id')
            ->chunkById(200, function ($lote) use (&$n) {
                foreach ($lote as $c) {
                    $this->aprovar($c);
                    $n++;
                }
            });

        return $n;
    }

    public function anular(AfiliadoComissao $c, string $motivo, ?int $adminId = null): void
    {
        if ($c->estado === AfiliadoComissao::ESTADO_PAGA) {
            throw new \RuntimeException('Uma comissão já paga não pode ser anulada.');
        }
        if ($c->estado === AfiliadoComissao::ESTADO_ANULADA) {
            return;
        }
        $meta = $c->meta_json ?? [];
        $meta['anulada_por_user_id'] = $adminId;
        $c->update([
            'estado' => AfiliadoComissao::ESTADO_ANULADA,
            'anulada_em' => now(),
            'motivo_anulacao' => Str::limit($motivo, 250, ''),
            'meta_json' => $meta,
        ]);
        $af = $c->afiliado;
        if ($af) {
            $this->afiliados->recalcularNivel($af);
        }
    }

    public function anularPorOrigem(string $origemType, int $origemId, string $motivo, ?int $adminId = null): void
    {
        $c = AfiliadoComissao::where('origem_type', $origemType)->where('origem_id', $origemId)->first();
        if ($c && $c->estado !== AfiliadoComissao::ESTADO_PAGA) {
            $this->anular($c, $motivo, $adminId);
        }
    }

    // -----------------------------------------------------------------
    // Pagamento ao afiliado (lote de comissões aprovadas)
    // -----------------------------------------------------------------

    public function registarPagamento(
        Afiliado $af,
        array $comissaoIds,
        array $dados,
        int $adminId,
        ?UploadedFile $comprovativo = null,
    ): AfiliadoPagamento {
        $comissaoIds = array_values(array_unique(array_map('intval', $comissaoIds)));

        return DB::transaction(function () use ($af, $comissaoIds, $dados, $adminId, $comprovativo) {
            $comissoes = AfiliadoComissao::where('afiliado_id', $af->id)
                ->whereIn('id', $comissaoIds)
                ->where('estado', AfiliadoComissao::ESTADO_APROVADA)
                ->lockForUpdate()
                ->get();

            if ($comissoes->isEmpty()) {
                throw new \RuntimeException('Nenhuma comissão aprovada seleccionada.');
            }
            if ($comissoes->count() !== count($comissaoIds)) {
                throw new \RuntimeException('Algumas comissões seleccionadas já não estão aprovadas (foram pagas ou anuladas entretanto).');
            }

            $bruto = '0.00';
            foreach ($comissoes as $c) {
                $bruto = bcadd($bruto, $this->dec($c->valor_comissao_kz), 2);
            }
            $retPct = $this->dec($dados['retencao_pct'] ?? $this->config->get('afiliado_retencao_pct'));
            if ((float) $retPct < 0 || (float) $retPct > 100) {
                throw new \RuntimeException('Retenção inválida (0 a 100%).');
            }
            $retVal = bcdiv(bcmul($bruto, $retPct, 4), '100', 2);
            $liquido = bcsub($bruto, $retVal, 2);

            $path = $nome = $mime = null;
            if ($comprovativo) {
                $ext = strtolower($comprovativo->getClientOriginalExtension() ?: 'pdf');
                $path = $comprovativo->storeAs(
                    'afiliados/comprovativos',
                    'AFP-'.now()->format('YmdHis').'-'.Str::random(6).'.'.$ext,
                    'local',
                );
                $nome = Str::limit($comprovativo->getClientOriginalName(), 140, '');
                $mime = $comprovativo->getMimeType();
            }

            $p = AfiliadoPagamento::create([
                'afiliado_id' => $af->id,
                'numero' => $this->gerarNumeroPagamento(),
                'num_comissoes' => $comissoes->count(),
                'valor_bruto_kz' => $bruto,
                'retencao_pct' => $retPct,
                'retencao_valor_kz' => $retVal,
                'valor_liquido_kz' => $liquido,
                'metodo' => $dados['metodo'] ?? 'transferencia_bancaria',
                'referencia_bancaria' => $dados['referencia_bancaria'] ?? null,
                'iban_destino' => $dados['iban_destino'] ?? $af->iban,
                'comprovativo_path' => $path,
                'comprovativo_nome' => $nome,
                'comprovativo_mime' => $mime,
                'pago_em' => $dados['pago_em'] ?? now()->toDateString(),
                'notas' => $dados['notas'] ?? null,
                'registado_por_user_id' => $adminId,
            ]);

            AfiliadoComissao::whereIn('id', $comissoes->pluck('id'))->update([
                'estado' => AfiliadoComissao::ESTADO_PAGA,
                'paga_em' => now(),
                'afiliado_pagamento_id' => $p->id,
                'updated_at' => now(),
            ]);

            Log::info('Pagamento a afiliado registado', [
                'pagamento_id' => $p->id, 'numero' => $p->numero, 'afiliado_id' => $af->id,
                'bruto' => $bruto, 'retencao' => $retVal, 'liquido' => $liquido, 'n' => $comissoes->count(),
            ]);

            try {
                $af->loadMissing('user');
                $af->user?->notify(new AfiliadoPagamentoEfectuadoNotification($p));
            } catch (\Throwable $e) {
                Log::warning('Afiliados: notificação de pagamento falhou: '.$e->getMessage());
            }

            return $p;
        });
    }

    public function gerarNumeroPagamento(): string
    {
        $ano = now()->year;
        $ultimo = AfiliadoPagamento::where('numero', 'like', "AFP/{$ano}/%")->orderByDesc('id')->value('numero');
        $seq = 1;
        if ($ultimo && preg_match('/\/(\d+)$/', $ultimo, $m)) {
            $seq = (int) $m[1] + 1;
        }

        return sprintf('AFP/%d/%05d', $ano, $seq);
    }

    /** Normaliza qualquer valor monetário para string com 2 casas (bcmath). */
    public function dec(mixed $v): string
    {
        $s = str_replace([',', ' '], ['.', ''], trim((string) ($v ?? '0')));
        if ($s === '' || ! is_numeric($s)) {
            $s = '0';
        }

        return bcadd($s, '0', 2);
    }
}
