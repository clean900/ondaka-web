<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        DB::statement("
            ALTER TABLE plataforma_subscricao_eventos
            MODIFY tipo ENUM(
                'criada','trial_iniciado','trial_expirou','imoveis_alterados',
                'factura_emitida','pagamento_recebido','activada','limitada',
                'cancelada','reactivada','cancelada_pelo_cliente',
                'cancelamento_revertido','recuperacao_notificada',
                'trial_estendido','plano_alterado'
            ) NOT NULL
        ");
    }

    public function down(): void
    {
        DB::statement("
            ALTER TABLE plataforma_subscricao_eventos
            MODIFY tipo ENUM(
                'criada','trial_iniciado','trial_expirou','imoveis_alterados',
                'factura_emitida','pagamento_recebido','activada','limitada',
                'cancelada','reactivada'
            ) NOT NULL
        ");
    }
};
