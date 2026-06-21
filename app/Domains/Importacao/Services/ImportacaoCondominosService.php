<?php

declare(strict_types=1);

namespace App\Domains\Importacao\Services;

use App\Domains\Condomino\Models\Condomino;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

/**
 * Importação massiva de condóminos via CSV.
 * Fluxo: analisar (preview + validação) → importar (transação, só linhas válidas).
 */
class ImportacaoCondominosService
{
    /** Cabeçalhos aceites → campo do modelo (case-insensitive, sem acentos). */
    private const MAPA = [
        'nome' => 'nome_completo', 'nomecompleto' => 'nome_completo', 'nome completo' => 'nome_completo',
        'bi' => 'numero_bi', 'numerobi' => 'numero_bi', 'numero bi' => 'numero_bi', 'documento' => 'numero_bi',
        'nif' => 'nif',
        'telefone' => 'telefone_principal', 'telemovel' => 'telefone_principal', 'contacto' => 'telefone_principal',
        'email' => 'email', 'e-mail' => 'email',
    ];

    /**
     * Lê o CSV e devolve linhas com dados normalizados + erros de validação.
     *
     * @return array{linhas:array<int,array{linha:int,dados:array,erros:array<string>}>,total:int,validas:int}
     */
    public function analisar(UploadedFile $ficheiro): array
    {
        $linhas = [];
        $validas = 0;

        $handle = fopen($ficheiro->getRealPath(), 'r');
        if (! $handle) {
            return ['linhas' => [], 'total' => 0, 'validas' => 0];
        }

        $cabecalho = null;
        $numLinha = 0;
        while (($cols = fgetcsv($handle, 0, $this->detetarSeparador($ficheiro))) !== false) {
            $numLinha++;
            if ($numLinha === 1) {
                $cabecalho = array_map(fn ($h) => $this->normalizarChave((string) $h), $cols);
                continue;
            }
            if (count(array_filter($cols, fn ($c) => trim((string) $c) !== '')) === 0) {
                continue; // linha vazia
            }

            $dados = $this->mapearLinha($cabecalho, $cols);
            $erros = $this->validar($dados);
            if (empty($erros)) {
                $validas++;
            }

            $linhas[] = ['linha' => $numLinha, 'dados' => $dados, 'erros' => $erros];
            if (count($linhas) >= 500) {
                break; // limite de segurança
            }
        }
        fclose($handle);

        return ['linhas' => $linhas, 'total' => count($linhas), 'validas' => $validas];
    }

    /**
     * Importa as linhas válidas numa transação (rollback se algo falhar).
     *
     * @return array{importados:int,ignorados:int}
     */
    public function importar(UploadedFile $ficheiro, int $empresaGestoraId): array
    {
        $analise = $this->analisar($ficheiro);
        $importados = 0;
        $ignorados = 0;

        DB::transaction(function () use ($analise, $empresaGestoraId, &$importados, &$ignorados) {
            foreach ($analise['linhas'] as $item) {
                if (! empty($item['erros'])) {
                    $ignorados++;
                    continue;
                }
                Condomino::create([
                    'empresa_gestora_id' => $empresaGestoraId,
                    'tipo' => 'singular',
                    'nome_completo' => $item['dados']['nome_completo'],
                    'numero_bi' => $item['dados']['numero_bi'] ?? null,
                    'nif' => $item['dados']['nif'] ?? null,
                    'telefone_principal' => $item['dados']['telefone_principal'] ?? null,
                    'email' => $item['dados']['email'] ?? null,
                ]);
                $importados++;
            }
        });

        return ['importados' => $importados, 'ignorados' => $ignorados];
    }

    /** @param array<int,string> $cabecalho @param array<int,string> $cols */
    private function mapearLinha(?array $cabecalho, array $cols): array
    {
        $dados = [];
        foreach (($cabecalho ?? []) as $i => $chave) {
            $campo = self::MAPA[$chave] ?? null;
            if ($campo) {
                $dados[$campo] = trim((string) ($cols[$i] ?? ''));
            }
        }
        return $dados;
    }

    private function validar(array $dados): array
    {
        $erros = [];
        if (empty($dados['nome_completo'])) {
            $erros[] = 'Nome em falta';
        }
        if (! empty($dados['email']) && ! filter_var($dados['email'], FILTER_VALIDATE_EMAIL)) {
            $erros[] = 'Email inválido';
        }
        return $erros;
    }

    private function normalizarChave(string $h): string
    {
        $semBom = preg_replace('/^\xEF\xBB\xBF/', '', $h); // remove BOM
        return mb_strtolower(trim((string) $semBom));
    }

    private function detetarSeparador(UploadedFile $ficheiro): string
    {
        $primeiraLinha = (string) fgets(fopen($ficheiro->getRealPath(), 'r'));
        return substr_count($primeiraLinha, ';') > substr_count($primeiraLinha, ',') ? ';' : ',';
    }
}
