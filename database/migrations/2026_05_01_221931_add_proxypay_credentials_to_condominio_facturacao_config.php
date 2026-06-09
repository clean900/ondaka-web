<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Credenciais ProxyPay por CONDOMÍNIO.
     *
     * Cada condomínio tem a sua própria conta ProxyPay — o dinheiro vai
     * directo para a conta bancária do condomínio, não da empresa gestora
     * nem da Soluções Simples.
     *
     * Encriptação: api_token guardado em texto cleartext por agora.
     * TODO: encriptar com Crypt::encrypt() em melhoria futura.
     */
    public function up(): void
    {
        Schema::table('condominio_facturacao_config', function (Blueprint $table) {
            $table->unsignedInteger('proxypay_entity_id')->nullable()->after('observacoes_facturacao')
                ->comment('Entity ID atribuído pelo ProxyPay');
            $table->string('proxypay_api_token', 255)->nullable()->after('proxypay_entity_id')
                ->comment('API token ProxyPay');
            $table->boolean('proxypay_sandbox')->default(true)->after('proxypay_api_token')
                ->comment('Se true usa endpoint sandbox; em produção false');
            $table->boolean('proxypay_activo')->default(false)->after('proxypay_sandbox')
                ->comment('Admin liga/desliga ProxyPay para este condomínio');
        });
    }

    public function down(): void
    {
        Schema::table('condominio_facturacao_config', function (Blueprint $table) {
            $table->dropColumn([
                'proxypay_entity_id',
                'proxypay_api_token',
                'proxypay_sandbox',
                'proxypay_activo',
            ]);
        });
    }
};
