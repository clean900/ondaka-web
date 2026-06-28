<?php

declare(strict_types=1);

namespace App\Domains\Sos\Services;

use App\Domains\Condomino\Models\Condomino;
use App\Domains\Familiar\Support\CondominoResolver;
use App\Domains\Sos\Catalog\TiposSos;
use App\Domains\Sos\Models\SosAlerta;
use App\Domains\Sos\Models\SosAlertaFoto;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use RuntimeException;

use App\Domains\Sos\Services\SosNotificationService;

/**
 * Service que cria um alerta SOS.
 *
 * Resolve automaticamente o condomínio do user (via Condomino → Contrato → Fraccao).
 * Atribui gravidade a partir do catálogo.
 *
 * NÃO dispara notificações aqui — isso será feito no próximo passo (NotificarSosService).
 */
class CriarAlertaSosService
{
    public function __construct(protected ?SosNotificationService $notificationService = null) {}

    /**
     * @param  User  $user  User que está a accionar o SOS
     * @param  string  $tipo  Um dos 13 tipos definidos em TiposSos
     * @param  string|null  $descricao  Texto livre opcional
     * @param  string|null  $localizacao  Texto livre opcional (ex: "Bloco A, 3º andar")
     */
    /**
     * @param  array<UploadedFile>  $fotos  Até 3 ficheiros de imagem
     */
    public function executar(
        User $user,
        string $tipo,
        ?string $descricao = null,
        ?string $localizacao = null,
        array $fotos = [],
    ): SosAlerta {
        // 1. Validar tipo
        if (! TiposSos::existe($tipo)) {
            throw new InvalidArgumentException("Tipo de SOS inválido: {$tipo}");
        }

        // 2. Resolver condomínio: condómino (via contrato/fracção) OU
        //    funcionário/guarda (via condominio_activo_id, sem condómino).
        $condomino = CondominoResolver::paraUser($user);
        $condominoId = null;
        $condominioId = null;

        if ($condomino) {
            $contrato = $condomino->contratos()
                ->where('estado', 'activo')
                ->latest('data_inicio')
                ->first()
                ?? $condomino->contratos()->latest('data_inicio')->first();

            if (! $contrato || ! $contrato->fraccao_id) {
                throw new RuntimeException('Condómino não tem contrato activo / fracção.');
            }

            $fraccao = $contrato->fraccao;
            if (! $fraccao || ! $fraccao->condominio_id) {
                throw new RuntimeException('Fracção não tem condomínio associado.');
            }

            $condominioId = $fraccao->condominio_id;
            $condominoId = $condomino->id;
        } else {
            // Guarda/funcionário: usa o condomínio activo (botão de pânico da portaria).
            $condominioId = $user->condominio_activo_id;
            if (! $condominioId || ! \App\Domains\Condominio\Models\Condominio::whereKey($condominioId)->exists()) {
                throw new RuntimeException('User não está associado a um condomínio válido.');
            }
        }

        // 3. Determinar gravidade do catálogo
        $gravidade = TiposSos::gravidade($tipo);

        // 4. Criar alerta numa transacção
        $alerta = DB::transaction(function () use ($user, $condominioId, $condominoId, $tipo, $gravidade, $descricao, $localizacao, $fotos) {
            $alerta = SosAlerta::create([
                'condominio_id' => $condominioId,
                'condomino_id' => $condominoId,
                'user_id' => $user->id,
                'tipo' => $tipo,
                'gravidade' => $gravidade,
                'descricao' => $descricao,
                'localizacao' => $localizacao,
                'estado' => SosAlerta::ESTADO_ABERTO,
            ]);

            // Guardar fotos (até 3)
            $fotosLimitadas = array_slice($fotos, 0, 3);
            foreach ($fotosLimitadas as $ordem => $ficheiro) {
                if (! $ficheiro instanceof UploadedFile) continue;
                $path = $ficheiro->store("sos/{$alerta->id}", 'public');
                SosAlertaFoto::create([
                    'sos_alerta_id' => $alerta->id,
                    'path' => $path,
                    'ordem' => $ordem,
                ]);
            }

            return $alerta;
        });

        // Dispara notificações push (não bloqueia em caso de falha).
        // Resolve sempre o serviço: a injeção opcional (?Service = null) era
        // resolvida pelo container para null, saltando o push silenciosamente.
        $notificador = $this->notificationService ?? app(SosNotificationService::class);
        $notificador->notificar($alerta);

        return $alerta;
    }
}
