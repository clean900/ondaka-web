<?php

declare(strict_types=1);

namespace App\Domains\Notifications\Http\Controllers;

use App\Domains\Notifications\Models\DeviceToken;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DeviceTokenController extends Controller
{
    /**
     * POST /api/devices/register-fcm-token
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string', 'max:500'],
            'platform' => ['required', 'string', 'in:android,ios,web,ios-voip'],
        ]);

        $user = $request->user();

        // updateOrCreate por token (cada device tem token único)
        $device = DeviceToken::updateOrCreate(
            ['token' => $validated['token']],
            [
                'user_id' => $user->id,
                'platform' => $validated['platform'],
                'last_used_at' => now(),
            ],
        );

        Log::info('[Devices] token registado', [
            'user_id' => $user->id,
            'platform' => $validated['platform'],
            'token_prefixo' => substr($validated['token'], 0, 12),
        ]);

        return response()->json([
            'message' => 'Token registado com sucesso.',
            'data' => $device,
        ]);
    }
}
