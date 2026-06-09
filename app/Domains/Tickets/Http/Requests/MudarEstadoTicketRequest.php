<?php

declare(strict_types=1);

namespace App\Domains\Tickets\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MudarEstadoTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAnyRole([
            'super-admin', 'admin-empresa', 'gestor', 'administrador-condominio',
        ]) ?? false;
    }

    public function rules(): array
    {
        return [
            'estado'     => [
                'required',
                'string',
                'in:aberto,em_analise,em_curso,resolvido,fechado,cancelado',
            ],
            'observacao' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
