<?php

declare(strict_types=1);

namespace App\Domains\Empresa\Services;

use App\Domains\Condomino\Models\Condomino;
use App\Domains\Familiar\Support\CondominoResolver;
use App\Domains\Empresa\Models\EmpresaGestora;
use App\Models\User;

/**
 * Service para resolver os contactos de suporte que o condómino vê na app.
 *
 * Resolve: User logado → Condomino → EmpresaGestora → contactos
 */
class ContactosSuporteService
{
    /**
     * Devolve contactos da empresa gestora associada ao user logado (condómino).
     *
     * @return array{
     *   nome: string,
     *   logotipo_url: ?string,
     *   email: ?string,
     *   telefone: ?string,
     *   whatsapp: ?string,
     *   morada: ?string,
     *   horario_atendimento: ?string,
     *   configurado: bool
     * }|null
     */
    public function obterParaUser(User $user): ?array
    {
        $condomino = CondominoResolver::paraUser($user);
        if (! $condomino) {
            return null;
        }

        $empresa = EmpresaGestora::find($condomino->empresa_gestora_id);
        if (! $empresa) {
            return null;
        }

        // "Configurado" = tem pelo menos 1 dos 3 canais principais
        $configurado = !empty($empresa->whatsapp_suporte)
            || !empty($empresa->email_contacto)
            || !empty($empresa->telefone);

        return [
            'nome' => $empresa->nome,
            'logotipo_url' => $empresa->logotipo_path
                ? '/ficheiros/' . $empresa->logotipo_path
                : null,
            'email' => $empresa->email_contacto ?: null,
            'telefone' => $empresa->telefone ?: null,
            'whatsapp' => $empresa->whatsapp_suporte ?: null,
            'morada' => $empresa->morada ?: null,
            'horario_atendimento' => $empresa->horario_atendimento ?: null,
            'configurado' => $configurado,
        ];
    }
}
