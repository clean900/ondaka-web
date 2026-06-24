<?php

declare(strict_types=1);

namespace App\Domains\Assembleia\Services;

/**
 * Gera tokens JWT (HS256) para o servidor de vídeo próprio (video.ondaka.ao).
 * Feito à mão para não depender de bibliotecas — o Jitsi (prosody token auth)
 * só precisa de um JWT HS256 com os claims certos.
 */
class JitsiTokenService
{
    /**
     * @param array{id?:mixed,name?:string,email?:string} $user
     */
    public function gerar(string $room, array $user, bool $moderator = false, int $ttlSegundos = 14400): string
    {
        $secret = (string) config('services.jitsi.jwt_secret');
        $appId = (string) config('services.jitsi.jwt_app_id');
        $now = time();

        $header = ['alg' => 'HS256', 'typ' => 'JWT'];
        $payload = [
            'iss' => $appId,
            'aud' => $appId,
            'sub' => '*',
            'room' => $room,
            'iat' => $now,
            'nbf' => $now - 5,
            'exp' => $now + $ttlSegundos,
            'moderator' => $moderator,
            'context' => [
                'user' => [
                    'id' => (string) ($user['id'] ?? ''),
                    'name' => (string) ($user['name'] ?? 'Convidado'),
                    'email' => (string) ($user['email'] ?? ''),
                    'moderator' => $moderator ? 'true' : 'false',
                ],
            ],
        ];

        $segments = [
            $this->b64url((string) json_encode($header)),
            $this->b64url((string) json_encode($payload)),
        ];
        $signingInput = implode('.', $segments);
        $signature = hash_hmac('sha256', $signingInput, $secret, true);
        $segments[] = $this->b64url($signature);

        return implode('.', $segments);
    }

    /** URL completo da sala com o token anexado. */
    public function urlComToken(string $room, array $user, bool $moderator = false): string
    {
        $base = rtrim((string) config('services.jitsi.base_url'), '/');
        $token = $this->gerar($room, $user, $moderator);

        return "{$base}/{$room}?jwt={$token}";
    }

    private function b64url(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}
