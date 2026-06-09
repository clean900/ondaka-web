<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('empresa_gestora_id')
                ->nullable()
                ->after('id')
                ->constrained('empresas_gestoras')
                ->nullOnDelete();

            $table->string('telefone', 30)->nullable()->after('email');
            $table->string('bi_numero', 20)->nullable()->after('telefone');
            $table->date('bi_validade')->nullable()->after('bi_numero');
            $table->string('nif', 20)->nullable()->after('bi_validade');
            $table->string('foto_path')->nullable()->after('nif');

            // 2FA SMS
            $table->boolean('sms_2fa_enabled')->default(false)->after('password');
            $table->timestamp('sms_2fa_confirmed_at')->nullable()->after('sms_2fa_enabled');

            // Estado
            $table->enum('estado', ['activo', 'suspenso', 'pendente'])->default('activo');
            $table->string('locale', 5)->default('pt');
            $table->timestamp('ultimo_login_em')->nullable();
            $table->string('ultimo_login_ip', 45)->nullable();

            $table->softDeletes();
            $table->index(['empresa_gestora_id', 'estado']);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['empresa_gestora_id']);
            $table->dropColumn([
                'empresa_gestora_id', 'telefone', 'bi_numero', 'bi_validade',
                'nif', 'foto_path', 'sms_2fa_enabled', 'sms_2fa_confirmed_at',
                'estado', 'locale', 'ultimo_login_em', 'ultimo_login_ip',
                'deleted_at',
            ]);
        });
    }
};
