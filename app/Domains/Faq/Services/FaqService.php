<?php

namespace App\Domains\Faq\Services;

use App\Domains\Faq\Models\Faq;
use Illuminate\Support\Collection;

class FaqService
{
    /**
     * Procurar FAQs relevantes para uma pergunta.
     * Devolve até $limite respostas ordenadas por relevância.
     */
    public function procurar(
        string $pergunta,
        int $empresaGestoraId,
        ?int $condominioId = null,
        int $limite = 3
    ): Collection {
        $perguntaNormalizada = $this->normalizar($pergunta);
        $palavrasProcurar = $this->extrairPalavras($perguntaNormalizada);

        if (empty($palavrasProcurar)) {
            return collect();
        }

        // Buscar FAQs do condomínio + FAQs globais da empresa
        $query = Faq::query()
            ->where('activa', true)
            ->where('empresa_gestora_id', $empresaGestoraId);

        if ($condominioId) {
            $query->where(function ($q) use ($condominioId) {
                $q->where('condominio_id', $condominioId)
                  ->orWhereNull('condominio_id');
            });
        } else {
            $query->whereNull('condominio_id');
        }

        $todas = $query->orderBy('ordem')->get();

        // Calcular score de cada FAQ
        $comScore = $todas->map(function ($faq) use ($palavrasProcurar, $perguntaNormalizada) {
            $score = $this->calcularScore($faq, $palavrasProcurar, $perguntaNormalizada);
            return ['faq' => $faq, 'score' => $score];
        })
        ->filter(fn ($i) => $i['score'] > 0)
        ->sortByDesc('score')
        ->values();

        return $comScore->take($limite)->map(fn ($i) => $i['faq']);
    }

    /**
     * Calcular score de uma FAQ face a palavras de pesquisa.
     * Pontuação:
     * - Palavra-chave explícita batida: 10 pontos
     * - Palavra no título batida: 5 pontos
     * - Palavra na resposta batida: 1 ponto
     * - Frase exacta na pergunta: 20 pontos
     */
    protected function calcularScore(Faq $faq, array $palavras, string $perguntaNormalizada): float
    {
        $score = 0.0;

        $perguntaFaq = $this->normalizar($faq->pergunta);
        $respostaFaq = $this->normalizar($faq->resposta);
        $palavrasChave = $faq->palavras_chave_array;

        // Frase exacta
        if (strlen($perguntaNormalizada) > 5 && mb_strpos($perguntaFaq, $perguntaNormalizada) !== false) {
            $score += 20;
        }

        foreach ($palavras as $palavra) {
            if (strlen($palavra) < 3) {
                continue;
            }

            if (in_array($palavra, $palavrasChave, true)) {
                $score += 10;
            }

            if (mb_strpos($perguntaFaq, $palavra) !== false) {
                $score += 5;
            }

            if (mb_strpos($respostaFaq, $palavra) !== false) {
                $score += 1;
            }
        }

        return $score;
    }

    protected function normalizar(string $texto): string
    {
        $texto = mb_strtolower($texto);
        // Remove acentos
        $texto = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $texto);
        // Remove pontuação
        $texto = preg_replace('/[^\w\s]/u', ' ', $texto);
        // Normaliza espaços
        return trim(preg_replace('/\s+/', ' ', $texto));
    }

    protected function extrairPalavras(string $textoNormalizado): array
    {
        // Palavras vazias em português
        $stopwords = ['a', 'o', 'as', 'os', 'e', 'de', 'do', 'da', 'dos', 'das',
            'um', 'uma', 'uns', 'umas', 'no', 'na', 'nos', 'nas', 'em', 'por',
            'para', 'com', 'se', 'que', 'qual', 'quais', 'como', 'onde', 'quando',
            'eu', 'tu', 'ele', 'ela', 'nos', 'vos', 'eles', 'elas', 'meu', 'teu',
            'seu', 'nosso', 'vosso', 'e', 'ou', 'mas', 'nao', 'sim'];

        return collect(explode(' ', $textoNormalizado))
            ->map(fn ($p) => trim($p))
            ->filter(fn ($p) => strlen($p) >= 3 && ! in_array($p, $stopwords, true))
            ->unique()
            ->values()
            ->all();
    }
}
