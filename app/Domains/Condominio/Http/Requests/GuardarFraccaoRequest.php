<?php

declare(strict_types=1);

namespace App\Domains\Condominio\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GuardarFraccaoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can(
            $this->isMethod('POST') ? 'fraccoes.criar' : 'fraccoes.editar'
        );
    }

    public function rules(): array
    {
        $fraccaoId = $this->route('fraccao')?->id;
        $edificioId = (int) ($this->route('edificio')?->id ?? $this->input('edificio_id'));

        return [
            'edificio_id' => ['required', 'exists:edificios,id'],
            'tipo_fraccao_id' => ['required', 'exists:tipos_fraccao,id'],
            'identificador' => [
                'required', 'string', 'max:20',
                Rule::unique('fraccoes', 'identificador')
                    ->where('edificio_id', $edificioId)
                    ->ignore($fraccaoId),
            ],
            'piso' => ['required', 'integer', 'min:-10', 'max:100'],
            'letra' => ['nullable', 'string', 'max:5'],
            'area_privativa_m2' => ['nullable', 'numeric', 'min:0', 'max:10000'],
            'permilagem' => ['nullable', 'numeric', 'min:0', 'max:1000'],
            'quota_mensal_base' => ['required', 'numeric', 'min:0'],
            'quota_mensal_fundo_reserva' => ['required', 'numeric', 'min:0'],
            'numero_quartos' => ['nullable', 'integer', 'min:0', 'max:50'],
            'numero_casas_banho' => ['nullable', 'integer', 'min:0', 'max:20'],
            'tem_lugar_garagem' => ['boolean'],
            'numero_lugares_garagem' => ['nullable', 'integer', 'min:0', 'max:10'],
            'tem_arrecadacao' => ['boolean'],
            'estado' => ['required', Rule::in(['ocupada', 'vaga', 'obras', 'arrendada'])],
            'observacoes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
