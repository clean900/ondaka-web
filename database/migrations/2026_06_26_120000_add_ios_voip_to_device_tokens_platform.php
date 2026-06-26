<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Acrescenta 'ios-voip' ao enum platform de device_tokens, para guardar o token
 * PushKit/VoIP do iPhone (distinto do token FCM normal). Usado para enviar a
 * chamada de voz por push VoIP (APNs) quando o destinatário é iOS.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement(
            "ALTER TABLE device_tokens MODIFY platform ENUM('android','ios','web','ios-voip') NOT NULL DEFAULT 'android'"
        );
    }

    public function down(): void
    {
        DB::statement(
            "ALTER TABLE device_tokens MODIFY platform ENUM('android','ios','web') NOT NULL DEFAULT 'android'"
        );
    }
};
