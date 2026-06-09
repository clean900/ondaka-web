<?php

declare(strict_types=1);

namespace App\Domains\Notifications\Services;

use App\Domains\Notifications\Models\DeviceToken;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Envia push notifications via Firebase Cloud Messaging HTTP v1 API.
 *
 * Requer credencial JSON em config('services.fcm.service_account_path').
 */
class FcmSenderService
{
    /**
     * Envia notificação a um user (todos os seus devices).
     */
    public function enviarParaUser(User $user, string $titulo, string $corpo, array $data = []): int
    {
        $tokens = DeviceToken::where('user_id', $user->id)->pluck('token')->toArray();

        if (empty($tokens)) {
            Log::info("[FCM] User {$user->id} sem device tokens registados.");
            return 0;
        }

        $accessToken = $this->obterAccessToken();
        if (! $accessToken) {
            Log::warning('[FCM] Sem access token, push abortado.');
            return 0;
        }

        $projectId = config('services.fcm.project_id', 'ondaka-prod');
        $url = "https://fcm.googleapis.com/v1/projects/{$projectId}/messages:send";

        $enviados = 0;
        foreach ($tokens as $token) {
            try {
                $response = Http::withToken($accessToken)
                    ->timeout(10)
                    ->post($url, [
                        'message' => [
                            'token' => $token,
                            'notification' => [
                                'title' => $titulo,
                                'body' => $corpo,
                            ],
                            ...(empty($data) ? [] : ['data' => array_map('strval', $data)]),
                            'android' => [
                                'priority' => 'HIGH',
                                'notification' => [
                                    'channel_id' => 'ondaka_default',
                                ],
                            ],
                        ],
                    ]);

                if ($response->successful()) {
                    $enviados++;
                } else {
                    Log::warning('[FCM] Push falhou', [
                        'status' => $response->status(),
                        'body' => $response->body(),
                    ]);
                    // Token inválido → apagar
                    if ($response->status() === 404) {
                        DeviceToken::where('token', $token)->delete();
                    }
                }
            } catch (Throwable $e) {
                Log::error('[FCM] Excepção ao enviar push: ' . $e->getMessage());
            }
        }

        return $enviados;
    }

    /**
     * Obtém access token OAuth2 do Firebase usando credencial JSON.
     * Cacheado por 50 min (tokens expiram em 60 min).
     */
    private function obterAccessToken(): ?string
    {
        return cache()->remember('fcm_access_token', now()->addMinutes(50), function () {
            $path = config('services.fcm.service_account_path');
            if (! $path || ! file_exists($path)) {
                Log::warning('[FCM] service_account_path não configurado ou ficheiro inexistente.');
                return null;
            }

            $credentials = json_decode(file_get_contents($path), true);
            $now = time();
            $jwt = $this->criarJwt($credentials, $now);

            $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
                'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                'assertion' => $jwt,
            ]);

            if (! $response->successful()) {
                Log::error('[FCM] Falha a obter access token: ' . $response->body());
                return null;
            }

            return $response->json('access_token');
        });
    }

    /**
     * Cria JWT assinado com a service account para trocar por access token.
     */
    private function criarJwt(array $credentials, int $now): string
    {
        $header = base64_encode(json_encode([
            'alg' => 'RS256',
            'typ' => 'JWT',
        ]));

        $payload = base64_encode(json_encode([
            'iss' => $credentials['client_email'],
            'scope' => 'https://www.googleapis.com/auth/firebase.messaging',
            'aud' => 'https://oauth2.googleapis.com/token',
            'iat' => $now,
            'exp' => $now + 3600,
        ]));

        $signatureBase = "$header.$payload";
        $signature = '';
        openssl_sign($signatureBase, $signature, $credentials['private_key'], 'sha256WithRSAEncryption');
        $signatureEncoded = base64_encode($signature);

        return "$header.$payload.$signatureEncoded";
    }
}
