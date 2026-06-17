<?php

use App\Domains\Feature\Models\Feature;
use Illuminate\Database\Migrations\Migration;

/**
 * Corrige o preço-base do Serviço SMS (sms_basico): é a subscrição mensal de
 * 5.000 Kz/mês (não 25 — esse é o preço unitário do Pack Extra).
 */
return new class extends Migration
{
    public function up(): void
    {
        Feature::where('slug', 'sms_basico')->update(['preco_base' => 5000]);
    }

    public function down(): void
    {
        Feature::where('slug', 'sms_basico')->update(['preco_base' => 25]);
    }
};
