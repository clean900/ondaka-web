<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domains\Empresa\Models\EmpresaGestora;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class EmpresaGestoraDemoSeeder extends Seeder
{
    public function run(): void
    {
        // Empresa gestora: Soluções Simples
        $empresa = EmpresaGestora::firstOrCreate(
            ['slug' => 'solucoes-simples'],
            [
                'nome' => 'Soluções Simples, Lda',
                'nif' => '5417890123',
                'email_contacto' => 'geral@ondaka.ao',
                'telefone' => '+244923000000',
                'morada' => 'Luanda, Angola',
                'provincia' => 'Luanda',
                'municipio' => 'Luanda',
                'plano' => 'pro',
                'activa' => true,
            ]
        );

        // Utilizador admin principal
        $admin = User::firstOrCreate(
            ['email' => 'admin@ondaka.ao'],
            [
                'empresa_gestora_id' => $empresa->id,
                'name' => 'Bráulio Gonçalves',
                'password' => Hash::make('Ondaka@2026'),
                'telefone' => '+244923111111',
                'estado' => 'activo',
                'locale' => 'pt',
                'email_verified_at' => now(),
            ]
        );

        if (! $admin->hasRole('admin-empresa')) {
            $admin->assignRole('admin-empresa');
        }

        $this->command->info('✓ Empresa «Soluções Simples» criada.');
        $this->command->info('  Email: admin@ondaka.ao');
        $this->command->info('  Password: Ondaka@2026');
        $this->command->warn('  ⚠ ALTERAR PASSWORD APÓS PRIMEIRO LOGIN');
    }
}
