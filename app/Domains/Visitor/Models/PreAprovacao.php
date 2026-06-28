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
        // dayOfWeekIso: 1=Segunda ... 7=Domingo (ISO 8601). NÃO usar dayOfWeek() (0=Domingo).
        $diaIso = $quando->dayOfWeekIso;
        $agoraMin = (int) $quando->format('H') * 60 + (int) $quando->format('i');

        foreach ($this->horarios_json as $regra) {
            $dias = array_map('intval', (array) ($regra['dias'] ?? []));
            if (! in_array($diaIso, $dias, true)) {
                continue;
            }
            $iniMin = $this->minutosHora($regra['inicio'] ?? null);
            $fimMin = $this->minutosHora($regra['fim'] ?? null);

            // Sem faixa horária → dia inteiro permitido.
            if ($iniMin === null && $fimMin === null) {
                return true;
            }
            // Só início → a partir de X.
            if ($iniMin !== null && $fimMin === null) {
                if ($agoraMin >= $iniMin) {
                    return true;
                }
                continue;
            }
            // Só fim → até X.
            if ($iniMin === null && $fimMin !== null) {
                if ($agoraMin <= $fimMin) {
                    return true;
                }
                continue;
            }
            // Ambos definidos: faixa normal ou a atravessar a meia-noite (fim < início).
            if ($fimMin >= $iniMin) {
                if ($agoraMin >= $iniMin && $agoraMin <= $fimMin) {
                    return true;
                }
            } else {
                if ($agoraMin >= $iniMin || $agoraMin <= $fimMin) {
                    return true;
                }
            }
        }

        return false;
    }

    /** "HH:MM" → minutos desde a meia-noite (null se vazio/inválido). */
    private function minutosHora(?string $hhmm): ?int
    {
        if ($hhmm === null || $hhmm === '') {
            return null;
        }
        $p = explode(':', $hhmm);
        if (count($p) < 2) {
            return null;
        }
        return ((int) $p[0]) * 60 + ((int) $p[1]);
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
            if (empty($dias)) {
                continue;
            }
            $diasTxt = implode(', ', array_map(fn ($d) => $nomes[$d] ?? (string) $d, $dias));
            $inicio = $regra['inicio'] ?? null;
            $fim = $regra['fim'] ?? null;
            if ($inicio && $fim) {
                $faixa = "$inicio-$fim";
            } elseif ($inicio) {
                $faixa = "desde $inicio";
            } elseif ($fim) {
                $faixa = "até $fim";
            } else {
                $faixa = 'dia inteiro';
            }
            $partes[] = trim("$diasTxt $faixa");
        }

        return $partes ? implode(' · ', $partes) : null;
    }
}
