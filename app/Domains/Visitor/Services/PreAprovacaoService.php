<?php

declare(strict_types=1);

namespace App\Domains\Visitor\Services;

use App\Domains\Condomino\Models\Condomino;
use App\Domains\Empresa\Models\EmpresaGestora;
use App\Domains\Integracao\Sms\Exceptions\SmsException;
use App\Domains\Integracao\Sms\Services\SmsService;
use App\Domains\Visitor\Models\PreAprovacao;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use InvalidArgumentException;

/**
 * Service de Pré-Aprovações de Visitantes.
 *
 * Responsável por:
 * - Criar pré-aprovações para visitas futuras
 * - Gerar QR token + OTP únicos
 * - Enviar SMS ao visitante com os códigos
 * - Cancelar pré-aprovações pendentes
 */
class PreAprovacaoService
{
    public function __construct(
        protected SmsService $smsService,
    ) {}

    /**
     * Cria uma pré-aprovação para um visitante.
     *
     * @param Condomino $condomino Quem está a aprovar
     * @param int $fraccaoId Fracção que o visitante vai visitar
     * @param string $nomeVisitante Nome completo do visitante
     * @param string $telefoneVisitante Telefone do visitante (para SMS)
     * @param Carbon $validaAte Até quando a pré-aprovação é válida
     * @param Carbon|null $validaDesde A partir de quando (null = imediatamente)
     * @param string|null $observacoes Notas do condómino
     * @param array|null $horarios Add-on #9: restrição de horário recorrente
     * @param array|null $areas Add-on #9: áreas autorizadas (informativo)
     *
     * @throws InvalidArgumentException Se condómino não tem acesso à fracção
     */
    public function criar(
        Condomino $condomino,
        int $fraccaoId,
        string $nomeVisitante,
        string $telefoneVisitante,
        Carbon $validaAte,
        ?Carbon $validaDesde = null,
        ?string $observacoes = null,
        ?array $horarios = null,
        ?array $areas = null,
    ): PreAprovacao {
        // 1. Validação: condómino está associado à fracção?
        $this->validarAcessoFraccao($condomino, $fraccaoId);

        // 2. Validação: janela temporal faz sentido?
        if ($validaAte->isPast()) {
            throw new InvalidArgumentException(
                'A data de validade não pode estar no passado.'
            );
        }

        if ($validaDesde !== null && $validaDesde->gte($validaAte)) {
            throw new InvalidArgumentException(
                'A data de início deve ser anterior à data de fim.'
            );
        }

        // 3. Criação atómica (DB transaction)
        return DB::transaction(function () use (
            $condomino, $fraccaoId, $nomeVisitante, $telefoneVisitante,
            $validaDesde, $validaAte, $observacoes, $horarios, $areas,
        ) {
            $preAprovacao = PreAprovacao::create([
                'empresa_gestora_id' => $condomino->empresa_gestora_id,
                'condomino_id' => $condomino->id,
                'fraccao_id' => $fraccaoId,
                'nome_visitante' => $nomeVisitante,
                'telefone_visitante' => $telefoneVisitante,
                'qr_token' => $this->gerarQrToken(),
                'otp_code' => $this->gerarOtpCode(),
                'valida_desde' => $validaDesde,
                'valida_ate' => $validaAte,
                'horarios_json' => ! empty($horarios) ? array_values($horarios) : null,
                'areas_json' => ! empty($areas) ? array_values($areas) : null,
                'estado' => PreAprovacao::ESTADO_PENDENTE,
                'observacoes' => $observacoes,
                'sms_enviado' => false,
            ]);

            // 4. Enviar SMS (fora da transação crítica seria melhor,
            // mas assim garantimos consistência dos dados se falhar)
            $this->enviarSmsVisitante($preAprovacao);

            return $preAprovacao->fresh();
        });
    }

    /**
     * Cancela uma pré-aprovação pendente.
     */
    public function cancelar(PreAprovacao $preAprovacao, Condomino $condomino): void
    {
        if ($preAprovacao->condomino_id !== $condomino->id) {
            throw new InvalidArgumentException(
                'Apenas o condómino que criou pode cancelar a pré-aprovação.'
            );
        }

        if ($preAprovacao->estado !== PreAprovacao::ESTADO_PENDENTE) {
            throw new InvalidArgumentException(
                'Só é possível cancelar pré-aprovações pendentes.'
            );
        }

        $preAprovacao->update([
            'estado' => PreAprovacao::ESTADO_CANCELADA,
        ]);
    }

    /* ======================================================
       PRIVADOS
       ====================================================== */

    private function validarAcessoFraccao(Condomino $condomino, int $fraccaoId): void
    {
        // Assumimos que existe relação 'fraccoes' via contratos de ocupação
        // Se não houver, lançar excepção
        $temAcesso = $condomino->contratosActivos()
            ->where('fraccao_id', $fraccaoId)
            ->exists();

        if (! $temAcesso) {
            throw new InvalidArgumentException(
                'O condómino não tem acesso à fracção indicada.'
            );
        }
    }

    private function gerarQrToken(): string
    {
        // 32 chars, URL-safe, praticamente impossível colidir
        do {
            $token = Str::random(32);
        } while (PreAprovacao::where('qr_token', $token)->exists());

        return $token;
    }

    private function gerarOtpCode(): string
    {
        // 6 dígitos numéricos — fáceis de ler em voz alta
        return str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
    }

    private function enviarSmsVisitante(PreAprovacao $preAprovacao): void
    {
        $empresa = EmpresaGestora::find($preAprovacao->empresa_gestora_id);

        if (! $empresa) {
            Log::warning('[Visitor] EmpresaGestora não encontrada para pré-aprovação', [
                'pre_aprovacao_id' => $preAprovacao->id,
                'empresa_gestora_id' => $preAprovacao->empresa_gestora_id,
            ]);
            return;
        }

        // F-VISIT-01: usa o nome do condominio em vez de 'ONDAKA'
        $nomeCondominio = $preAprovacao->fraccao?->condominio?->nome ?? 'Condominio';

        $mensagem = sprintf(
            '%s: Visita pre-aprovada. Codigo %s ate %s. Use codigo ou QR na portaria.',
            $nomeCondominio,
            $preAprovacao->otp_code,
            $preAprovacao->valida_ate->format('d/m H:i'),
        );

        try {
            $this->smsService->enviarComFallback(
                owner: $empresa,
                numero: $preAprovacao->telefone_visitante,
                mensagem: $mensagem,
                contexto: [
                    'categoria' => 'notificacao',
                    'trigger' => 'pre_aprovacao_criada',
                    'user_id' => $preAprovacao->condomino->user_id ?? null,
                    'condominio_id' => $preAprovacao->fraccao?->condominio_id,
                ],
            );

            $preAprovacao->update([
                'sms_enviado' => true,
                'sms_enviado_em' => now(),
            ]);
        } catch (SmsException $e) {
            // SMS falhou — regista no log mas não faz rollback
            // A pré-aprovação ainda existe; condómino pode partilhar o código manualmente
            Log::warning('[Visitor] SMS falhou para pré-aprovação', [
                'pre_aprovacao_id' => $preAprovacao->id,
                'telefone' => $preAprovacao->telefone_visitante,
                'erro' => $e->getMessage(),
            ]);
        }
    }
}
