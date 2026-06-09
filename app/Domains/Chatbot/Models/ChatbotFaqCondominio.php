<?php

namespace App\Domains\Chatbot\Models;

use App\Domains\Condominio\Models\Condominio;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatbotFaqCondominio extends Model
{
    use HasFactory;

    protected $table = 'chatbot_faqs_condominio';

    protected $fillable = [
        'condominio_id',
        'criado_por_user_id',
        'categoria',
        'pergunta',
        'resposta',
        'ordem',
        'activa',
        'palavras_chave',
        'formato',
    ];

    protected $casts = [
        'ordem' => 'integer',
        'palavras_chave' => 'array',
        'activa' => 'boolean',
    ];

    public function condominio(): BelongsTo
    {
        return $this->belongsTo(Condominio::class);
    }

    public function criadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'criado_por_user_id');
    }
}
