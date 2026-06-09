<?php

namespace App\Domains\Sistema\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;

class SistemaController extends Controller
{
    public function index()
    {
        return Inertia::render('SuperAdmin/Sistema/Index', [
            'estado' => $this->estado(),
        ]);
    }

    private function estado(): array
    {
        $pendentes = [];
        try {
            Artisan::call('migrate:status');
            $output = Artisan::output();
            foreach (explode("\n", $output) as $linha) {
                if (stripos($linha, 'Pending') !== false) {
                    $pendentes[] = trim(preg_replace('/\.+|Pending/', ' ', $linha));
                }
            }
        } catch (\Throwable $e) {
            $pendentes = ['(nao foi possivel ler o estado das migracoes)'];
        }

        $caches = [
            'config' => File::exists(base_path('bootstrap/cache/config.php')),
            'rotas' => File::exists(base_path('bootstrap/cache/routes-v7.php')),
            'eventos' => File::exists(base_path('bootstrap/cache/events.php')),
        ];

        $versao = 'desconhecida';
        $manifest = public_path('build/manifest.json');
        if (File::exists($manifest)) {
            $versao = date('Y-m-d H:i', File::lastModified($manifest));
        }

        $discoLivre = @disk_free_space(base_path());
        $discoTotal = @disk_total_space(base_path());
        $emManutencao = File::exists(storage_path('framework/down'));

        return [
            'migracoes_pendentes' => $pendentes,
            'num_pendentes' => count($pendentes),
            'caches' => $caches,
            'versao' => $versao,
            'disco_livre_gb' => $discoLivre ? round($discoLivre / 1073741824, 2) : null,
            'disco_total_gb' => $discoTotal ? round($discoTotal / 1073741824, 2) : null,
            'em_manutencao' => $emManutencao,
            'app_env' => config('app.env'),
        ];
    }

    public function migrar()
    {
        try {
            Artisan::call('migrate', ['--force' => true]);
            return back()->with('success', 'Migracoes executadas: ' . trim(Artisan::output()));
        } catch (\Throwable $e) {
            return back()->with('error', 'Falha nas migracoes: ' . $e->getMessage());
        }
    }

    public function limparCaches()
    {
        try {
            Artisan::call('optimize:clear');
            return back()->with('success', 'Caches limpas com sucesso.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Falha ao limpar caches: ' . $e->getMessage());
        }
    }

    public function otimizar()
    {
        try {
            Artisan::call('config:cache');
            Artisan::call('route:cache');
            return back()->with('success', 'Sistema otimizado (config + rotas em cache).');
        } catch (\Throwable $e) {
            return back()->with('error', 'Falha ao otimizar: ' . $e->getMessage());
        }
    }

    public function manutencao()
    {
        try {
            if (File::exists(storage_path('framework/down'))) {
                Artisan::call('up');
                return back()->with('success', 'Modo manutencao DESATIVADO. O site esta online.');
            }
            // gerar um secret para o super-admin contornar a manutencao
            $secret = bin2hex(random_bytes(8));
            Artisan::call('down', [
                '--render' => 'errors::503',
                '--secret' => $secret,
            ]);
            $url = config('app.url') . '/' . $secret;
            return back()->with('success', 'Modo manutencao ATIVADO. Para continuar a aceder, abra: ' . $url);
        } catch (\Throwable $e) {
            return back()->with('error', 'Falha ao alterar o modo manutencao: ' . $e->getMessage());
        }
    }
}
