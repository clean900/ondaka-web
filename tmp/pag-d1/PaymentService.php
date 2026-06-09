<?php

declare(strict_types=1);

namespace App\Domains\Payment\Services;

use App\Domains\Payment\Models\OrdemCompra;
use App\Domains\Payment\Models\Pagamento;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PaymentService
{
    public function __construct(
        protected OrderService $orderService,
    ) {}

    /**
     * Cliente regista pagamento (com upload de comprovativo).
     * Devolve o Pagamento criado.
     */
    public function registarPagamento(
        OrdemCompra $ordem,
        array $dados,
        ?UploadedFile $comprovativo,
        ?int $userId = null,
    ): Pagamento {
        // Não aceitar pagamentos em ordens fechadas
        if (in_array($ordem->estado, ['aprovada', 'rejeitada', 'cancelada', 'expirada'])) {
            throw new \RuntimeException("Não é possível registar pagamento numa ordem {$ordem->estado_label}.");
        }

        return DB::transaction(function () use ($ordem, $dados, $comprovativo, $userId) {
            $caminho = null;
            $nomeOriginal = null;
            $mime = null;
            $tamanho = null;

            if ($comprovativo) {
                $nomeOriginal = $comprovativo->getClientOriginalName();
                $mime = $comprovativo->getMimeType();
                $tamanho = $comprovativo->getSize();

                $extensao = $comprovativo->getClientOriginalExtension() ?: 'bin';
                $nomeFicheiro = 'comp_'.now()->format('YmdHis').'_'.uniqid().'.'.$extensao;

                // Guardar em storage/app/comprovativos/{ano}/{mes}/
                $pasta = 'comprovativos/'.now()->format('Y/m');
                $caminho = $comprovativo->storeAs($pasta, $nomeFicheiro, 'local');
            }

            $pagamento = Pagamento::create([
                'referencia' => $this->gerarReferencia(),
                'ordem_compra_id' => $ordem->id,
                'metodo' => $dados['metodo'] ?? 'transferencia_bancaria',
                'valor' => (float) $dados['valor'],
                'moeda' => $dados['moeda'] ?? 'AOA',
                'referencia_externa' => $dados['referencia_externa'] ?? null,
                'data_transacao' => $dados['data_transacao'] ?? null,
                'banco_origem' => $dados['banco_origem'] ?? null,
                'conta_origem' => $dados['conta_origem'] ?? null,
                'nome_ordenante' => $dados['nome_ordenante'] ?? null,
                'comprovativo_path' => $caminho,
                'comprovativo_original_name' => $nomeOriginal,
                'comprovativo_mime' => $mime,
                'comprovativo_tamanho_bytes' => $tamanho,
                'estado' => 'registado',
                'notas' => $dados['notas'] ?? null,
                'registado_por_user_id' => $userId,
            ]);

            // Marcar ordem como em_revisao quando chega 1º pagamento
            if ($ordem->estado === 'pendente') {
                $this->orderService->marcarEmRevisao($ordem);
            }

            return $pagamento;
        });
    }

    /**
     * Super-admin confirma pagamento.
     * Se ordem estiver totalmente paga, aprova automaticamente.
     */
    public function confirmarPagamento(
        Pagamento $pagamento,
        int $adminUserId,
        ?string $notas = null,
    ): Pagamento {
        if ($pagamento->estado === 'confirmado') {
            throw new \RuntimeException('Pagamento já confirmado.');
        }

        return DB::transaction(function () use ($pagamento, $adminUserId, $notas) {
            $pagamento->update([
                'estado' => 'confirmado',
                'confirmado_em' => now(),
                'confirmado_por_user_id' => $adminUserId,
                'notas' => $notas ? trim(($pagamento->notas ?? '') . "\n[Confirmação] " . $notas) : $pagamento->notas,
            ]);

            // Recarregar ordem para re-calcular totais
            $ordem = $pagamento->ordem()->first();
            if ($ordem && $ordem->estaTotalmentePaga() && ! $ordem->estaAprovada()) {
                $this->orderService->aprovar(
                    $ordem,
                    $adminUserId,
                    'Aprovação automática após confirmação de pagamento(s).',
                );
            }

            return $pagamento->fresh();
        });
    }

    /**
     * Super-admin rejeita pagamento (ex: comprovativo falso).
     */
    public function rejeitarPagamento(
        Pagamento $pagamento,
        int $adminUserId,
        string $motivo,
    ): Pagamento {
        if ($pagamento->estado === 'rejeitado') {
            throw new \RuntimeException('Pagamento já rejeitado.');
        }

        $pagamento->update([
            'estado' => 'rejeitado',
            'rejeitado_em' => now(),
            'confirmado_por_user_id' => $adminUserId,
            'motivo_rejeicao' => $motivo,
        ]);

        return $pagamento->fresh();
    }

    /**
     * Gera referência única de pagamento: PAG-2026-000001
     */
    public function gerarReferencia(): string
    {
        $ano = now()->year;
        $ultimo = Pagamento::where('referencia', 'LIKE', "PAG-{$ano}-%")
            ->orderByDesc('id')
            ->value('referencia');

        $seq = 1;
        if ($ultimo && preg_match('/-(\d+)$/', $ultimo, $m)) {
            $seq = (int) $m[1] + 1;
        }

        return sprintf('PAG-%d-%06d', $ano, $seq);
    }

    /**
     * URL temporário para download do comprovativo.
     */
    public function urlComprovativo(Pagamento $pagamento): ?string
    {
        if (! $pagamento->comprovativo_path) {
            return null;
        }

        // Storage local - gerar URL através de route protegida
        return route('pagamentos.comprovativo', ['pagamento' => $pagamento->id]);
    }

    /**
     * Valida extensão/tipo/tamanho do comprovativo.
     * Chamado antes de storeAs.
     */
    public static function validarComprovativo(UploadedFile $f): array
    {
        $erros = [];

        $tamanhoMaximo = 5 * 1024 * 1024; // 5MB
        if ($f->getSize() > $tamanhoMaximo) {
            $erros[] = 'Ficheiro excede 5MB.';
        }

        $mimesPermitidos = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/webp',
        ];

        if (! in_array($f->getMimeType(), $mimesPermitidos)) {
            $erros[] = 'Apenas PDF, JPG, PNG ou WEBP permitidos.';
        }

        return $erros;
    }
}
