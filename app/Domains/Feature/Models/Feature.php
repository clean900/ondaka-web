<?php

declare(strict_types=1);

namespace App\Domains\Feature\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Feature extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'features';

    protected $fillable = [
        'slug', 'nome', 'descricao', 'icone', 'categoria',
        'comprador', 'modelo_cobranca', 'unidade',
        'preco_base', 'duracao_dias', 'preco_activacao',
        'configuracao_schema',
        'activa', 'em_breve', 'requer_aprovacao_manual', 'requer_hardware',
        'ordem_listagem',
    ];

    protected $casts = [
        'preco_base' => 'decimal:2',
        'preco_activacao' => 'decimal:2',
        'duracao_dias' => 'integer',
        'configuracao_schema' => 'array',
        'activa' => 'boolean',
        'em_breve' => 'boolean',
        'requer_aprovacao_manual' => 'boolean',
        'requer_hardware' => 'boolean',
        'ordem_listagem' => 'integer',
    ];

    public function pacotes(): HasMany
    {
        return $this->hasMany(FeaturePacote::class)
            ->where('activo', true)
            ->orderBy('ordem');
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(FeatureSubscription::class);
    }

    public function ehConsumivel(): bool
    {
        return $this->modelo_cobranca === 'consumable';
    }

    public function ehSubscricao(): bool
    {
        return $this->modelo_cobranca === 'subscription';
    }

    public function ehUnica(): bool
    {
        return $this->modelo_cobranca === 'one_time';
    }

    public function disponivelParaCompra(): bool
    {
        return $this->activa && ! $this->em_breve;
    }

    public function getCategoriaLabelAttribute(): string
    {
        return match ($this->categoria) {
            'comunicacao' => 'Comunicação',
            'pagamentos' => 'Pagamentos',
            'seguranca' => 'Segurança',
            'gestao' => 'Gestão avançada',
            'personalizacao' => 'Personalização',
            default => 'Outros',
        };
    }

    public function getModeloCobrancaLabelAttribute(): string
    {
        return match ($this->modelo_cobranca) {
            'subscription' => 'Subscrição',
            'one_time' => 'Compra única',
            'consumable' => 'Consumível',
            default => '—',
        };
    }

    public function getCompradorLabelAttribute(): string
    {
        return match ($this->comprador) {
            'empresa_gestora' => 'Empresa',
            'condominio' => 'Condomínio',
            'ambos' => 'Empresa ou condomínio',
            default => '—',
        };
    }
}
