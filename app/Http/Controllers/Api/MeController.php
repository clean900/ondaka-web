<?php
namespace App\Http\Controllers\Api;
use App\Domains\Condomino\Models\Condomino;
use App\Domains\Familiar\Models\Familiar;
use App\Domains\Familiar\Support\CondominoResolver;
use App\Http\Controllers\Controller;
use App\Models\ModeloDocumento;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
/**
 * Endpoints para o user autenticado (perfil, fraccoes, etc).
 */
class MeController extends Controller
{
    /**
     * GET /api/me/fraccoes
     * Devolve as fraccoes do condomino autenticado, agrupadas por condominio.
     * Util para popular dropdowns no mobile/web ao criar pedido/visita/etc.
     */
    public function fraccoes(Request $request): JsonResponse
    {
        $user = $request->user();
        $condominoRecord = CondominoResolver::paraUser($user);
        if (!$condominoRecord) {
            return response()->json([
                'condominios' => [],
                'fraccoes' => [],
            ]);
        }
        $contratos = $condominoRecord->contratosActivos()
            ->with(['fraccao.edificio.condominio:id,nome'])
            ->get();
        $fraccoes = [];
        $condominios = [];
        foreach ($contratos as $contrato) {
            $f = $contrato->fraccao;
            if (!$f) continue;
            $cond = $f->edificio?->condominio;
            if (!$cond) continue;
            // Adiciona condominio (sem duplicar)
            if (!isset($condominios[$cond->id])) {
                $condominios[$cond->id] = [
                    'id' => $cond->id,
                    'nome' => $cond->nome,
                ];
            }
            // Adiciona fraccao
            $fraccoes[] = [
                'id' => $f->id,
                'identificador' => $f->identificador,
                'piso' => $f->piso,
                'edificio_id' => $f->edificio_id,
                'edificio_nome' => $f->edificio?->nome,
                'condominio_id' => $cond->id,
                'condominio_nome' => $cond->nome,
            ];
        }
        return response()->json([
            'condominios' => array_values($condominios),
            'fraccoes' => $fraccoes,
        ]);
    }

    /**
     * PATCH /api/me/profile
     * Actualiza dados do perfil do user logado (name, telefone, locale).
     * Se for condomino, sincroniza também o nome em condominos.nome_completo.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => ['nullable', 'string', 'max:200'],
            'telefone' => ['nullable', 'string', 'max:20'],
            'locale' => ['nullable', 'string', 'in:pt_AO,pt_PT,en'],
            'email' => ['nullable', 'email', 'max:150', Rule::unique('users', 'email')->ignore($user->id)],
        ]);

        // Filtrar apenas campos enviados (não tocar nos que não vieram)
        $data = array_filter($data, fn ($v) => $v !== null);

        if (empty($data)) {
            return response()->json([
                'message' => 'Nenhum campo para actualizar.',
                'user' => $this->serializeUser($user),
            ], 200);
        }

        $user->update($data);

        // SYNC reverso: se user é condómino, actualizar nome_completo
        if (isset($data['name'])) {
            $condomino = CondominoResolver::paraUser($user);
            if ($condomino) {
                $condomino->update(['nome_completo' => $data['name']]);
            }
        }

        return response()->json([
            'message' => 'Perfil actualizado com sucesso.',
            'user' => $this->serializeUser($user->fresh()),
        ]);
    }

    /**
     * PATCH /api/me/password
     * Muda a password do user logado.
     * Pede password actual + nova (com confirmação).
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'password_actual' => ['required', 'string'],
            'password_nova' => ['required', 'string', 'min:8', 'max:60', 'confirmed'],
        ], [
            'password_nova.confirmed' => 'A confirmação da nova password não coincide.',
        ]);

        if (!Hash::check($data['password_actual'], $user->password)) {
            return response()->json([
                'message' => 'A password actual está incorrecta.',
            ], 422);
        }

        $user->update([
            'password' => Hash::make($data['password_nova']),
            'must_change_password' => false,
        ]);

        return response()->json([
            'message' => 'Password actualizada com sucesso.',
        ]);
    }

    /**
     * GET /api/me/documentos
     * Modelos de documentação que o gestor tornou visíveis no mobile.
     */
    public function documentos(Request $request): JsonResponse
    {
        $empresaId = $request->user()->empresa_gestora_id;
        if (! $empresaId) {
            return response()->json(['documentos' => []]);
        }

        $docs = ModeloDocumento::where('empresa_gestora_id', $empresaId)
            ->where('visivel_mobile', true)
            ->latest()
            ->get()
            ->map(fn (ModeloDocumento $m) => [
                'id' => $m->id,
                'categoria' => $m->categoria,
                'nome' => $m->nome,
                'descricao' => $m->descricao,
                'url' => 'https://ondaka.ao/ficheiros/' . $m->ficheiro_path,
            ]);

        return response()->json(['documentos' => $docs]);
    }

    /**
     * Serializa o user para resposta JSON (formato consistente com /api/user).
     */
    private function serializeUser($user): array
    {
        return [
            'id'                 => $user->id,
            'name'               => $user->name,
            'email'              => $user->email,
            'telefone'           => $user->telefone,
            'empresa_gestora_id' => $user->empresa_gestora_id,
            'estado'             => $user->estado,
            'roles'              => $user->roles->pluck('name'),
            'locale'             => $user->locale ?? 'pt_AO',
            'must_change_password' => (bool) $user->must_change_password,
            'e_membro_comissao'  => \App\Domains\Condominio\Models\ComissaoMembro::where('user_id', $user->id)->exists(),
        ];
    }

    /**
     * GET /api/me/acessos
     */
    public function acessos(Request $request): JsonResponse
    {
        $user = $request->user();
        $eFamiliar = $user->hasRole('familiar');

        if ($eFamiliar) {
            $familiar = Familiar::where('user_id', $user->id)->where('ativo', true)->first();
            return response()->json([
                'e_familiar' => true,
                'acessos' => $familiar ? ($familiar->acessos ?? []) : [],
            ]);
        }

        return response()->json([
            'e_familiar' => false,
            'acessos' => Familiar::ACESSOS_DISPONIVEIS,
        ]);
    }

    /**
     * DELETE /api/me/conta
     * Soft-delete da conta do utilizador autenticado.
     * - Super-admin nao pode apagar a propria conta.
     * - Se for cond�mino titular, desativa os familiares associados.
     * - Revoga todos os tokens (logout imediato).
     * A conta fica recuperavel 30 dias (deleted_at); rotina apaga depois.
     */
    public function apagarConta(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasRole('super-admin')) {
            return response()->json([
                'message' => 'A conta de super-administrador nao pode ser apagada.',
            ], 403);
        }

        // Se for condomino titular, desativa os familiares associados.
        $condomino = Condomino::where('user_id', $user->id)->first();
        if ($condomino) {
            $familiares = Familiar::where('condomino_id', $condomino->id)->get();
            foreach ($familiares as $familiar) {
                $familiar->ativo = false;
                $familiar->save();
                if ($familiar->user_id) {
                    $u = \App\Models\User::find($familiar->user_id);
                    if ($u) {
                        $u->estado = 'inactivo';
                        $u->save();
                        $u->tokens()->delete();
                    }
                }
            }
        }

        // Revoga tokens e soft-delete da propria conta.
        $user->estado = 'inactivo';
        $user->save();
        $user->tokens()->delete();
        $user->delete(); // soft-delete (deleted_at)

        return response()->json([
            'message' => 'Conta marcada para eliminacao. Tens 30 dias para recuperar contactando o suporte.',
        ]);
    }

}
