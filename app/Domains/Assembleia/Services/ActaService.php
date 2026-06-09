<?php

namespace App\Domains\Assembleia\Services;

use App\Domains\Assembleia\Models\Assembleia;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class ActaService
{
    /**
     * Gera (ou regenera) o PDF da acta de uma assembleia concluída.
     */
    public function gerarPdf(Assembleia $assembleia): string
    {
        if (! in_array($assembleia->estado, ['concluida', 'sem_quorum'])) {
            throw new RuntimeException('Acta só pode ser gerada para assembleias concluídas ou sem quórum.');
        }

        $assembleia->loadMissing([
            'condominio.empresaGestora',
            'participantes.condomino',
            'criadaPor',
            'iniciadaPor',
            'terminadaPor',
            'pontosVotacao.votos.participante',
        ]);

        $quorum = $assembleia->calcularQuorum();

        $presentes = $assembleia->participantes->where('presente', true)->sortBy('nome_snapshot');
        $ausentes = $assembleia->participantes->where('presente', false)->sortBy('nome_snapshot');

        $pdf = Pdf::loadView('pdf.acta', [
            'assembleia' => $assembleia,
            'quorum' => $quorum,
            'presentes' => $presentes,
            'ausentes' => $ausentes,
            'pontos' => $assembleia->pontosVotacao,
        ])->setPaper('a4', 'portrait');

        $pasta = 'actas/'.Carbon::parse($assembleia->data_agendada)->format('Y/m');
        $nomeFicheiro = 'acta-'.str_replace(['/', ' '], ['_', '_'], $assembleia->numero).'.pdf';
        $caminho = $pasta.'/'.$nomeFicheiro;

        Storage::disk('local')->put($caminho, $pdf->output());

        // Captura se já estava gerada ANTES (para notificar só na 1ª geração; #18)
        $jaEstavaGerada = (bool) $assembleia->acta_gerada;

        $assembleia->update([
            'acta_gerada' => true,
            'acta_path' => $caminho,
            'acta_gerada_em' => now(),
        ]);

        // Notificar participantes só na primeira geração (não em regenerações/downloads)
        if (! $jaEstavaGerada) {
            $dataActa = Carbon::parse($assembleia->data_agendada)->format('d/m/Y');
            foreach ($assembleia->participantes as $part) {
                if (! $part->condomino_id) continue;
                $cond = \App\Domains\Condomino\Models\Condomino::find($part->condomino_id);
                if (! $cond || ! $cond->user_id) continue;
                $u = \App\Models\User::find($cond->user_id);
                if (! $u) continue;
                try {
                    $u->notify(new \App\Domains\Condomino\Notifications\ActaDisponivelNotification(
                        nome: $u->name,
                        assembleia: $assembleia->titulo,
                        data: $dataActa,
                        assembleiaId: $assembleia->id,
                    ));
                } catch (\Throwable $e) {
                    \Log::warning('[Acta] Falha push acta '.$assembleia->id.': '.$e->getMessage());
                }
            }
        }

        return $caminho;
    }

    /**
     * Devolve bytes do PDF (gera se não existir).
     */
    public function obterPdf(Assembleia $assembleia): ?string
    {
        if ($assembleia->acta_path && Storage::disk('local')->exists($assembleia->acta_path)) {
            return Storage::disk('local')->get($assembleia->acta_path);
        }

        try {
            $this->gerarPdf($assembleia);
            return Storage::disk('local')->get($assembleia->fresh()->acta_path);
        } catch (\Throwable $e) {
            \Log::error("Falha ao obter PDF acta {$assembleia->numero}: ".$e->getMessage());
            return null;
        }
    }
}
