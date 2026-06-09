<?php

namespace App\Domains\Chatbot\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChatbotCategoria extends Model
{
    use HasFactory;

    protected $table = 'chatbot_categorias';

    protected $fillable = [
        'nome',
        'icone',
        'cor',
        'ordem',
    ];

    protected $casts = [
        'ordem' => 'integer',
    ];

    public function perguntas(): HasMany
    {
        return $this->hasMany(ChatbotPergunta::class, 'categoria_id');
    }
}
