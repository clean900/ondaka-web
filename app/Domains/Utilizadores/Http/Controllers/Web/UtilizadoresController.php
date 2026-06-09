<?php

declare(strict_types=1);

namespace App\Domains\Utilizadores\Http\Controllers\Web;

use App\Domains\Utilizadores\Models\ConviteUtilizador;
use App\Domains\Utilizadores\Services\ConviteService;
use App\Domains\Utilizadores\Services\UserManagementService;
use App\Domains\Condominio\Models\Condominio;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class UtilizadoresController extends Controller
{
    public function __construct(
        protected UserManagementService $userMgmt,
        protected ConviteService $conviteService,
    ) {}

    public function index(Request $request): Response
    {
        $empresa = app('empresa_gestora_actual');

        $filtros = $request->only(['busca', 'role', 'estado', 'condominio_id']);
        $utilizadores = $this->userMgmt->listar($empresa, $filtros);
        $convitesPendentes = $this->userMgmt->convitesPendentes($empresa);

        $condominios = Condominio::where('empresa_gestora_id', $empresa->id)
            ->orderBy('nome')
            ->get(['id', 'nome'])
            ->all();

        return Inertia::render('Utilizadores/Index', [
            'utilizadores' => $utilizadores,
            'convites_pendentes' => $convitesPendentes,
            'roles_disponiveis' => $this->userMgmt->rolesAtribuiveis(),
            'condominios' => $condominios,
            'filtros' => $filtros,
        ]);
    }

    public function convidar(Request $request): RedirectResponse
    {
        $empresa = app('empresa_gestora_actual');

        $validator = Validator::make($request->all(), [
            'nome' => 'required|string|min:2|max:255',
            'email' => 'required|email|max:255',
            'telefone' => 'nullable|string|max:30',
            'role_name' => 'required|string|in:gestor,administrador-condominio,guarda,funcionario,condomino,prestador',
            'condominio_id' => 'nullable|integer|exists:condominios,id',
            'fraccao_id' => 'nullable|integer|exists:fraccoes,id',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $dados = $validator->validated();
        $dados['empresa_gestora_id'] = $empresa->id;

        // Validacao de coerencia: roles que precisam de condominio
        if (in_array($dados['role_name'], ['administrador-condominio', 'guarda', 'condomino']) && empty($dados['condominio_id'])) {
            return back()->withErrors([
                'condominio_id' => 'Esta função requer a selecção de um condomínio.',
            ])->withInput();
        }

        // Verificar se ja existe utilizador com este email na mesma empresa
        $jaExiste = User::where('email', $dados['email'])->exists();
        if ($jaExiste) {
            return back()->withErrors([
                'email' => 'Já existe um utilizador com este email.',
            ])->withInput();
        }

        try {
            $this->conviteService->criar($dados, $request->user());
            return back()->with('success', 'Convite enviado com sucesso para ' . $dados['email']);
        } catch (\Throwable $e) {
            return back()->withErrors(['email' => 'Erro ao criar convite: ' . $e->getMessage()])->withInput();
        }
    }

    public function reenviarConvite(int $id): RedirectResponse
    {
        $empresa = app('empresa_gestora_actual');
        $convite = ConviteUtilizador::where('id', $id)
            ->where('empresa_gestora_id', $empresa->id)
            ->firstOrFail();

        try {
            $this->conviteService->reenviar($convite);
            return back()->with('success', 'Convite reenviado com sucesso.');
        } catch (\Throwable $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function cancelarConvite(int $id): RedirectResponse
    {
        $empresa = app('empresa_gestora_actual');
        $convite = ConviteUtilizador::where('id', $id)
            ->where('empresa_gestora_id', $empresa->id)
            ->firstOrFail();

        try {
            $this->conviteService->cancelar($convite);
            return back()->with('success', 'Convite cancelado.');
        } catch (\Throwable $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function alterarCondominio(Request $request, int $userId): RedirectResponse
    {
        $empresa = app('empresa_gestora_actual');

        $user = User::where('id', $userId)
            ->where('empresa_gestora_id', $empresa->id)
            ->firstOrFail();

        $validator = Validator::make($request->all(), [
            'condominio_id' => 'nullable|integer|exists:condominios,id',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        $this->userMgmt->alterarCondominioActivo($user, $request->input('condominio_id'));
        return back()->with('success', 'Condomínio activo alterado.');
    }

    public function suspender(int $userId): RedirectResponse
    {
        $empresa = app('empresa_gestora_actual');
        $user = User::where('id', $userId)
            ->where('empresa_gestora_id', $empresa->id)
            ->firstOrFail();

        // Salvaguarda: nao se pode suspender a si proprio
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Não pode suspender o seu próprio utilizador.');
        }

        $this->userMgmt->suspender($user);
        return back()->with('success', 'Utilizador suspenso.');
    }

    public function reactivar(int $userId): RedirectResponse
    {
        $empresa = app('empresa_gestora_actual');
        $user = User::where('id', $userId)
            ->where('empresa_gestora_id', $empresa->id)
            ->firstOrFail();

        $this->userMgmt->reactivar($user);
        return back()->with('success', 'Utilizador reactivado.');
    }

    /**
     * Criar utilizador directamente com password (alternativa ao convite).
     */
    public function criarDirecto(Request $request): RedirectResponse
    {
        $empresa = app('empresa_gestora_actual');

        $validator = Validator::make($request->all(), [
            'nome' => 'required|string|min:2|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'telefone' => 'nullable|string|max:30',
            'role_name' => 'required|string|in:gestor,administrador-condominio,guarda,funcionario,condomino,prestador',
            'condominio_id' => 'nullable|integer|exists:condominios,id',
            'password' => 'required|string|min:8',
            'forcar_troca_password' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $dados = $validator->validated();
        $dados['empresa_gestora_id'] = $empresa->id;
        $dados['forcar_troca_password'] = (bool) ($dados['forcar_troca_password'] ?? false);

        if (in_array($dados['role_name'], ['administrador-condominio', 'guarda', 'condomino']) && empty($dados['condominio_id'])) {
            return back()->withErrors([
                'condominio_id' => 'Esta funcao requer a seleccao de um condominio.',
            ])->withInput();
        }

        try {
            $this->userMgmt->criarComPassword($dados, $request->user()->id);
            return back()->with('success', 'Utilizador criado com sucesso.');
        } catch (\Throwable $e) {
            return back()->withErrors(['email' => 'Erro: ' . $e->getMessage()])->withInput();
        }
    }

    /**
     * Alterar password de um utilizador (operacao de admin).
     */
    public function alterarPassword(Request $request, int $userId): RedirectResponse
    {
        $empresa = app('empresa_gestora_actual');

        $user = User::where('id', $userId)
            ->where('empresa_gestora_id', $empresa->id)
            ->firstOrFail();

        // Salvaguarda: nao se pode alterar a propria password por aqui (use perfil)
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Para alterar a sua propria password, use o seu perfil.');
        }

        $validator = Validator::make($request->all(), [
            'password' => 'required|string|min:8',
            'forcar_troca_password' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        $this->userMgmt->alterarPassword(
            $user,
            $request->input('password'),
            (bool) $request->input('forcar_troca_password', false),
        );

        return back()->with('success', 'Password alterada com sucesso. O utilizador deve usar a nova password no proximo login.');
    }

    /**
     * Edita dados de um utilizador (nome, email, telefone, role, condominio).
     */
    public function editar(Request $request, int $userId): RedirectResponse
    {
        $empresa = app('empresa_gestora_actual');

        $user = User::where('id', $userId)
            ->where('empresa_gestora_id', $empresa->id)
            ->firstOrFail();

        $validator = Validator::make($request->all(), [
            'nome' => 'required|string|min:2|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'telefone' => 'nullable|string|max:30',
            'role_name' => 'required|string|in:gestor,administrador-condominio,guarda,funcionario,condomino,prestador',
            'condominio_id' => 'nullable|integer|exists:condominios,id',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $dados = $validator->validated();
        $dados['name'] = $dados['nome'];

        if (in_array($dados['role_name'], ['administrador-condominio', 'guarda', 'condomino']) && empty($dados['condominio_id'])) {
            return back()->withErrors([
                'condominio_id' => 'Esta funcao requer a seleccao de um condominio.',
            ])->withInput();
        }

        // Salvaguarda: nao se pode tirar o role admin-empresa de si proprio
        if ($user->id === auth()->id() && $user->hasRole('admin-empresa') && $dados['role_name'] !== 'admin-empresa') {
            return back()->with('error', 'Nao pode alterar o seu proprio papel de admin-empresa.');
        }

        $this->userMgmt->editar($user, $dados);

        return back()->with('success', 'Utilizador actualizado com sucesso.');
    }
}