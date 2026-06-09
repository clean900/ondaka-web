<?php

declare(strict_types=1);

namespace App\Domains\Condomino\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GuardarContratoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fraccao_id' => ['required', 'integer', 'exists:fraccoes,id'],
            'tipo' => ['required', Rule::in(['proprietario', 'inquilino', 'usufructo', 'cedencia'])],
            'percentagem_propriedade' => ['nullable', 'numeric', 'min:0.01', 'max:100'],

            'data_inicio' => ['required', 'date'],
            'data_fim' => ['nullable', 'date', 'after:data_inicio'],

            'numero_contrato' => ['nullable', 'string', 'max:50'],
            'data_contrato' => ['nullable', 'date'],

            // Só relevante para inquilinos
            'valor_renda_mensal' => ['nullable', 'numeric', 'min:0'],
            'proprietario_id' => ['nullable', 'integer', 'exists:condominos,id'],

            'responsavel_facturacao' => ['nullable', 'boolean'],
            'recebe_comunicacoes' => ['nullable', 'boolean'],

            'observacoes' => ['nullable', 'string', 'max:2000'],
            'estado' => ['nullable', Rule::in(['activo', 'terminado', 'suspenso'])],
        ];
    }

    public function messages(): array
    {
        return [
            'fraccao_id.required' => 'Selecione a fracção associada ao contrato.',
            'fraccao_id.exists' => 'Fracção inválida.',
            'tipo.required' => 'Indique o tipo de ocupação.',
            'data_inicio.required' => 'Data de início é obrigatória.',
            'data_fim.after' => 'Data de fim tem de ser depois da data de início.',
            'percentagem_propriedade.max' => 'A percentagem de propriedade não pode exceder 100%.',
        ];
    }
}
