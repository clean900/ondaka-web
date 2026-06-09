<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegistoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tipo_cliente' => 'required|in:empresa_gestora,admin_independente',
            'nome_empresa' => 'required|string|max:255',
            'documento_tipo' => 'required|in:NIF,BI,PASSAPORTE',
            'documento_numero' => 'required|string|max:50',
            'nome_completo_responsavel' => 'nullable|string|max:255',
            'provincia' => 'required|string|max:100',
            'municipio' => 'required|string|max:100',
            'telefone' => 'required|string|max:20',
            'email_contacto' => 'required|email|max:255',
            'user_nome' => 'required|string|max:255',
            'user_email' => 'required|email|max:255|unique:users,email',
            'user_password' => 'required|string|min:8|confirmed',
            'aceita_termos' => 'required|accepted',
        ];
    }

    public function messages(): array
    {
        return [
            'tipo_cliente.required' => 'Selecione o tipo de cliente.',
            'tipo_cliente.in' => 'Tipo de cliente inválido.',
            'nome_empresa.required' => 'O nome da empresa/responsável é obrigatório.',
            'documento_numero.required' => 'O número do documento é obrigatório.',
            'documento_tipo.in' => 'Tipo de documento inválido.',
            'email_contacto.email' => 'Email de contacto inválido.',
            'user_email.unique' => 'Já existe uma conta com este email.',
            'user_password.min' => 'A password deve ter pelo menos 8 caracteres.',
            'user_password.confirmed' => 'As passwords não coincidem.',
            'aceita_termos.accepted' => 'Deve aceitar os Termos e Condições.',
        ];
    }
}
