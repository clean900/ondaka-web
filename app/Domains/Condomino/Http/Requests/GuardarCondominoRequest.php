<?php

declare(strict_types=1);

namespace App\Domains\Condomino\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GuardarCondominoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $condominoId = $this->route('condomino')?->id;
        $tipo = $this->input('tipo', 'singular');

        $rules = [
            'tipo' => ['required', Rule::in(['singular', 'empresa'])],
            'nome_completo' => ['required', 'string', 'max:200'],
            'nome_comercial' => ['nullable', 'string', 'max:200'],

            // Contactos (recomendados)
            'telefone_principal' => ['nullable', 'string', 'max:20'],
            'telefone_alternativo' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:150'],

            // Morada (opcional)
            'morada' => ['nullable', 'string', 'max:500'],
            'provincia' => ['nullable', 'string', 'max:50'],
            'municipio' => ['nullable', 'string', 'max:100'],
            'bairro' => ['nullable', 'string', 'max:100'],

            // Observações
            'observacoes' => ['nullable', 'string', 'max:2000'],
            'estado' => ['nullable', Rule::in(['activo', 'inactivo', 'arquivado'])],

            // Criação opcional de conta de utilizador (só no store, não no update)
            'criar_user' => ['nullable', 'boolean'],
            'password' => ['nullable', 'string', 'min:8', 'max:60', 'required_if:criar_user,true'],
            'must_change_password' => ['nullable', 'boolean'],
        ];

        if ($tipo === 'singular') {
            $rules = array_merge($rules, [
                'numero_bi' => ['nullable', 'string', 'max:20',
                    Rule::unique('condominos', 'numero_bi')
                        ->where('empresa_gestora_id', auth()->user()->empresa_gestora_id ?? null)
                        ->ignore($condominoId),
                ],
                'data_nascimento' => ['nullable', 'date', 'before:today'],
                'genero' => ['nullable', Rule::in(['masculino', 'feminino', 'outro'])],
                'nacionalidade' => ['nullable', 'string', 'max:50'],
                'estado_civil' => ['nullable', Rule::in(['solteiro', 'casado', 'uniao_facto', 'divorciado', 'viuvo'])],
                'profissao' => ['nullable', 'string', 'max:100'],
            ]);
        }

        if ($tipo === 'empresa') {
            $rules = array_merge($rules, [
                'nif' => ['required', 'string', 'max:20',
                    Rule::unique('condominos', 'nif')
                        ->where('empresa_gestora_id', auth()->user()->empresa_gestora_id ?? null)
                        ->ignore($condominoId),
                ],
                'data_constituicao_empresa' => ['nullable', 'date', 'before_or_equal:today'],
                'numero_registo_comercial' => ['nullable', 'string', 'max:50'],

                // Representante legal (recomendado)
                'representante_nome' => ['nullable', 'string', 'max:200'],
                'representante_bi' => ['nullable', 'string', 'max:20'],
                'representante_cargo' => ['nullable', 'string', 'max:100'],
                'representante_telefone' => ['nullable', 'string', 'max:20'],
                'representante_email' => ['nullable', 'email', 'max:150'],
            ]);
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'tipo.required' => 'Indique se é pessoa singular ou empresa.',
            'nome_completo.required' => 'Nome completo é obrigatório.',
            'nif.required' => 'NIF é obrigatório para empresas.',
            'numero_bi.unique' => 'Já existe outro condómino registado com este BI.',
            'nif.unique' => 'Já existe outra empresa registada com este NIF.',
            'email.email' => 'Email inválido.',
            'data_nascimento.before' => 'Data de nascimento tem de ser no passado.',
            'data_constituicao_empresa.before_or_equal' => 'Data de constituição não pode estar no futuro.',
        ];
    }
}
