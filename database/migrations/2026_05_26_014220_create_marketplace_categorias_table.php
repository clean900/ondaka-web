<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('marketplace_categorias', function (Blueprint $table) {
            $table->id();
            $table->string('nome', 80);
            $table->string('slug', 80)->unique();
            $table->string('icone', 50)->nullable();
            $table->unsignedInteger('ordem')->default(100);
            $table->boolean('activa')->default(true);
            $table->timestamps();
        });

        $now = now();
        $cats = [
            ['Mobiliário', 'mobiliario', 'sofa', 10],
            ['Electrónica', 'electronica', 'device-mobile', 20],
            ['Electrodomésticos', 'electrodomesticos', 'wash-machine', 30],
            ['Roupa e acessórios', 'roupa-acessorios', 'shirt', 40],
            ['Serviços', 'servicos', 'briefcase', 50],
            ['Veículos', 'veiculos', 'car', 60],
            ['Outros', 'outros', 'dots', 70],
        ];
        foreach ($cats as [$nome, $slug, $icone, $ordem]) {
            DB::table('marketplace_categorias')->insert([
                'nome' => $nome, 'slug' => $slug, 'icone' => $icone,
                'ordem' => $ordem, 'activa' => true,
                'created_at' => $now, 'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('marketplace_categorias');
    }
};
