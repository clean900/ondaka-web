<?php

declare(strict_types=1);

namespace App\Domains\Feature\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class FeatureUsage extends Model
{
    use HasFactory;

    protected $table = 'feature_usage';

    public $timestamps = false; // só created_at (useCurrent)

    protected $fillable = [
        'subscription_id', 'quantidade', 'acao', 'descricao',
        'referenciavel_type', 'referenciavel_id',
        'user_id', 'saldo_depois', 'metadata',
    ];

    protected $casts = [
        'quantidade' => 'integer',
        'saldo_depois' => 'integer',
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(FeatureSubscription::class, 'subscription_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function referenciavel(): MorphTo
    {
        return $this->morphTo();
    }
}
