<?php

declare(strict_types=1);

namespace App\Domains\Tickets\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ComentarTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'mensagem' => ['required', 'string', 'min:2', 'max:5000'],
            'publico'  => ['nullable', 'boolean'],
        ];
    }
}
