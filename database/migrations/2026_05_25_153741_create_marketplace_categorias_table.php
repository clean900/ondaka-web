<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('marketplace_categorias', function (Blueprint $table) {
            $table->id();
            $table->string('nome', 80);
            $table->string('slug', 80)->unique();
            $table->string('icone', 50)->nullable();
            $table->unsignedInteger('ordem')->default(0);
            $table->boolean('activa')->default(true);
            $table->timestamps();

            $table->index('activa');
        });

        $now = now();
        $cats = [
            ['Canalizador', 'canalizador', 'wrench'],
            ['Electricista', 'electricista', 'zap'],
            ['Jardineiro', 'jardineiro', 'flower'],
            ['Técnico de AC', 'tecnico-ac', 'wind'],
            ['Pintor', 'pintor', 'paintbrush'],
            ['Pedreiro', 'pedreiro', 'hammer'],
            ['Carpinteiro', 'carpinteiro', 'saw'],
            ['Serralheiro', 'serralheiro', 'lock'],
            ['Limpeza', 'limpeza', 'sparkles'],
            ['Dedetização', 'dedetizacao', 'bug'],
            ['Segurança', 'seguranca', 'shield'],
            ['Outros', 'outros', 'more-horizontal'],
        ];
        $rows = [];
        foreach ($cats as $i => [$nome, $slug, $icone]) {
            $rows[] = [
                'nome' => $nome, 'slug' => $slug, 'icone' => $icone,
                'ordem' => $i, 'activa' => true,
                'created_at' => $now, 'updated_at' => $now,
            ];
        }
        \DB::table('marketplace_categorias')->insert($rows);
    }

    public function down(): void
    {
        Schema::dropIfExists('marketplace_categorias');
    }
};
