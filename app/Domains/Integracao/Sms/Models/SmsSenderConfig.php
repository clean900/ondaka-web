<?php

declare(strict_types=1);

namespace App\Domains\Integracao\Sms\Models;

use App\Domains\Condominio\Models\Condominio;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SmsSenderConfig extends Model
{
    use HasFactory;

    protected $table = 'sms_sender_configs';

    protected $fillable = [
        'condominio_id',
        'sender_name',
        'api_key',
        'estado',
    ];

    public function condominio(): BelongsTo
    {
        return $this->belongsTo(Condominio::class);
    }

    public function estaConfigurado(): bool
    {
        return $this->estado === 'configurado' && ! empty($this->api_key);
    }
}
