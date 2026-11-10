<?php

declare(strict_types=1);

namespace App\Domains\Integracao\WhatsApp;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Cliente da WhatsApp Cloud API (Meta Graph API) para as notificações ao afiliado.
 *
 * As notificações são mensagens INICIADAS pela empresa (business-initiated); fora da
 * janela de 24h, texto livre é recusado (erro 131047), por isso são enviadas como
 * TEMPLATES aprovados pela Meta (um por evento), com os parâmetros de corpo {{1}}, {{2}}…
 *
 * Credenciais em config/services.php (via env). Fica inactivo (não envia, nunca lança)
 * enquanto WHATSAPP_ENABLED / WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID não estiverem
 * definidos — nesse caso as notificações saem só por email/sino e nada quebra.
 */
class WhatsAppService
{
    public function configurado(): bool
    {
        return (bool) config('services.whatsapp.enabled')
            && filled(config('services.whatsapp.token'))
            && filled(config('services.whatsapp.phone_number_id'));
    }

    /** Idioma por defeito dos templates (ex.: pt_PT). */
    public function idiomaPorDefeito(): string
    {
        return (string) config('services.whatsapp.template_idioma', 'pt_PT');
    }

    /**
     * Envia um template aprovado. $parametros preenchem {{1}}, {{2}}… por ordem.
     * A Meta recusa quebras de linha/tabs/espaços múltiplos numa variável → achatam-se.
     */
    public function enviarTemplate(?string $numero, string $template, ?string $idioma, array $parametros = []): bool
    {
        $destino = $this->normalizarNumero($numero);
        if (! $this->configurado() || $destino === null || $template === '') {
            return false;
        }

        $componentes = [];
        if ($parametros !== []) {
            $componentes[] = [
                'type' => 'body',
                'parameters' => array_map(
                    fn ($p) => ['type' => 'text', 'text' => $this->achatarParaVariavel((string) $p)],
                    array_values($parametros),
                ),
            ];
        }

        return $this->postMensagem($destino, [
            'type' => 'template',
            'template' => [
                'name' => $template,
                'language' => ['code' => $idioma ?: $this->idiomaPorDefeito()],
                'components' => $componentes,
            ],
        ]);
    }

    /** Texto livre — só é entregue dentro da janela de 24h; útil para testes. */
    public function enviarTexto(?string $numero, string $texto): bool
    {
        $destino = $this->normalizarNumero($numero);
        if (! $this->configurado() || $destino === null) {
            return false;
        }

        return $this->postMensagem($destino, [
            'type' => 'text',
            'text' => ['preview_url' => false, 'body' => $texto],
        ]);
    }

    private function postMensagem(string $destino, array $payload): bool
    {
        $versao = (string) config('services.whatsapp.api_version', 'v21.0');
        $phoneId = (string) config('services.whatsapp.phone_number_id');
        $url = "https://graph.facebook.com/{$versao}/{$phoneId}/messages";

        try {
            $resposta = Http::withToken((string) config('services.whatsapp.token'))
                ->timeout((int) config('services.whatsapp.timeout', 15))
                ->acceptJson()
                ->post($url, array_merge([
                    'messaging_product' => 'whatsapp',
                    'recipient_type' => 'individual',
                    'to' => $destino,
                ], $payload));

            if ($resposta->successful()) {
                return true;
            }

            $erro = $resposta->json('error') ?? [];
            $codigo = isset($erro['code']) ? (int) $erro['code'] : null;
            Log::warning('WhatsApp Cloud: envio falhou', [
                'status' => $resposta->status(),
                'codigo' => $codigo,
                'tipo' => $payload['type'] ?? null,
                'razao' => self::explicarErro($codigo, $erro['message'] ?? null),
                'meta' => $erro['message'] ?? $resposta->body(),
            ]);
        } catch (\Throwable $e) {
            Log::warning('WhatsApp Cloud: excepção no envio: '.$e->getMessage());
        }

        return false;
    }

    /**
     * Traduz o código de erro da Meta para uma razão em português com o caminho a seguir.
     * (190 token expirado, 131047 janela de 24h, 132xxx template não aprovado, …)
     */
    public static function explicarErro(?int $codigo, ?string $mensagem): string
    {
        $m = trim((string) $mensagem);

        return match ($codigo) {
            190, 102, 463 => 'Token da Meta expirado/revogado — gerar um token novo e gravar em WHATSAPP_TOKEN.',
            131047 => 'Janela de 24h fechada — só passam templates aprovados (é o que esta integração usa).',
            131026 => 'A Meta não consegue entregar a este número (pode não ter WhatsApp).',
            131031 => 'A conta WhatsApp Business está suspensa/restringida na Meta.',
            132000, 132001, 132005, 132007, 132012, 132015, 132068, 132069 => 'Template não aprovado, idioma ou nº de parâmetros errado — confirmar no WhatsApp Manager.'.($m !== '' ? ' Meta: '.$m : ''),
            133010 => 'O número de origem não está registado na Cloud API (confirmar o Phone Number ID).',
            100 => 'A Meta recusou os dados'.($m !== '' ? ': '.$m : '.'),
            368, 131056 => 'A Meta está a limitar temporariamente os envios — tentar mais tarde.',
            default => $m !== '' ? 'Meta: '.$m : 'A Meta recusou o envio sem dar uma razão.',
        };
    }

    /** Achata texto para caber numa variável de template da Meta (sem \n, \t ou espaços múltiplos). */
    public function achatarParaVariavel(string $texto): string
    {
        $t = preg_replace('/[\r\n\t]+/', ' ', trim($texto));
        $t = preg_replace('/ {2,}/', ' ', (string) $t);

        return trim((string) $t);
    }

    /** Normaliza para E.164 sem '+': só dígitos, com indicativo do país por defeito. */
    private function normalizarNumero(?string $numero): ?string
    {
        if ($numero === null) {
            return null;
        }
        $n = preg_replace('/\D+/', '', $numero) ?? '';
        if (str_starts_with($n, '00')) {
            $n = substr($n, 2); // '00244…' internacional
        }
        $pais = (string) config('services.whatsapp.default_country', '244');
        if (strlen($n) === 9 && str_starts_with($n, '9')) {
            $n = $pais.$n; // número local angolano (9xxxxxxxx)
        }

        return strlen($n) >= 11 ? $n : null;
    }
}
