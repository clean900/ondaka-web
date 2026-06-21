<?php

declare(strict_types=1);

namespace App\Domains\Visitor\Services;

use App\Domains\Condomino\Models\Condomino;
use App\Domains\Visitor\Models\PreAprovacao;
use Carbon\Carbon;
use Illuminate\Support\Str;

/**
 * Passe de Visitante (prestadores/trabalhadores) — solicitação pelo condómino,
 * aprovação pelo gestor, geração de QR e extensão de validade.
 * Assenta sobre PreAprovacao (reutiliza qr_token, janela e validação na portaria).
 */
class PasseService
{
    /**
     * Condómino solicita um passe (fica pendente de aprovação do gestor).
     */
    public function solicitar(Condomino $condomino, array $dados): PreAprovacao
    {
        return PreAprovacao::create([
            'empresa_gestora_id' => $condomino->empresa_gestora_id,
            'condomino_id' => $condomino->id,
            'fraccao_id' => $dados['fraccao_id'],
            'tipo_acesso' => $dados['tipo_acesso'],          // prestador|trabalhador|outro
            'nome_visitante' => $dados['nome_visitante'],
            'telefone_visitante' => $dados['telefone_visitante'] ?? null,
            'tipo_documento' => $dados['tipo_documento'] ?? null,
            'numero_documento' => $dados['numero_documento'] ?? null,
            'documento_anexo_path' => $dados['documento_anexo_path'] ?? null,
            'requer_aprovacao' => true,
            'valida_desde' => Carbon::parse($dados['valida_desde']),
            'valida_ate' => Carbon::parse($dados['valida_ate']),
            'estado' => PreAprovacao::ESTADO_PENDENTE,
            'observacoes' => $dados['observacoes'] ?? null,
        ]);
    }

    /**
     * Gestor aprova: gera QR/OTP e activa o passe.
     */
    public function aprovar(PreAprovacao $passe, int $gestorUserId): PreAprovacao
    {
        $passe->update([
            'estado' => PreAprovacao::ESTADO_APROVADO,
            'qr_token' => $this->gerarQrToken(),
            'otp_code' => (string) random_int(100000, 999999),
            'aprovado_por_user_id' => $gestorUserId,
            'aprovado_em' => now(),
        ]);

        return $passe->fresh();
    }

    public function recusar(PreAprovacao $passe, int $gestorUserId, ?string $motivo = null): PreAprovacao
    {
        $passe->update([
            'estado' => PreAprovacao::ESTADO_RECUSADO,
            'aprovado_por_user_id' => $gestorUserId,
            'aprovado_em' => now(),
            'observacoes' => $motivo ?: $passe->observacoes,
        ]);

        return $passe->fresh();
    }

    /**
     * Condómino estende a validade (reactiva se estava expirado).
     */
    public function estender(PreAprovacao $passe, string $novaDataFim): PreAprovacao
    {
        $nova = Carbon::parse($novaDataFim);
        $estado = $passe->estado === PreAprovacao::ESTADO_EXPIRADA
            ? PreAprovacao::ESTADO_APROVADO
            : $passe->estado;

        $passe->update(['valida_ate' => $nova, 'estado' => $estado]);

        return $passe->fresh();
    }

    /**
     * Marca como expirados os passes aprovados cuja validade passou.
     * (chamado por comando diário)
     */
    public function expirarVencidos(): int
    {
        return PreAprovacao::where('estado', PreAprovacao::ESTADO_APROVADO)
            ->whereNotNull('valida_ate')
            ->where('valida_ate', '<', now())
            ->update(['estado' => PreAprovacao::ESTADO_EXPIRADA]);
    }

    private function gerarQrToken(): string
    {
        do {
            $token = Str::random(40);
        } while (PreAprovacao::where('qr_token', $token)->exists());

        return $token;
    }
}
