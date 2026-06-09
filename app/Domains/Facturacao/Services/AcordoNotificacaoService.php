<?php

namespace App\Domains\Facturacao\Services;

use App\Domains\Facturacao\Models\AcordoPagamento;
use App\Domains\Facturacao\Notifications\AcordoDialogoNotification;
use App\Domains\Notifications\Services\FcmSenderService;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AcordoNotificacaoService
{
    public function __construct(protected FcmSenderService $fcm) {}

    /**
     * O condomino propos/contraproposou -> avisar a gestao (gestores da empresa).
     */
    public function avisarGestor(AcordoPagamento $acordo, string $titulo, string $mensagem): void
    {
        // Destinatarios: utilizadores gestores/admin da empresa gestora do acordo
        $gestores = User::where('empresa_gestora_id', $acordo->empresa_gestora_id)
            ->whereHas('roles', fn ($q) => $q->whereIn('name', ['super-admin', 'admin-empresa', 'gestor']))
            ->get();

        foreach ($gestores as $g) {
            $this->enviar($g, $titulo, $mensagem, '/acordos');
        }
    }

    /**
     * A gestao respondeu -> avisar o condomino.
     */
    public function avisarCondomino(AcordoPagamento $acordo, string $titulo, string $mensagem): void
    {
        $condomino = \App\Domains\Condomino\Models\Condomino::find($acordo->condomino_id);
        $user = $condomino ? User::find($condomino->user_id) : null;
        if ($user) {
            $this->enviar($user, $titulo, $mensagem, '/acordos');
        }
    }

    private function enviar(User $user, string $titulo, string $mensagem, string $url): void
    {
        // 1) Sino (in-app, tabela notifications)
        try {
            $user->notify(new AcordoDialogoNotification(0, $titulo, $mensagem, $url));
        } catch (\Throwable $e) {
            Log::warning("[AcordoNotif] Sino falhou user {$user->id}: " . $e->getMessage());
        }
        // 2) Push (FCM)
        try {
            $this->fcm->enviarParaUser($user, $titulo, $mensagem, ['tipo' => 'acordo_dialogo']);
        } catch (\Throwable $e) {
            Log::warning("[AcordoNotif] Push falhou user {$user->id}: " . $e->getMessage());
        }
        // 3) Email
        if ($user->email) {
            try {
                $dados = [
                    'assunto' => $titulo . ' · ONDAKA',
                    'titulo' => $titulo,
                    'corpo' => $mensagem,
                    'saudacao' => 'Caro(a) ' . $user->name . ',',
                    'badge' => '🤝 Acordo',
                ];
                Mail::send('emails.notificacao', $dados, function ($m) use ($user, $titulo) {
                    $m->to($user->email, $user->name)->subject($titulo . ' · ONDAKA');
                });
            } catch (\Throwable $e) {
                Log::warning("[AcordoNotif] Email falhou {$user->email}: " . $e->getMessage());
            }
        }
    }
}
