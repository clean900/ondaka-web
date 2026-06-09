<?php

declare(strict_types=1);

namespace App\Domains\Visitor\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ValidarQrRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'qr_token' => ['required', 'string', 'min:16', 'max:64'],
        ];
    }

    public function messages(): array
    {
        return [
            'qr_token.required' => 'Código QR em falta.',
            'qr_token.min' => 'Código QR inválido.',
        ];
    }
}
