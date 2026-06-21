<?php

declare(strict_types=1);

namespace App\Domains\Visitor\Services;

use App\Domains\Visitor\Models\VisitanteBanido;
use Illuminate\Support\Collection;

/**
 * Lista Negra de Visitantes — verificação no check-in e gestão das entradas.
 */
class ListaNegraService
{
    /**
     * Verifica se algum dos dados do visitante está banido neste condomínio
     * (ou na empresa, se a entrada for partilhada). Devolve a 1ª correspondência
     * ou null. NÃO bloqueia — apenas sinaliza para o guarda decidir.
     *
     * @param  array{bi?:?string,matricula?:?string,nome?:?string}  $dados
     */
    public function verificar(int $empresaGestoraId, ?int $condominioId, array $dados): ?VisitanteBanido
    {
        $alvos = [];
        foreach (['bi', 'matricula', 'nome'] as $tipo) {
            $valor = $dados[$tipo] ?? null;
            if (is_string($valor) && trim($valor) !== '') {
                $alvos[$tipo] = VisitanteBanido::normalizar($valor);
            }
        }
        if (empty($alvos)) {
            return null;
        }

        return VisitanteBanido::query()
            ->where('empresa_gestora_id', $empresaGestoraId)
            ->where(function ($q) use ($condominioId) {
                $q->where('partilhar_empresa', true);
                if ($condominioId) {
                    $q->orWhere('condominio_id', $condominioId);
                }
            })
            ->where(function ($q) use ($alvos) {
                foreach ($alvos as $tipo => $valorNorm) {
                    $q->orWhere(fn ($sub) => $sub
                        ->where('tipo', $tipo)
                        ->where('valor_normalizado', $valorNorm));
                }
            })
            ->first();
    }

    /**
     * Versão "rica" para a API: devolve null ou um array pronto para o mobile.
     */
    public function verificarParaApi(int $empresaGestoraId, ?int $condominioId, array $dados): ?array
    {
        $banido = $this->verificar($empresaGestoraId, $condominioId, $dados);
        if (! $banido) {
            return null;
        }

        return [
            'banido' => true,
            'tipo' => $banido->tipo,
            'valor' => $banido->valor,
            'motivo' => $banido->motivo,
            'mensagem' => 'ATENÇÃO: este visitante consta na Lista Negra do condomínio.',
        ];
    }

    public function adicionar(array $dados, int $empresaGestoraId, int $criadoPorUserId): VisitanteBanido
    {
        return VisitanteBanido::create([
            'empresa_gestora_id' => $empresaGestoraId,
            'condominio_id' => $dados['condominio_id'] ?? null,
            'tipo' => $dados['tipo'],
            'valor' => trim($dados['valor']),
            'valor_normalizado' => VisitanteBanido::normalizar($dados['valor']),
            'motivo' => $dados['motivo'] ?? null,
            'partilhar_empresa' => (bool) ($dados['partilhar_empresa'] ?? false),
            'criado_por_user_id' => $criadoPorUserId,
        ]);
    }

    /**
     * @return Collection<int,VisitanteBanido>
     */
    public function listar(int $empresaGestoraId, ?int $condominioId = null): Collection
    {
        return VisitanteBanido::query()
            ->where('empresa_gestora_id', $empresaGestoraId)
            ->when($condominioId, fn ($q) => $q->where(function ($s) use ($condominioId) {
                $s->where('condominio_id', $condominioId)->orWhere('partilhar_empresa', true);
            }))
            ->latest()
            ->get();
    }
}
