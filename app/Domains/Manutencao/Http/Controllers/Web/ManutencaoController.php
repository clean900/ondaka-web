<?php

declare(strict_types=1);

namespace App\Domains\Manutencao\Http\Controllers\Web;

use App\Domains\Feature\Services\FeatureGate;
use App\Domains\Manutencao\Models\Equipamento;
use App\Domains\Manutencao\Models\ManutencaoPlano;
use App\Domains\Manutencao\Services\ManutencaoService;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ManutencaoController extends Controller
{
    public function __construct(protected ManutencaoService $service) {}

    public function index(Request $request): Response|RedirectResponse
    {
        $empresa = app('empresa_gestora_actual');
        if (! $empresa || ! FeatureGate::has($empresa, 'manutencao_preventiva')) {
            return redirect()->route('funcionalidades.show', 'manutencao_preventiva');
        }

        $empresaId = (int) $request->user()->empresa_gestora_id;

        $equipamentos = $this->service->equipamentos($empresaId)
            ->map(fn (Equipamento $e) => [
                'id' => $e->id,
                'nome' => $e->nome,
                'tipo' => $e->tipo,
                'tipo_label' => $e->tipo_label,
                'localizacao' => $e->localizacao,
                'condominio_id' => $e->condominio_id,
                'planos_count' => $e->planos_count,
            ]);

        $proximas = $this->service->proximas($empresaId)
            ->map(fn (ManutencaoPlano $p) => [
                'id' => $p->id,
                'titulo' => $p->titulo,
                'equipamento' => $p->equipamento?->nome,
                'tipo_label' => $p->equipamento?->tipo_label,
                'proxima_data' => $p->proxima_data->format('Y-m-d'),
                'dias' => $p->dias_para_proxima,
                'periodicidade_dias' => $p->periodicidade_dias,
            ]);

        return Inertia::render('Manutencao/Index', [
            'equipamentos' => $equipamentos->values(),
            'proximas' => $proximas->values(),
            'condominios' => $this->condominiosDaEmpresa($empresaId),
        ]);
    }

    public function storeEquipamento(Request $request): RedirectResponse
    {
        $dados = $request->validate([
            'condominio_id' => ['required', 'integer'],
            'nome' => ['required', 'string', 'max:150'],
            'tipo' => ['required', 'in:elevador,avac,gerador,bomba,incendio,portao,outro'],
            'localizacao' => ['nullable', 'string', 'max:150'],
            'marca' => ['nullable', 'string', 'max:100'],
            'modelo' => ['nullable', 'string', 'max:100'],
        ]);

        Equipamento::create([
            ...$dados,
            'empresa_gestora_id' => (int) $request->user()->empresa_gestora_id,
        ]);

        return back()->with('success', 'Equipamento adicionado.');
    }

    public function storePlano(Request $request): RedirectResponse
    {
        $dados = $request->validate([
            'equipamento_id' => ['required', 'integer'],
            'titulo' => ['required', 'string', 'max:150'],
            'descricao' => ['nullable', 'string', 'max:1000'],
            'periodicidade_dias' => ['required', 'integer', 'min:1', 'max:3650'],
            'proxima_data' => ['required', 'date'],
        ]);

        $this->garantirEquipamentoDaEmpresa((int) $dados['equipamento_id'], $request);

        ManutencaoPlano::create($dados);

        return back()->with('success', 'Plano de manutenção criado.');
    }

    public function registarIntervencao(Request $request, int $plano): RedirectResponse
    {
        $dados = $request->validate([
            'data_realizada' => ['required', 'date'],
            'descricao' => ['nullable', 'string', 'max:2000'],
            'custo' => ['nullable', 'numeric', 'min:0'],
            'realizado_por' => ['nullable', 'string', 'max:150'],
            'relatorio' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:8192'],
        ]);

        $planoModel = ManutencaoPlano::with('equipamento')->findOrFail($plano);
        abort_if(
            $planoModel->equipamento->empresa_gestora_id !== $request->user()->empresa_gestora_id,
            403,
        );

        if ($request->hasFile('relatorio')) {
            $dados['relatorio_path'] = $request->file('relatorio')->store('manutencao', 'public');
        }

        $this->service->registarIntervencao($planoModel, $dados, (int) $request->user()->id);

        return back()->with('success', 'Intervenção registada — próxima data actualizada.');
    }

    private function garantirEquipamentoDaEmpresa(int $equipamentoId, Request $request): void
    {
        $ok = Equipamento::where('id', $equipamentoId)
            ->where('empresa_gestora_id', $request->user()->empresa_gestora_id)
            ->exists();
        abort_unless($ok, 403);
    }

    /** @return array<int,array{id:int,nome:string}> */
    private function condominiosDaEmpresa(int $empresaId): array
    {
        return \DB::table('condominios')
            ->where('empresa_gestora_id', $empresaId)
            ->orderBy('nome')
            ->get(['id', 'nome'])
            ->map(fn ($c) => ['id' => $c->id, 'nome' => $c->nome])
            ->all();
    }
}
