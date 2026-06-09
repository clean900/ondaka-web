<?php

declare(strict_types=1);

namespace App\Domains\Checklist\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ChecklistModelo extends Model
{
    use HasFactory, SoftDeletes;
    protected $table = 'checklist_modelos';
    protected $fillable = ['empresa_gestora_id', 'condominio_id', 'nome', 'descricao', 'tipo', 'activo'];
    protected $casts = ['activo' => 'boolean'];

    public function itens(): HasMany
    {
        return $this->hasMany(ChecklistItem::class, 'modelo_id')->orderBy('ordem');
    }
    public function execucoes(): HasMany
    {
        return $this->hasMany(ChecklistExecucao::class, 'modelo_id');
    }
}
