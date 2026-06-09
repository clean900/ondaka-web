<?php

namespace App\Domains\Encomenda\Models;

use App\Domains\Condominio\Models\Condominio;
use App\Domains\Condomino\Models\Condomino;
use App\Domains\Condominio\Models\Fraccao;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property int $condominio_id
 * @property int $fraccao_id
 * @property int $condomino_id
 * @property string $descricao
 * @property string|null $remetente
 * @property string|null $notas_guarda
 * @property string $estado
 * @property string $origem
 * @property string $local_atual
 * @property \Carbon\Carbon|null $janela_inicio
 * @property \Carbon\Carbon|null $janela_fim
 * @property \Carbon\Carbon|null $chegou_em
 * @property int|null $recebida_por_user_id
 * @property string|null $foto_path
 * @property \Carbon\Carbon|null $aviso_5_dias_em
 * @property \Carbon\Carbon|null $levantada_em
 * @property string|null $levantada_por
 * @property int|null $entregue_por_user_id
 * @property \Carbon\Carbon|null $multa_aplicada_em
 * @property float|null $multa_valor_kz
 * @property string|null $multa_estado
 * @property string|null $multa_pago_via
 * @property \Carbon\Carbon|null $multa_pago_em
 * @property string|null $multa_pago_observacoes
 */
class Encomenda extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'encomendas';

    // Estados
    public const ESTADO_AGUARDA_CHEGADA = 'aguarda_chegada';
    public const ESTADO_AGUARDA_LEVANTAMENTO = 'aguarda_levantamento';
    public const ESTADO_ENTREGUE = 'entregue';
    public const ESTADO_MULTA_APLICADA = 'multa_aplicada';
    public const ESTADO_CANCELADA = 'cancelada';

    // Origens
    public const ORIGEM_PRE_ANUNCIADA = 'pre_anunciada';
    public const ORIGEM_SEM_AVISO = 'sem_aviso';

    // Locais
    public const LOCAL_PORTARIA = 'portaria';
    public const LOCAL_ADMINISTRACAO = 'administracao';
    public const LOCAL_ENTREGUE = 'entregue';

    // Estados da multa
    public const MULTA_PENDENTE = 'pendente';
    public const MULTA_PAGA = 'paga';
    public const MULTA_DESBLOQUEADA = 'desbloqueada';

    // Vias de pagamento
    public const PAGO_VIA_PROXYPAY = 'proxypay';
    public const PAGO_VIA_EXTRACTO = 'extracto';
    public const PAGO_VIA_DINHEIRO = 'dinheiro';

    protected $fillable = [
        'condominio_id', 'fraccao_id', 'condomino_id',
        'descricao', 'remetente', 'notas_guarda',
        'estado', 'origem', 'local_atual',
        'janela_inicio', 'janela_fim',
        'chegou_em', 'recebida_por_user_id', 'foto_path',
        'aviso_5_dias_em',
        'levantada_em', 'levantada_por', 'entregue_por_user_id',
        'multa_aplicada_em', 'multa_valor_kz',
        'multa_estado', 'multa_pago_via', 'multa_pago_em', 'multa_pago_observacoes',
    ];

    protected $casts = [
        'janela_inicio' => 'datetime',
        'janela_fim' => 'datetime',
        'chegou_em' => 'datetime',
        'aviso_5_dias_em' => 'datetime',
        'levantada_em' => 'datetime',
        'multa_aplicada_em' => 'datetime',
        'multa_pago_em' => 'datetime',
        'multa_valor_kz' => 'decimal:2',
    ];

    // ===== Relações =====

    public function condominio(): BelongsTo
    {
        return $this->belongsTo(Condominio::class);
    }

    public function fraccao(): BelongsTo
    {
        return $this->belongsTo(Fraccao::class);
    }

    public function condomino(): BelongsTo
    {
        return $this->belongsTo(Condomino::class);
    }

    public function recebidaPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recebida_por_user_id');
    }

    public function entreguePor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'entregue_por_user_id');
    }

    // ===== Scopes =====

    public function scopeDoCondominio(Builder $q, int $condominioId): Builder
    {
        return $q->where('condominio_id', $condominioId);
    }

    public function scopeNaPortaria(Builder $q): Builder
    {
        return $q->where('estado', self::ESTADO_AGUARDA_LEVANTAMENTO);
    }

    public function scopeAguardandoChegada(Builder $q): Builder
    {
        return $q->where('estado', self::ESTADO_AGUARDA_CHEGADA);
    }

    public function scopeComMultaPendente(Builder $q): Builder
    {
        return $q->where('estado', self::ESTADO_MULTA_APLICADA)
                 ->where('multa_estado', self::MULTA_PENDENTE);
    }

    // ===== Helpers =====

    public function diasNaPortaria(): int
    {
        if (! $this->chegou_em) return 0;
        return (int) $this->chegou_em->diffInDays(now());
    }

    public function precisaAvisoCincoDias(int $diasAviso = 5, int $diasMulta = 7): bool
    {
        if ($this->estado !== self::ESTADO_AGUARDA_LEVANTAMENTO) return false;
        if ($this->aviso_5_dias_em) return false;
        if (! $this->chegou_em) return false;

        $dias = $this->diasNaPortaria();
        return $dias >= $diasAviso && $dias < $diasMulta;
    }

    public function precisaAplicarMulta(int $diasMulta = 7): bool
    {
        if ($this->estado !== self::ESTADO_AGUARDA_LEVANTAMENTO) return false;
        if (! $this->chegou_em) return false;
        return $this->diasNaPortaria() >= $diasMulta;
    }
}
