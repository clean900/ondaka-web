<?php
declare(strict_types=1);

namespace App\Http\Middleware;

use App\Domains\Condomino\Models\Condomino;
use App\Domains\Facturacao\Services\LimitacaoAcessoService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Bloqueia serviços "extra" para condóminos em modo limitado por dívida.
 * Aplica-se APENAS a endpoints não-essenciais (reservas, visitantes, marketplace).
 * Os essenciais (extrato, SOS, pagar, negociar) NÃO usam este middleware.
 */
class BloquearCondominoEmDivida
{
    public function __construct(
        private LimitacaoAcessoService $limitacao,
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (! $user) {
            return $next($request);
        }

        $condomino = Condomino::where('user_id', $user->id)->first();
        if (! $condomino) {
            return $next($request); // não é condómino -> não aplica
        }

        if ($this->limitacao->estaLimitado($condomino)) {
            return response()->json([
                'limitado' => true,
                'motivo' => $this->limitacao->motivoLimitacao($condomino),
            ], 403);
        }

        return $next($request);
    }
}
