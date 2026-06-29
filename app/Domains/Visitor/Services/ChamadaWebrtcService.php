<?php

declare(strict_types=1);

namespace App\Domains\Visitor\Services;

use App\Domains\Condominio\Models\Fraccao;
use App\Domains\Condomino\Models\Condomino;
use App\Domains\Notifications\Services\FcmSenderService;
use App\Models\User;
use Illuminate\Support\Str;

/**
 * Orquestração de chamadas de voz WebRTC (coturn + signaling no VPS).
 * Matriz: morador↔guarda↔gestor (todos ligam a todos entre os 3 papéis).
 *  - condomino  → portaria (guardas de serviço), gestor
 *  - guarda     → morador (escolhe imóvel), gestor
 *  - gestor     → portaria (guardas), morador (escolhe imóvel)
 */
class ChamadaWebrtcService
{
    public function __construct(private FcmSenderService $fcm) {}

    private const MATRIZ = [
        'condomino' => ['portaria', 'gestor'],
        'guarda' => ['morador', 'gestor'],
        'gestor' => ['portaria', 'morador'],
    ];

    public function destinosPermitidos(string $papel): array
    {
        return self::MATRIZ[$papel] ?? [];
    }

    public function papel(User $u): string
    {
        if ($u->hasAnyRole(['guarda', 'funcionario'])) return 'guarda';
        if ($u->hasRole('gestor') || $u->hasRole('administrador-condominio') || $u->hasRole('admin-empresa')) return 'gestor';
        return 'condomino';
    }

    /** ICE servers (STUN + TURN com credencial temporária HMAC do coturn). */
    public function iceServers(): array
    {
        $secret = (string) config('services.webrtc.turn_secret');
        $host = (string) config('services.webrtc.turn_host');
        $ttl = (int) config('services.webrtc.turn_ttl');
        $username = (time() + $ttl) . ':ondaka';
        $credential = base64_encode(hash_hmac('sha1', $username, $secret, true));

        return [
            ['urls' => config('services.webrtc.stun')],
            [
                'urls' => ["turn:{$host}?transport=udp", "turn:{$host}?transport=tcp"],
                'username' => $username,
                'credential' => $credential,
            ],
        ];
    }

    public function signalingUrl(string $room, int|string $uid): string
    {
        $base = rtrim((string) config('services.webrtc.signaling_url'), '/');
        return "{$base}/?token=" . $this->signalingToken($room, $uid);
    }

    private function signalingToken(string $room, int|string $uid): string
    {
        $secret = (string) config('services.webrtc.signaling_secret');
        $now = time();
        $seg = [
            $this->b64((string) json_encode(['alg' => 'HS256', 'typ' => 'JWT'])),
            $this->b64((string) json_encode(['room' => $room, 'uid' => (string) $uid, 'iat' => $now, 'exp' => $now + 3600])),
        ];
        $seg[] = $this->b64(hash_hmac('sha256', implode('.', $seg), $secret, true));
        return implode('.', $seg);
    }

    private function condominioDoUser(User $u): ?int
    {
        if ($u->hasRole('condomino')) {
            $c = Condomino::where('user_id', $u->id)->first();
            $contrato = $c?->contratosActivos()->with('fraccao:id,condominio_id')->first();
            return $contrato?->fraccao?->condominio_id;
        }
        return $u->condominio_activo_id ? (int) $u->condominio_activo_id : null;
    }

    /** @return array{0: \Illuminate\Support\Collection, 1: string, 2: ?string} [destinatarios, nomeDestino, erro] */
    private function resolver(User $caller, string $destino, ?int $fraccaoId): array
    {
        $empresa = $caller->empresa_gestora_id;

        if ($destino === 'morador') {
            if (! $fraccaoId) return [collect(), '', 'Escolha o imóvel.'];
            $fraccao = Fraccao::where('empresa_gestora_id', $empresa)->find($fraccaoId);
            $contrato = $fraccao?->contratosActivos()->with('condomino.user')->first();
            $user = $contrato?->condomino?->user;
            if (! $user) return [collect(), '', 'Imóvel sem morador com app.'];
            $nome = $contrato->condomino->nome_comercial ?: ($contrato->condomino->nome_completo ?: 'Morador');
            return [collect([$user]), $nome, null];
        }

        if ($destino === 'portaria') {
            $condominioId = $this->condominioDoUser($caller);
            $guardas = User::where('empresa_gestora_id', $empresa)
                ->when($condominioId, fn ($q) => $q->where('condominio_activo_id', $condominioId))
                ->whereHas('roles', fn ($q) => $q->whereIn('name', ['guarda', 'funcionario']))
                ->get();
            return [$guardas, 'Portaria', null];
        }

        if ($destino === 'gestor') {
            // Mesmas roles que papel() considera "gestor" (inclui admin-empresa).
            $gestores = User::where('empresa_gestora_id', $empresa)
                ->whereHas('roles', fn ($q) => $q->whereIn('name', ['gestor', 'administrador-condominio', 'admin-empresa']))
                ->get();
            return [$gestores, 'Gestão', null];
        }

        return [collect(), '', 'Destino inválido.'];
    }

    private function nomeChamador(User $caller, string $papel): string
    {
        if ($papel === 'guarda') return 'Portaria';
        if ($papel === 'gestor') return ($caller->name ?: 'Gestão') . ' (Gestão)';
        $c = Condomino::where('user_id', $caller->id)->first();
        return $c?->nome_comercial ?: ($c?->nome_completo ?: ($caller->name ?: 'Morador'));
    }

    /**
     * Inicia a chamada: valida a matriz, resolve quem atende, envia push e
     * devolve a config do chamador (sala + signaling + ICE).
     */
    public function iniciar(User $caller, string $destino, ?int $fraccaoId): array
    {
        $papel = $this->papel($caller);
        if (! in_array($destino, $this->destinosPermitidos($papel), true)) {
            return ['ok' => false, 'erro' => 'Destino não permitido para o seu perfil.'];
        }

        [$callees, $nomeDestino, $erro] = $this->resolver($caller, $destino, $fraccaoId);
        if ($erro) return ['ok' => false, 'erro' => $erro];
        if ($callees->isEmpty()) return ['ok' => false, 'erro' => 'Ninguém disponível para atender.'];

        $room = 'call-' . Str::random(20);
        $ice = $this->iceServers();
        $quemLiga = $this->nomeChamador($caller, $papel);
        $iceJson = (string) json_encode($ice);

        foreach ($callees as $u) {
            $this->fcm->enviarParaUser(
                $u,
                'Chamada recebida',
                "{$quemLiga} está a ligar",
                [
                    'tipo' => 'chamada_recebida',
                    'modo' => 'webrtc',
                    'room' => $room,
                    'signaling_url' => $this->signalingUrl($room, $u->id),
                    'ice_servers' => $iceJson,
                    'quem_liga' => $quemLiga,
                    'origem' => $papel,
                ],
                'ondaka_chamada',
                null,
                true,
            );
        }

        return [
            'ok' => true,
            'room' => $room,
            'signaling_url' => $this->signalingUrl($room, $caller->id),
            'ice_servers' => $ice,
            'destino' => $nomeDestino,
        ];
    }

    private function b64(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}
