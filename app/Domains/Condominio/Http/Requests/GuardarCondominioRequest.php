<?php

declare(strict_types=1);

namespace App\Domains\Condominio\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GuardarCondominioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can(
            $this->isMethod('POST') ? 'condominios.criar' : 'condominios.editar'
        );
    }

    public function rules(): array
    {
        $condominioId = $this->route('condominio')?->id;

        return [
            'nome' => ['required', 'string', 'max:150'],
            'codigo' => [
                'required', 'string', 'max:20', 'regex:/^[A-Z0-9\-]+$/',
                Rule::unique('condominios', 'codigo')->ignore($condominioId),
            ],
            'tipo' => ['required', Rule::in(['vertical', 'horizontal', 'misto', 'loteamento'])],
            'numero_blocos_previsto' => ['nullable', 'integer', 'min:1', 'max:999'],
            'tem_area_comercial' => ['nullable', 'boolean'],
            'nif' => ['nullable', 'string', 'max:20'],
            'morada' => ['required', 'string', 'max:500'],
            'provincia' => ['required', 'string', 'max:50'],
            'municipio' => ['required', 'string', 'max:100'],
            'distrito_urbano' => ['nullable', 'string', 'max:100'],
            'bairro' => ['nullable', 'string', 'max:100'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'data_constituicao' => ['nullable', 'date', 'before_or_equal:today'],
            'numero_matricula' => ['nullable', 'string', 'max:50'],
            'conservatoria' => ['nullable', 'string', 'max:100'],
            'iban' => ['nullable', 'string', 'max:34'],
            'banco' => ['nullable', 'string', 'max:100'],
            'moeda' => ['required', 'string', 'size:3'],
            'ucf_valor_actual' => ['nullable', 'numeric', 'min:0'],
            'percentagem_fundo_reserva' => ['required', 'numeric', 'min:10', 'max:100'],
            'estado' => ['required', Rule::in(['activo', 'inactivo', 'arquivado'])],
        ];
    }

    public function messages(): array
    {
        return [
            'percentagem_fundo_reserva.min' => 'Conforme DP 141/15 Art. 20, o fundo de reserva mínimo é 10%.',
            'codigo.regex' => 'O código deve conter apenas letras maiúsculas, números e hífens.',
            'tipo.required' => 'Indique o tipo de empreendimento.',
            'tipo.in' => 'Tipo inválido. Deve ser Vertical, Horizontal, Misto ou Loteamento.',
        ];
    }
}
