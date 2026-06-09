<?php

declare(strict_types=1);

namespace App\Domains\Visitor\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ValidarOtpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'otp_code' => ['required', 'string', 'regex:/^[0-9]{6}$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'otp_code.required' => 'Código em falta.',
            'otp_code.regex' => 'Código deve ter 6 dígitos numéricos.',
        ];
    }
}
