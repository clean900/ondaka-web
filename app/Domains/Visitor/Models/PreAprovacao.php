<?php

declare(strict_types=1);

namespace App\Domains\Visitor\Models;

use App\Domains\Condominio\Models\Fraccao;
use App\Domains\Condomino\Models\Condomino;
use App\Domains\Empresa\Models\EmpresaGestora;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * PreAprovacao — autorização futura criada pelo condómino.
 *
 * Quando um condómino pré-aprova uma visita, é gerado um QR token
 * e um código OTP. Um SMS é enviado ao telefone do visitante com
 * estes códigos. O guarda valida (via QR scan ou OTP verbal) no
 * momento da entrada.
 */
class PreAprovacao extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'pre_aprovacoes';

    protected $fillable = [
        'empresa_gestora_id',
        'condomino_id',
        'fraccao_id',
        'tipo_acesso',
        'nome_visitante',
        'telefone_visitante',
        'tipo_documento',
        'numero_documento',
        'documento_anexo_path',
        'foto_visitante_path',
        'requer_aprovacao',
        'aprovado_por_user_id',
        'aprovado_em',
        'qr_token',
        'otp_code',
        'valida_desde',
        'valida_ate',
        'horarios_json',
        'areas_json',
        'estado',
        'observacoes',
        'sms_enviado',
        'sms_enviado_em',
    ];

    protected $casts = [
        'valida_desde' => 'datetime',
        'valida_ate' => 'datetime',
        'horarios_json' => 'array',
        'areas_json' => 'array',
        'aprovado_em' => 'datetime',
        'requer_aprovacao' => 'boolean',
        'sms_enviado' => 'boolean',
        'sms_enviado_em' => 'datetime',
    ];

    // === Constantes dos estados (evita strings mágicas no código) ===

    public const ESTADO_PENDENTE = 'pendente';
    public const ESTADO_APROVADO = 'aprovado';   // passe aprovado pelo gestor (QR activo)
    public const ESTADO_RECUSADO = 'recusado';
    public const ESTADO_USADA = 'usada';
    public const ESTADO_EXPIRADA = 'expirada';
    public const ESTADO_CANCELADA = 'cancelada';

    /** É um passe (prestador/trabalhador), não uma visita pontual. */
    public function ehPasse(): bool
    {
        return $this->tipo_acesso !== 'visita';
    }

    // === Relações ===

    public function empresaGestora(): BelongsTo
    {
        return $this->belongsTo(EmpresaGestora::class);
    }

    public function condomino(): BelongsTo
    {
        return $this->belongsTo(Condomino::class);
    }

    public function fraccao(): BelongsTo
    {
        return $this->belongsTo(Fraccao::class);
    }

    public function visitas(): HasMany
    {
        return $this->hasMany(Visita::class);
    }

    // === Scopes ===

    /**
     * Apenas pré-aprovações activas (pendentes + dentro da janela temporal).
     */
    public function scopeActivas(Builder $query): Builder
    {
        return $query
            ->where('estado', self::ESTADO_PENDENTE)
            ->where('valida_ate', '>=', now());
    }

    public function scopeParaEmpresa(Builder $query, int $empresaId): Builder
    {
        return $query->where('empresa_gestora_id', $empresaId);
    }

    // === Helpers ===

    public function estaActiva(): bool
    {
        return $this->estado === self::ESTADO_PENDENTE
            && $this->valida_ate->isFuture();
    }

    public function expirou(): bool
    {
        return $this->valida_ate->isPast()
            && $this->estado === self::ESTADO_PENDENTE;
    }

    // === Add-on #9: Acesso por horário/área ===

    /** Tem restrição de horário recorrente definida? */
    public function temRestricaoHorario(): bool
    {
        return is_array($this->horarios_json) && count($this->horarios_json) > 0;
    }

    /** Tem restrição de área/zona definida? */
    public function temRestricaoArea(): bool
    {
        return is_array($this->areas_json) && count($this->areas_json) > 0;
    }

    /**
     * Está dentro do horário permitido neste momento? Sem restrição → sempre true.
     * Regra: { dias: [1..7 ISO], inicio: "HH:MM", fim: "HH:MM" } — basta UMA regra permitir.
     */
    public function dentroDoHorario(?\Illuminate\Support\Carbon $quando = null): bool
    {
        if (! $this->temRestricaoHorario()) {
            return true;
        }
        $quando ??= now();
        $diaIso = $quando->dayOfWeekIso; // 1=segunda ... 7=domingo
        $hora = $quando->format('H:i');

        foreach ($this->horarios_json as $regra) {
            $dias = array_map('intval', (array) ($regra['dias'] ?? []));
            if (! in_array($diaIso, $dias, true)) {
                continue;
            }
            $inicio = $regra['inicio'] ?? null;
            $fim = $regra['fim'] ?? null;
            if ($inicio !== null && $hora < $inicio) {
                continue;
            }
            if ($fim !== null && $hora > $fim) {
                continue;
            }
            return true;
        }

        return false;
    }

    /** Nomes das áreas autorizadas (para mostrar ao guarda). */
    public function areasNomes(): array
    {
        if (! $this->temRestricaoArea()) {
            return [];
        }

        return array_values(array_filter(array_map(
            fn ($a) => is_array($a) ? ($a['nome'] ?? null) : null,
            $this->areas_json,
        )));
    }

    /** Descrição curta do horário para a portaria (ex.: "Seg-Sex 08:00-12:00"). */
    public function horarioDescricaoCurta(): ?string
    {
        if (! $this->temRestricaoHorario()) {
            return null;
        }

        $nomes = ['', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
        $partes = [];
        foreach ($this->horarios_json as $regra) {
            $dias = array_map('intval', (array) ($regra['dias'] ?? []));
            sort($dias);
            $diasTxt = implode(', ', array_map(fn ($d) => $nomes[$d] ?? (string) $d, $dias));
            $inicio = $regra['inicio'] ?? '00:00';
            $fim = $regra['fim'] ?? '23:59';
            $partes[] = trim("$diasTxt $inicio-$fim");
        }

        return implode(' · ', array_filter($partes));
    }
}
