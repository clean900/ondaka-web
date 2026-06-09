<?php

declare(strict_types=1);

namespace App\Domains\Checklist\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChecklistItem extends Model
{
    use HasFactory;
    protected $table = 'checklist_itens';
    protected $fillable = ['modelo_id', 'texto', 'ordem', 'obrigatorio'];
    protected $casts = ['ordem' => 'integer', 'obrigatorio' => 'boolean'];

    public function modelo(): BelongsTo
    {
        return $this->belongsTo(ChecklistModelo::class, 'modelo_id');
    }
}
