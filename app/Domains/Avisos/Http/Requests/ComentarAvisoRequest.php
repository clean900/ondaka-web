<?php

declare(strict_types=1);

namespace App\Domains\Avisos\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ComentarAvisoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'mensagem' => ['required', 'string', 'min:1', 'max:5000'],
            'parent_id' => ['nullable', 'integer', 'exists:aviso_comentarios,id'],
        ];
    }
}
