<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CodigoVerificacaoSms extends Model
{
    protected $table = 'codigos_verificacao_sms';

    protected $fillable = [
        'user_id', 'codigo_hash', 'telefone', 'proposito',
        'tentativas', 'expira_em', 'usado_em', 'ip_solicitacao',
    ];

    protected $casts = [
        'expira_em' => 'datetime',
        'usado_em' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
