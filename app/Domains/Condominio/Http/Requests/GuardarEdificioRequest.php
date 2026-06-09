<?php

declare(strict_types=1);

namespace App\Domains\Condominio\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GuardarEdificioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can(
            $this->isMethod('POST') ? 'edificios.criar' : 'edificios.editar'
        );
    }

    public function rules(): array
    {
        $edificioId = $this->route('edificio')?->id;
        $condominioId = (int) ($this->route('condominio')?->id ?? $this->input('condominio_id'));

        return [
            'condominio_id' => ['required', 'exists:condominios,id'],
            'nome' => ['required', 'string', 'max:100'],
            'codigo' => [
                'required', 'string', 'max:20', 'regex:/^[A-Z0-9\-]+$/',
                Rule::unique('edificios', 'codigo')
                    ->where('condominio_id', $condominioId)
                    ->ignore($edificioId),
            ],
            'tipo_bloco' => ['required', Rule::in(['torre', 'conjunto', 'comercial', 'empresarial', 'loteamento'])],
            'numero_pisos' => ['nullable', 'integer', 'min:1', 'max:100'],
            'pisos_subsolo' => ['nullable', 'integer', 'min:0', 'max:20'],
            'tem_elevador' => ['nullable', 'boolean'],
            'numero_elevadores' => ['nullable', 'integer', 'min:0', 'max:50'],
            'descricao' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'tipo_bloco.required' => 'Indique o tipo de bloco.',
            'codigo.regex' => 'O código deve conter apenas letras maiúsculas, números e hífens.',
        ];
    }
}
