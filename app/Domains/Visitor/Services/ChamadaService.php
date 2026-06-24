<?php

declare(strict_types=1);

namespace App\Domains\Visitor\Services;

use App\Domains\Assembleia\Services\JitsiTokenService;
use App\Domains\Condominio\Models\Fraccao;
use App\Domains\Condomino\Models\Condomino;
use App\Domains\Notifications\Services\FcmSenderService;
use App\Models\User;
use Illuminate\Support\Str;

/**
 * Chamadas de áudio (voz) entre portaria e condóminos, sobre o servidor de
 * vídeo próprio (video.ondaka.ao) com JWT. Reusa o JitsiTokenService e o FCM.
 * Bidirecional: guarda→condómino e condómino→portaria.
 */
class ChamadaService
{
    public function __construct(
        private JitsiTokenService $jitsi,
        private FcmSenderService $fcm,
    ) {}

    private function novaSala(): string
    {
        return 'ondaka-call-' . Str::random(16);
    }

    private function nomeCondomino(Condomino $c): string
    {
        return $c->nome_comercial ?: ($c->nome_completo ?: 'Morador');
    }

    /**
     * Guarda liga para o condómino residente de uma fração.
     * Devolve ['ok'=>bool,'erro'=>?string,'sala'=>?string,'jitsi_url'=>?string,'destino'=>?string].
     */
    public function guardaParaCondomino(User $guarda, int $fraccaoId): array
    {
        $fraccao = Fraccao::where('empresa_gestora_id', $guarda->empresa_gestora_id)->find($fraccaoId);
        if (! $fraccao) {
            return ['ok' => false, 'erro' => 'Imóvel não encontrado.'];
        }

        $contrato = $fraccao->contratosActivos()->with('condomino.user')->first();
        $condomino = $contrato?->condomino;
        $userCond = $condomino?->user;
        if (! $userCond) {
            return ['ok' => false, 'erro' => 'Este imóvel não tem morador registado com app.'];
        }

        $sala = $this->novaSala();
        $nomeGuarda = $guarda->name ?: 'Portaria';

        // FCM full-screen ao condómino (data-only, com token DELE para atender).
        $this->fcm->enviarParaUser(
            $userCond,
            'Chamada da portaria',
            "{$nomeGuarda} está a ligar",
            [
                'tipo' => 'chamada_recebida',
                'sala' => $sala,
                'jitsi_url' => $this->jitsi->urlComToken($sala, $this->ctx($userCond), false),
                'quem_liga' => $nomeGuarda,
                'origem' => 'portaria',
            ],
            'ondaka_chamada',
            'toque_chamada',
            true,
        );

        return [
            'ok' => true,
            'sala' => $sala,
            'jitsi_url' => $this->jitsi->urlComToken($sala, $this->ctx($guarda), true),
            'destino' => $this->nomeCondomino($condomino),
        ];
    }

    /**
     * Condómino liga para a portaria (toca nos guardas de serviço do condomínio).
     */
    public function condominoParaPortaria(Condomino $condomino, User $userCond): array
    {
        $contrato = $condomino->contratosActivos()->with('fraccao:id,condominio_id')->first();
        $condominioId = $contrato?->fraccao?->condominio_id;
        if (! $condominioId) {
            return ['ok' => false, 'erro' => 'Sem imóvel activo para localizar a portaria.'];
        }

        $guardas = User::where('empresa_gestora_id', $condomino->empresa_gestora_id)
            ->where('condominio_activo_id', $condominioId)
            ->whereHas('roles', fn ($q) => $q->where('name', 'guarda'))
            ->get();

        if ($guardas->isEmpty()) {
            return ['ok' => false, 'erro' => 'Não há portaria de serviço disponível neste momento.'];
        }

        $sala = $this->novaSala();
        $nomeCond = $this->nomeCondomino($condomino);

        foreach ($guardas as $g) {
            $this->fcm->enviarParaUser(
                $g,
                'Chamada de morador',
                "{$nomeCond} está a ligar",
                [
                    'tipo' => 'chamada_recebida',
                    'sala' => $sala,
                    'jitsi_url' => $this->jitsi->urlComToken($sala, $this->ctx($g), true),
                    'quem_liga' => $nomeCond,
                    'origem' => 'condomino',
                ],
                'ondaka_chamada',
                'toque_chamada',
                true,
            );
        }

        return [
            'ok' => true,
            'sala' => $sala,
            'jitsi_url' => $this->jitsi->urlComToken($sala, $this->ctx($userCond), false),
            'destino' => 'Portaria',
        ];
    }

    /** @return array{id:mixed,name:string,email:string} */
    private function ctx(User $u): array
    {
        return ['id' => $u->id, 'name' => $u->name ?? '', 'email' => $u->email ?? ''];
    }
}
