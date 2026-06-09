<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissoes = [
            // Plataforma (super-admin)
            'plataforma.empresas.ver',
            'plataforma.empresas.criar',
            'plataforma.empresas.editar',
            'plataforma.empresas.suspender',
            'plataforma.auditoria.ver',

            // Empresa gestora
            'empresa.configuracoes.ver',
            'empresa.configuracoes.editar',
            'empresa.utilizadores.ver',
            'empresa.utilizadores.criar',
            'empresa.utilizadores.editar',
            'empresa.utilizadores.desactivar',

            // Condomínios
            'condominios.ver',
            'condominios.criar',
            'condominios.editar',
            'condominios.eliminar',
            'condominios.administrador.atribuir',

            // Edifícios e fracções
            'edificios.ver', 'edificios.criar', 'edificios.editar', 'edificios.eliminar',
            'fraccoes.ver', 'fraccoes.criar', 'fraccoes.editar', 'fraccoes.eliminar',

            // Condóminos
            'condominos.ver', 'condominos.criar', 'condominos.editar', 'condominos.eliminar',
            'condominos.contratos.gerir',

            // Facturação
            'facturacao.faturas.ver', 'facturacao.faturas.criar', 'facturacao.faturas.anular',
            'facturacao.multas.aplicar',
            'facturacao.extratos.ver', 'facturacao.extratos.exportar',
            'facturacao.quotas.configurar',

            // Pagamentos
            'pagamentos.ver', 'pagamentos.registar.manual', 'pagamentos.reconciliar',
            'pagamentos.reembolsar',

            // Comunicação
            'chat.usar',
            'avisos.ver', 'avisos.criar', 'avisos.editar', 'avisos.eliminar', 'avisos.agendar',
            'votacoes.ver', 'votacoes.criar', 'votacoes.votar', 'votacoes.encerrar',

            // Documentos
            'documentos.ver', 'documentos.enviar', 'documentos.versoes.gerir', 'documentos.eliminar',

            // Segurança
            'visitantes.registar', 'visitantes.autorizar', 'visitantes.ver',
            'encomendas.registar', 'encomendas.entregar', 'encomendas.ver',
            'passes.criar', 'passes.aprovar', 'passes.revogar',
            'sos.accionar', 'sos.atender', 'sos.historico.ver',
            'anpr.ver', 'anpr.configurar',

            // Próprio
            'proprio.faturas.ver', 'proprio.pagamentos.efectuar', 'proprio.extrato.ver',
            'proprio.perfil.editar', 'proprio.votacoes.participar', 'proprio.visitantes.pre_autorizar',
        ];

        foreach ($permissoes as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        }

        // super-admin
        $superAdmin = Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);
        $superAdmin->syncPermissions(Permission::all());

        // admin-empresa
        $adminEmpresa = Role::firstOrCreate(['name' => 'admin-empresa', 'guard_name' => 'web']);
        $adminEmpresa->syncPermissions(
            Permission::whereNotIn('name', [
                'plataforma.empresas.criar',
                'plataforma.empresas.suspender',
            ])->get()
        );

        // gestor
        $gestor = Role::firstOrCreate(['name' => 'gestor', 'guard_name' => 'web']);
        $gestor->syncPermissions([
            'condominios.ver', 'condominios.editar',
            'edificios.ver', 'edificios.criar', 'edificios.editar',
            'fraccoes.ver', 'fraccoes.criar', 'fraccoes.editar',
            'condominos.ver', 'condominos.criar', 'condominos.editar', 'condominos.contratos.gerir',
            'facturacao.faturas.ver', 'facturacao.faturas.criar',
            'facturacao.multas.aplicar', 'facturacao.extratos.ver', 'facturacao.extratos.exportar',
            'facturacao.quotas.configurar',
            'pagamentos.ver', 'pagamentos.registar.manual', 'pagamentos.reconciliar',
            'chat.usar',
            'avisos.ver', 'avisos.criar', 'avisos.editar', 'avisos.agendar',
            'votacoes.ver', 'votacoes.criar',
            'documentos.ver', 'documentos.enviar', 'documentos.versoes.gerir',
            'visitantes.ver', 'encomendas.ver',
            'passes.criar', 'passes.aprovar',
            'sos.historico.ver',
        ]);

        // administrador-condominio (eleito, DP 141/15)
        $adminCondominio = Role::firstOrCreate(['name' => 'administrador-condominio', 'guard_name' => 'web']);
        $adminCondominio->syncPermissions([
            'condominios.ver',
            'edificios.ver', 'fraccoes.ver', 'condominos.ver',
            'facturacao.faturas.ver', 'facturacao.extratos.ver', 'facturacao.extratos.exportar',
            'pagamentos.ver',
            'chat.usar',
            'avisos.ver', 'avisos.criar',
            'votacoes.ver', 'votacoes.criar', 'votacoes.encerrar',
            'documentos.ver', 'documentos.enviar',
            'proprio.faturas.ver', 'proprio.pagamentos.efectuar', 'proprio.extrato.ver',
            'proprio.perfil.editar', 'proprio.votacoes.participar', 'proprio.visitantes.pre_autorizar',
        ]);

        // condómino
        $condomino = Role::firstOrCreate(['name' => 'condomino', 'guard_name' => 'web']);
        $condomino->syncPermissions([
            'chat.usar',
            'avisos.ver',
            'votacoes.ver', 'votacoes.votar',
            'documentos.ver',
            'proprio.faturas.ver', 'proprio.pagamentos.efectuar', 'proprio.extrato.ver',
            'proprio.perfil.editar', 'proprio.votacoes.participar', 'proprio.visitantes.pre_autorizar',
        ]);

        // funcionário (porteiro/segurança)
        $funcionario = Role::firstOrCreate(['name' => 'funcionario', 'guard_name' => 'web']);
        $funcionario->syncPermissions([
            'visitantes.registar', 'visitantes.autorizar', 'visitantes.ver',
            'encomendas.registar', 'encomendas.entregar', 'encomendas.ver',
            'passes.criar',
            'sos.atender', 'sos.historico.ver',
            'anpr.ver',
            'chat.usar',
        ]);

        // prestador (sem permissões web)
        Role::firstOrCreate(['name' => 'prestador', 'guard_name' => 'web']);

        $this->command->info('✓ Roles e permissões criados.');
    }
}
