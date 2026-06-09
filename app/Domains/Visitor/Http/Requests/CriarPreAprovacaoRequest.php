<?php

declare(strict_types=1);

namespace App\Domains\Visitor\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CriarPreAprovacaoRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Autenticação é feita pelo middleware auth:sanctum nas rotas.
        // Autorização fina (condomino só para sua fraccao) é feita no Service.
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'fraccao_id' => ['required', 'integer', 'exists:fraccoes,id'],
            'nome_visitante' => ['required', 'string', 'min:2', 'max:150'],
            'telefone_visitante' => ['required', 'string', 'min:9', 'max:20'],
            'valida_ate' => ['required', 'date', 'after:now'],
            'valida_desde' => ['nullable', 'date', 'before:valida_ate'],
            'observacoes' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'fraccao_id.required' => 'Indique a fracção a visitar.',
            'fraccao_id.exists' => 'Fracção não encontrada.',
            'nome_visitante.required' => 'Indique o nome do visitante.',
            'nome_visitante.min' => 'Nome do visitante deve ter pelo menos 2 caracteres.',
            'telefone_visitante.required' => 'Indique o telefone do visitante.',
            'valida_ate.required' => 'Indique até quando é válida a autorização.',
            'valida_ate.after' => 'A data de validade deve estar no futuro.',
            'valida_desde.before' => 'A data de início deve ser anterior à data de fim.',
        ];
    }
}
