<?php

namespace App\Domains\Assembleia\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AssembleiaPontoVotacao extends Model
{
    use HasFactory;

    protected $table = 'assembleia_pontos_votacao';

    protected $fillable = [
        'assembleia_id',
        'ordem',
        'titulo',
        'descricao',
        'estado',
        'aberta_em',
        'fechada_em',
        'aberta_por_user_id',
        'fechada_por_user_id',
        'total_votos_sim',
        'total_votos_nao',
        'total_votos_abstencao',
        'permilagem_sim',
        'permilagem_nao',
        'permilagem_abstencao',
        'resultado',
        'detectado_automaticamente',
    ];

    protected $casts = [
        'aberta_em' => 'datetime',
        'fechada_em' => 'datetime',
        'total_votos_sim' => 'integer',
        'total_votos_nao' => 'integer',
        'total_votos_abstencao' => 'integer',
        'permilagem_sim' => 'decimal:3',
        'permilagem_nao' => 'decimal:3',
        'permilagem_abstencao' => 'decimal:3',
        'detectado_automaticamente' => 'boolean',
    ];

    public function assembleia(): BelongsTo
    {
        return $this->belongsTo(Assembleia::class);
    }

    public function votos(): HasMany
    {
        return $this->hasMany(AssembleiaVoto::class, 'ponto_votacao_id');
    }

    public function estaEmVotacao(): bool
    {
        return $this->estado === 'em_votacao';
    }

    public function estaEncerrado(): bool
    {
        return $this->estado === 'encerrado';
    }

    /**
     * Calcula resultado baseado nos votos actuais.
     * Regra DP 141/15: maioria simples por permilagem.
     */
    public function calcularResultado(): array
    {
        $votos = $this->votos;

        $permSim = $votos->where('opcao', 'sim')->sum('peso_permilagem');
        $permNao = $votos->where('opcao', 'nao')->sum('peso_permilagem');
        $permAbst = $votos->where('opcao', 'abstencao')->sum('peso_permilagem');

        $totalSim = $votos->where('opcao', 'sim')->count();
        $totalNao = $votos->where('opcao', 'nao')->count();
        $totalAbst = $votos->where('opcao', 'abstencao')->count();

        if ($permSim > $permNao) {
            $resultado = 'aprovado';
        } elseif ($permNao > $permSim) {
            $resultado = 'rejeitado';
        } else {
            $resultado = 'empate';
        }

        return [
            'total_votos_sim' => $totalSim,
            'total_votos_nao' => $totalNao,
            'total_votos_abstencao' => $totalAbst,
            'permilagem_sim' => round($permSim, 3),
            'permilagem_nao' => round($permNao, 3),
            'permilagem_abstencao' => round($permAbst, 3),
            'resultado' => $resultado,
        ];
    }
}
