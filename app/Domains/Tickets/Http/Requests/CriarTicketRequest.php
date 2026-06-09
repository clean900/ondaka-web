<?php

declare(strict_types=1);

namespace App\Domains\Tickets\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CriarTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Descarta o slug legacy 'categoria' se 'categoria_id' (FK) foi fornecido.
     * Evita conflito entre o sistema dinamico de categorias (BD) e o ENUM legacy.
     */
    protected function prepareForValidation(): void
    {
        if ($this->filled('categoria_id') && $this->filled('categoria')) {
            $this->request->remove('categoria');
        }
    }

    public function rules(): array
    {
        return [
            'condominio_id' => ['required', 'integer', 'exists:condominios,id'],
            'fraccao_id'    => ['nullable', 'integer', 'exists:fraccoes,id'],
            'titulo'        => ['required', 'string', 'min:5', 'max:200'],
            'descricao'     => ['required', 'string', 'min:10', 'max:5000'],
            'tipo'          => ['required', 'string', 'in:particular,publico'],
            'categoria_id'  => ['nullable', 'integer', 'exists:categorias_pedido,id'],
            'categoria'     => [
                'nullable',
                'required_without:categoria_id',
                'string',
                'in:manutencao,limpeza,seguranca,ruido,agua,electricidade,jardim,estacionamento,reclamacao,sugestao,outro',
            ],
            'prioridade'    => ['nullable', 'string', 'in:baixa,media,alta,urgente'],
            'fotos'         => ['nullable', 'array', 'max:5'],
            'fotos.*'       => ['file', 'image', 'max:5120'], // 5MB
        ];
    }

    public function messages(): array
    {
        return [
            'titulo.min'       => 'O título deve ter pelo menos 5 caracteres.',
            'descricao.min'    => 'A descrição deve ter pelo menos 10 caracteres.',
            'fotos.max'        => 'Máximo 5 fotos por ticket.',
            'fotos.*.image'    => 'Cada ficheiro deve ser uma imagem.',
            'fotos.*.max'      => 'Cada foto não pode exceder 5MB.',
        ];
    }
}
