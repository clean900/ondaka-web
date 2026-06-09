<?php

namespace App\Domains\Familiar\Models;

use App\Domains\Condomino\Models\Condomino;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Familiar extends Model
{
    use SoftDeletes;

    protected $table = 'familiares';

    protected $fillable = [
        'condomino_id', 'user_id', 'nome', 'parentesco',
        'telefone', 'email', 'acessos', 'ativo',
    ];

    protected $casts = [
        'acessos' => 'array',
        'ativo' => 'boolean',
    ];

    // Acessos disponiveis (NUNCA inclui dinheiro/taxas).
    public const ACESSOS_DISPONIVEIS = [
        'avisos', 'portaria', 'visitas', 'pedidos',
        'sos', 'reservas', 'marketplace', 'equipa',
    ];

    public function titular()
    {
        return $this->belongsTo(Condomino::class, 'condomino_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function podeAceder(string $area): bool
    {
        $acessos = $this->acessos ?? [];
        return in_array($area, $acessos, true);
    }
}
