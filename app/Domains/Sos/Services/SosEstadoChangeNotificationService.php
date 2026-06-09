<?php

declare(strict_types=1);

namespace App\Domains\Sos\Services;

use App\Domains\Notifications\Services\FcmSenderService;
use App\Domains\Sos\Catalog\TiposSos;
use App\Domains\Sos\Models\SosAlerta;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Notifica o autor do SOS (condómino) quando o estado muda.
 * Eventos: atendido, resolvido.
 */
class SosEstadoChangeNotificationService
{
    public function __construct(protected FcmSenderService $fcmSender) {}

    /**
     * Notifica o condómino sobre mudança de estado.
     *
     * @param  SosAlerta  $alerta  com estado já actualizado
     * @param  string  $novoEstado  'atendido' | 'resolvido' | 'falso_alarme'
     * @param  User|null  $quemMudou  quem fez a acção (para incluir o nome)
     */
    public function notificarAutor(SosAlerta $alerta, string $novoEstado, ?User $quemMudou = null): int
    {
        try {
            $autor = User::find($alerta->user_id);
            if (! $autor) return 0;

            // Não notificar para 'falso_alarme' (seria deselegante)
            if ($novoEstado === 'falso_alarme') return 0;

            $tipoInfo = TiposSos::todos()[$alerta->tipo] ?? null;
            $tipoLabel = $tipoInfo['label'] ?? $alerta->tipo;
            $condominio = $alerta->condominio()->first();
            $condominioNome = $condominio?->nome ?? 'Condomínio';
            $quemNome = $quemMudou?->name ?? 'A equipa';

            $titulo = match ($novoEstado) {
                'atendido'  => "🚨 Ajuda a caminho!",
                'resolvido' => "✅ Alerta resolvido",
                default     => "Alerta SOS",
            };

            $corpo = match ($novoEstado) {
                'atendido'  => "{$quemNome} está a tratar do seu pedido ({$tipoLabel}) no {$condominioNome}.",
                'resolvido' => "O seu SOS ({$tipoLabel}) no {$condominioNome} foi resolvido por {$quemNome}.",
                default     => $tipoLabel,
            };

            $data = [
                'tipo' => 'sos_estado_change',
                'sos_id' => (string) $alerta->id,
                'novo_estado' => $novoEstado,
            ];

            $enviados = $this->fcmSender->enviarParaUser($autor, $titulo, $corpo, $data);

            Log::info('[SOS] Notificação estado para autor', [
                'alerta_id' => $alerta->id,
                'autor_id' => $autor->id,
                'novo_estado' => $novoEstado,
                'envios_fcm' => $enviados,
            ]);

            return $enviados;
        } catch (Throwable $e) {
            Log::error('[SOS] Erro ao notificar autor', [
                'alerta_id' => $alerta->id,
                'erro' => $e->getMessage(),
            ]);
            return 0;
        }
    }
}
