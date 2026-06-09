<?php

declare(strict_types=1);

namespace App\Domains\Visitor\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EntradaManualRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'fraccao_id' => ['required', 'integer', 'exists:fraccoes,id'],
            'nome_visitante' => ['required', 'string', 'min:2', 'max:150'],
            'telefone_visitante' => ['nullable', 'string', 'min:9', 'max:20'],
            'bi_numero' => ['nullable', 'string', 'max:30'],
            'observacoes' => ['required', 'string', 'min:5', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'observacoes.required' => 'Entrada manual obriga a justificação (motivo).',
            'observacoes.min' => 'Justificação deve ter pelo menos 5 caracteres.',
        ];
    }
}
