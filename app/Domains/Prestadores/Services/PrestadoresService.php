<?php

declare(strict_types=1);

namespace App\Domains\Prestadores\Services;

use App\Domains\Prestadores\Models\PrestadorAvaliacao;
use App\Domains\Prestadores\Models\PrestadorDestaque;
use App\Domains\Tickets\Models\EmpresaPrestadora;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PrestadoresService
{
    /**
     * Inscrição pública de um prestador (Tipo 2).
     * Fica pendente de aprovação do super-admin.
     */
    public function inscreverPublico(array $dados): EmpresaPrestadora
    {
        return EmpresaPrestadora::create([
            'empresa_gestora_id' => null,
            'tipo' => 'publico',
            'nome' => $dados['nome'],
            'nif' => $dados['nif'] ?? null,
            'telefone' => $dados['telefone'] ?? null,
            'email' => $dados['email'] ?? null,
            'especialidades' => $dados['especialidades'] ?? null,
            'observacoes' => $dados['observacoes'] ?? null,
            'latitude' => $dados['latitude'] ?? null,
            'longitude' => $dados['longitude'] ?? null,
            'foto_path' => $dados['foto_path'] ?? null,
            'estado_aprovacao' => 'pendente',
            'aprovado_por' => 'pendente',
            'subscricao_activa' => false,
            'subscricao_valor' => 5000,
            'ativa' => true,
        ]);
    }

    /**
     * Super-admin aprova um prestador público.
     * Activa a subscrição manualmente (integração ProxyPay = Fase B).
     */
    public function aprovarPublico(EmpresaPrestadora $prestadora, bool $activarSubscricao = true): EmpresaPrestadora
    {
        $prestadora->update([
            'estado_aprovacao' => 'aprovado',
            'aprovado_por' => 'super_admin',
            'subscricao_activa' => $activarSubscricao,
            'subscricao_expira_em' => $activarSubscricao ? now()->addMonth()->toDateString() : null,
        ]);

        return $prestadora->fresh();
    }

    /**
     * Rejeitar prestador público.
     */
    public function rejeitarPublico(EmpresaPrestadora $prestadora): EmpresaPrestadora
    {
        $prestadora->update([
            'estado_aprovacao' => 'rejeitado',
            'aprovado_por' => 'super_admin',
            'subscricao_activa' => false,
        ]);

        return $prestadora->fresh();
    }

    /**
     * Gestora destaca um prestador no seu marketplace (parte híbrida).
     */
    public function destacar(int $empresaGestoraId, int $empresaPrestadoraId, int $ordem = 0): PrestadorDestaque
    {
        return PrestadorDestaque::updateOrCreate(
            [
                'empresa_gestora_id' => $empresaGestoraId,
                'empresa_prestadora_id' => $empresaPrestadoraId,
            ],
            ['ordem' => $ordem]
        );
    }

    /**
     * Remover destaque.
     */
    public function removerDestaque(int $empresaGestoraId, int $empresaPrestadoraId): void
    {
        PrestadorDestaque::where('empresa_gestora_id', $empresaGestoraId)
            ->where('empresa_prestadora_id', $empresaPrestadoraId)
            ->delete();
    }

    /**
     * Listar prestadores para o condómino (mobile).
     * Combina: prestadores públicos visíveis + destaques da gestora do condómino.
     * Ordena por proximidade se lat/lng fornecidos.
     */
    public function listarParaCondomino(?int $empresaGestoraId, ?float $lat, ?float $lng, ?int $categoriaId = null): array
    {
        // 1. Públicos visíveis (aprovados + subscrição activa)
        $publicosQuery = EmpresaPrestadora::publicoVisivel();

        if ($categoriaId) {
            // especialidades é texto livre; filtro simples por LIKE do slug/nome da categoria
            // (refinar com tabela pivot numa fase futura)
        }

        $publicos = $publicosQuery->get();

        // 2. Destaques da gestora do condómino
        $destacadosIds = [];
        if ($empresaGestoraId) {
            $destacadosIds = PrestadorDestaque::where('empresa_gestora_id', $empresaGestoraId)
                ->pluck('empresa_prestadora_id')
                ->toArray();
        }

        $destacados = empty($destacadosIds)
            ? collect()
            : EmpresaPrestadora::aprovados()->whereIn('id', $destacadosIds)->get();

        // 3. Juntar (destacados primeiro, sem duplicar)
        $todos = $destacados->concat($publicos)->unique('id');

        // 4. Calcular distância e ordenar por proximidade
        $resultado = $todos->map(function ($p) use ($lat, $lng, $destacadosIds) {
            $distancia = null;
            if ($lat !== null && $lng !== null && $p->latitude && $p->longitude) {
                $distancia = $this->haversine($lat, $lng, (float) $p->latitude, (float) $p->longitude);
            }

            return [
                'id' => $p->id,
                'nome' => $p->nome,
                'tipo' => $p->tipo,
                'telefone' => $p->telefone,
                'email' => $p->email,
                'especialidades' => $p->especialidades,
                'foto_path' => $p->foto_path,
                'latitude' => $p->latitude,
                'longitude' => $p->longitude,
                'media_estrelas' => $p->media_estrelas,
                'total_avaliacoes' => $p->total_avaliacoes,
                'destacado' => in_array($p->id, $destacadosIds),
                'distancia_km' => $distancia !== null ? round($distancia, 1) : null,
            ];
        });

        // Destacados primeiro, depois por distância (nulls no fim), depois por estrelas
        $ordenado = $resultado->sortBy([
            fn ($a, $b) => $b['destacado'] <=> $a['destacado'],
            fn ($a, $b) => ($a['distancia_km'] ?? PHP_INT_MAX) <=> ($b['distancia_km'] ?? PHP_INT_MAX),
            fn ($a, $b) => $b['media_estrelas'] <=> $a['media_estrelas'],
        ])->values();

        return $ordenado->toArray();
    }

    /**
     * Condómino avalia um prestador (1 avaliação por user por prestador).
     */
    public function avaliar(int $empresaPrestadoraId, int $userId, int $estrelas, ?string $comentario): PrestadorAvaliacao
    {
        return PrestadorAvaliacao::updateOrCreate(
            [
                'empresa_prestadora_id' => $empresaPrestadoraId,
                'user_id' => $userId,
            ],
            [
                'estrelas' => max(1, min(5, $estrelas)),
                'comentario' => $comentario,
                'aprovado' => true,
            ]
        );
    }

    /**
     * Distância Haversine em km entre dois pontos.
     */
    private function haversine(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $r = 6371; // raio da Terra em km
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;
        return $r * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }
}
