<?php

namespace App\Domains\Chatbot\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatbotPergunta extends Model
{
    use HasFactory;

    protected $table = 'chatbot_perguntas';

    protected $fillable = [
        'categoria_id',
        'pergunta',
        'resposta',
        'palavras_chave',
        'role_filter',
        'ordem',
        'activa',
        'formato',
    ];

    protected $casts = [
        'palavras_chave' => 'array',
        'role_filter' => 'array',
        'ordem' => 'integer',
        'activa' => 'boolean',
    ];

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(ChatbotCategoria::class, 'categoria_id');
    }
}
