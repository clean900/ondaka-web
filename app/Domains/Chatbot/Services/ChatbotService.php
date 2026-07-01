<?php

namespace App\Domains\Chatbot\Services;

use App\Domains\Chatbot\Models\ChatbotFaqCondominio;
use App\Domains\Chatbot\Models\ChatbotPergunta;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class ChatbotService
{
    /**
     * TODO (10-Mai-2026): Quando o sistema de FeatureSubscription estiver
     * activo em producao, adicionar verificacao aqui:
     *   - admin-empresa, gestor: sempre gratis (incluido na subscricao base)
     *   - outros roles: verificar se empresa tem feature 'chatbot' activa
     * Por agora, chatbot e gratis para todos os utilizadores autenticados.
     */

    /**
     * Lista perguntas do Assistente ONDAKA, filtradas por role do user.
     */
    public function listarPerguntasOndaka(User $user, ?string $termo = null): Collection
    {
        $query = ChatbotPergunta::where('activa', true)
            ->orderBy('ordem')
            ->orderBy('id');

        if ($termo && strlen($termo) >= 2) {
            $query->where(function ($q) use ($termo) {
                $q->where('pergunta', 'like', "%{$termo}%")
                    ->orWhere('resposta', 'like', "%{$termo}%");
            });
        }

        $perguntas = $query->get();

        $rolesDoUser = $user->getRoleNames()->toArray();

        if (in_array('super-admin', $rolesDoUser) || in_array('admin-empresa', $rolesDoUser)) {
            return $perguntas;
        }

        return $perguntas->filter(function ($p) use ($rolesDoUser) {
            $rolesPermitidas = $p->role_filter ?? [];

            if (empty($rolesPermitidas)) {
                return true;
            }

            return !empty(array_intersect($rolesDoUser, $rolesPermitidas));
        })->values();
    }

    /**
     * Lista FAQs específicas do condomínio activo.
     */
    public function listarFaqsCondominio(int $condominioId, ?string $termo = null): Collection
    {
        $query = ChatbotFaqCondominio::where('condominio_id', $condominioId)
            ->where('activa', true)
            ->orderBy('ordem')
            ->orderBy('id');

        if ($termo && strlen($termo) >= 2) {
            $query->where(function ($q) use ($termo) {
                $q->where('pergunta', 'like', "%{$termo}%")
                    ->orWhere('resposta', 'like', "%{$termo}%");
            });
        }

        return $query->get();
    }

    /**
     * Procura a melhor resposta para uma pergunta livre.
     * 
     * Combina:
     * 1. Perguntas globais ONDAKA (chatbot_perguntas) — 150 globais
     * 2. FAQs específicas do condomínio (chatbot_faqs_condominio) — variáveis
     * 
     * FAQs do condomínio têm prioridade ligeira (bonus +2pts) por serem específicas.
     */
    /** Detecta saudações e retorna resposta especial sem fazer search. */
    private function detectarSaudacao(string $textoLower): ?string
    {
        $saudacoes = [
            'ola', 'olá', 'oi', 'hey', 'ei', 'hello', 'hi',
            'bom dia', 'boa tarde', 'boa noite', 'boas',
            'tudo bem', 'tudo bom', 'como está', 'como estás',
        ];

        foreach ($saudacoes as $s) {
            if ($textoLower === $s || str_starts_with($textoLower, $s . ' ') || str_ends_with($textoLower, ' ' . $s)) {
                return $s;
            }
        }

        // Só saudação (sem outra palavra útil com >=4 chars)
        $tokens = $this->tokenizar($textoLower);
        $tokensLongos = array_filter($tokens, fn($t) => mb_strlen($t) >= 4);
        if (empty($tokensLongos) && mb_strlen($textoLower) <= 20) {
            return $textoLower;
        }

        return null;
    }

    public function procurarMelhorResposta(string $texto, User $user): array
    {
        $textoLower = mb_strtolower(trim($texto));

        // Responder a saudações directamente
        if ($this->detectarSaudacao($textoLower) !== null) {
            return ['melhor' => null, 'relacionadas' => [], 'score' => 0, 'saudacao' => true];
        }

        $tokens = $this->tokenizar($textoLower);

        if (empty($tokens)) {
            return ['melhor' => null, 'relacionadas' => [], 'score' => 0];
        }

        // 1. Perguntas globais ONDAKA
        $perguntasGlobais = $this->listarPerguntasOndaka($user);

        // 2. FAQs específicas do condomínio do user
        $condominioId = $user->condominio_activo_id;
        $faqsCondominio = $condominioId
            ? ChatbotFaqCondominio::where('condominio_id', $condominioId)
                ->where('activa', true)
                ->get()
            : collect();

        $scored = [];

        // Scoring perguntas globais
        foreach ($perguntasGlobais as $p) {
            $score = $this->calcularScore($p, $textoLower, $tokens);
            if ($score > 0) {
                $scored[] = [
                    'p' => $p,
                    'score' => $score,
                    'tipo' => 'global',
                ];
            }
        }

        // Scoring FAQs condomínio (com bonus +2 por serem específicas)
        foreach ($faqsCondominio as $f) {
            $score = $this->calcularScore($f, $textoLower, $tokens);
            if ($score > 0) {
                $scored[] = [
                    'p' => $f,
                    'score' => $score + 2, // bonus por ser específica
                    'tipo' => 'condominio',
                ];
            }
        }

        if (empty($scored)) {
            return ['melhor' => null, 'relacionadas' => [], 'score' => 0];
        }

        usort($scored, fn($a, $b) => $b['score'] <=> $a['score']);

        $melhor = $scored[0]['p'];
        $melhorScore = $scored[0]['score'];

        $relacionadas = collect(array_slice($scored, 1, 2))->map(fn($s) => $s['p'])->all();

        return [
            'melhor' => $melhor,
            'relacionadas' => $relacionadas,
            'score' => $melhorScore,
        ];
    }

    /**
     * Calcula score de uma pergunta/FAQ contra um texto + tokens.
     * Funciona com ChatbotPergunta e ChatbotFaqCondominio (ambos têm pergunta, resposta, palavras_chave).
     */
    private function calcularScore($entry, string $textoLower, array $tokens): int
    {
        // Normaliza acentos em ambos os lados → match insensível a acentos
        // (quem escreve "importacao" encontra "importação").
        $texto = $this->semAcentos($textoLower);
        $tokens = array_map(fn ($t) => $this->semAcentos($t), $tokens);
        $perguntaLower = $this->semAcentos($entry->pergunta);
        $respostaLower = $this->semAcentos($entry->resposta);
        $keywords = array_map(fn ($k) => $this->semAcentos((string) $k), $entry->palavras_chave ?? []);
        $score = 0;

        // Bonus: frase completa contida na pergunta
        if (mb_strlen($texto) >= 4 && mb_strpos($perguntaLower, $texto) !== false) {
            $score += 5;
        }

        // Keywords (palavras_chave)
        foreach ($tokens as $token) {
            foreach ($keywords as $kw) {
                if (mb_stripos($kw, $token) !== false) {
                    $score += 3;
                    break;
                }
            }
        }

        // Match em pergunta
        foreach ($tokens as $token) {
            if (mb_stripos($perguntaLower, $token) !== false) {
                $score += 2;
            }
        }

        // Match em resposta
        foreach ($tokens as $token) {
            if (mb_stripos($respostaLower, $token) !== false) {
                $score += 1;
            }
        }

        return $score;
    }

    /** Minúsculas sem acentos (Str::ascii transliterá ç→c, ã→a, etc.). */
    private function semAcentos(string $s): string
    {
        return Str::ascii(mb_strtolower($s));
    }

    /**
     * Tokeniza texto removendo stopwords PT.
     */
    private function tokenizar(string $texto): array
    {
        $stopwords = [
            'a', 'as', 'o', 'os', 'um', 'uma', 'uns', 'umas',
            'de', 'do', 'da', 'dos', 'das',
            'em', 'no', 'na', 'nos', 'nas',
            'por', 'para', 'pela', 'pelo', 'pelas', 'pelos',
            'com', 'sem', 'sob', 'sobre',
            'que', 'qual', 'quais', 'quem', 'quando', 'onde', 'porque',
            'e', 'ou', 'mas', 'se', 'então', 'também',
            'eu', 'tu', 'ele', 'ela', 'nós', 'vós', 'eles', 'elas',
            'meu', 'minha', 'teu', 'tua', 'seu', 'sua',
            'é', 'são', 'foi', 'foram', 'ser', 'estar',
            'ter', 'tem', 'tinha', 'tive',
            'fazer', 'faz', 'fiz',
            'como', 'isto', 'isso', 'aquilo',
            'muito', 'pouco', 'mais', 'menos',
            'já', 'ainda', 'sempre', 'nunca',
            'sim', 'não',
        ];

        $texto = preg_replace('/[^\p{L}\p{N}\s]/u', ' ', $texto);
        $palavras = preg_split('/\s+/', $texto, -1, PREG_SPLIT_NO_EMPTY);

        return array_values(array_filter($palavras, function ($p) use ($stopwords) {
            return mb_strlen($p) >= 3 && !in_array($p, $stopwords);
        }));
    }
}
