<?php

declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use App\Http\Controllers\Auth\RecuperarPasswordController;

// Página de login
Route::middleware('guest')->group(function () {
    Route::get('/login', function () {
        return Inertia::render('Auth/Login');
    })->name('login');

    Route::post('/login', function (Request $request) {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => 'Credenciais inválidas.',
            ]);
        }

        $request->session()->regenerate();

        // Reset 2FA para forçar nova verificação
        $request->session()->forget('sms_2fa_verificado');

        $user = Auth::user();

        if (! $user->estaAtivo()) {
            Auth::logout();
            throw ValidationException::withMessages([
                'email' => 'Utilizador suspenso. Contacte o administrador.',
            ]);
        }

        // Fallback: garantir condomínio activo para admins-empresa/gestores sem um definido
        if (! $user->condominio_activo_id && $user->empresa_gestora_id) {
            $primeiroCondominio = \App\Domains\Condominio\Models\Condominio::where('empresa_gestora_id', $user->empresa_gestora_id)
                ->orderBy('id')
                ->first();
            if ($primeiroCondominio) {
                $user->condominio_activo_id = $primeiroCondominio->id;
                $user->save();
            }
        }

        return redirect()->intended(route('dashboard'));
    });
});

// Recuperação de palavra-passe (SMS/OTP) — página única, utilizador sem sessão
Route::middleware('guest')->group(function () {
    Route::get('/recuperar-password', [RecuperarPasswordController::class, 'mostrar'])
        ->name('recuperar-password');
    Route::post('/recuperar-password/enviar', [RecuperarPasswordController::class, 'enviarCodigo'])
        ->middleware('throttle:6,1')
        ->name('recuperar-password.enviar');
    Route::post('/recuperar-password/verificar', [RecuperarPasswordController::class, 'verificarCodigo'])
        ->middleware('throttle:10,1')
        ->name('recuperar-password.verificar');
    Route::post('/recuperar-password/redefinir', [RecuperarPasswordController::class, 'redefinir'])
        ->middleware('throttle:10,1')
        ->name('recuperar-password.redefinir');
});

// Logout
Route::post('/logout', function (Request $request) {
    Auth::guard('web')->logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();
    return redirect()->route('login');
})->middleware('auth')->name('logout');
