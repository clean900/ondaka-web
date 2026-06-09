<?php

namespace App\Domains\Familiar\Support;

use App\Domains\Condomino\Models\Condomino;
use App\Domains\Familiar\Models\Familiar;
use App\Models\User;

/**
 * Resolve o Condomino "efetivo" de um utilizador.
 *
 * - Condomino normal: o seu proprio registo.
 * - Familiar: o registo do TITULAR (o familiar "ve atraves" do titular).
 *
 * Uso:
 *   $condomino = CondominoResolver::paraUser($request->user());
 */
class CondominoResolver
{
    public static function paraUser(?User $user): ?Condomino
    {
        if (! $user) {
            return null;
        }

        // 1) Tem Condomino proprio?
        $proprio = Condomino::where('user_id', $user->id)->first();
        if ($proprio) {
            return $proprio;
        }

        // 2) E familiar? Devolve o Condomino do titular.
        if ($user->hasRole('familiar')) {
            $familiar = Familiar::where('user_id', $user->id)->where('ativo', true)->first();
            if ($familiar) {
                return Condomino::find($familiar->condomino_id);
            }
        }

        return null;
    }

    /**
     * Verifica se um familiar pode aceder a uma area.
     * Para nao-familiares devolve sempre true.
     */
    public static function podeAceder(?User $user, string $area): bool
    {
        if (! $user || ! $user->hasRole('familiar')) {
            return true;
        }
        $familiar = Familiar::where('user_id', $user->id)->where('ativo', true)->first();
        if (! $familiar) {
            return false;
        }
        return in_array($area, $familiar->acessos ?? [], true);
    }
}
