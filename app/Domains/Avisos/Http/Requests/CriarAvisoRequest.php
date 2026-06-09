<?php

declare(strict_types=1);

namespace App\Domains\Avisos\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CriarAvisoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'condominio_ids' => ['required', 'array', 'min:1'],
            'condominio_ids.*' => ['integer', 'exists:condominios,id'],
            'titulo' => ['required', 'string', 'min:5', 'max:200'],
            'descricao' => ['required', 'string', 'min:10', 'max:50000'],
            'categoria' => ['nullable', 'string', 'in:geral,manutencao,reuniao,urgente,evento,aviso_legal,outro'],
            'prioridade' => ['nullable', 'string', 'in:baixa,media,alta,urgente'],
            'publicar_em' => ['nullable', 'date', 'after_or_equal:now'],
            'arquivar_em' => ['nullable', 'date', 'after:publicar_em'],
            'permite_comentarios' => ['nullable', 'boolean'],
            'requer_confirmacao' => ['nullable', 'boolean'],
            'notificar_push' => ['nullable', 'boolean'],
            'notificar_email' => ['nullable', 'boolean'],
            'notificar_sms' => ['nullable', 'boolean'],

            // Segmentações: pelo menos 1 obrigatória
            'segmentacoes' => ['required', 'array', 'min:1'],
            'segmentacoes.*.tipo' => ['required', 'string', 'in:todos,fraccao,bloco,grupo'],
            'segmentacoes.*.alvo_id' => ['nullable', 'integer'],
            'segmentacoes.*.valor_texto' => ['nullable', 'string', 'max:100'],

            // Anexos opcionais
            'anexos' => ['nullable', 'array', 'max:5'],
            'anexos.*' => ['file', 'max:10240', 'mimes:pdf,jpg,jpeg,png,doc,docx,xls,xlsx'],
        ];
    }
}
