<?php

declare(strict_types=1);

namespace App\Domains\Utilizadores\Mail;

use App\Domains\Utilizadores\Models\ConviteUtilizador;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ConviteUtilizadorMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public ConviteUtilizador $convite,
        public string $url,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Foi convidado para o ONDAKA',
            to: [$this->convite->email],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.convite-utilizador',
            with: [
                'nome' => $this->convite->nome,
                'roleNome' => $this->roleAmigavel($this->convite->role_name),
                'url' => $this->url,
                'validadeDias' => 7,
                'convidadoPorNome' => $this->convite->convidadoPor->name ?? 'Administrador',
                'empresaNome' => $this->convite->empresaGestora->nome ?? null,
            ],
        );
    }

    protected function roleAmigavel(string $role): string
    {
        return match ($role) {
            'super-admin' => 'Super Administrador',
            'admin-empresa' => 'Administrador de Empresa',
            'gestor' => 'Gestor de Condomínios',
            'administrador-condominio' => 'Administrador de Condomínio',
            'condomino' => 'Condómino',
            'funcionario' => 'Funcionário',
            'prestador' => 'Prestador de Serviços',
            'guarda' => 'Guarda',
            default => ucfirst($role),
        };
    }
}
