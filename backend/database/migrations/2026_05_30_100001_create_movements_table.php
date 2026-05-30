<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Sem softDeletes — movimentação é auditoria, nunca apaga.
    public function up(): void
    {
        Schema::create('movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->restrictOnDelete();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->string('type');    // entrada | saida
            $table->integer('quantity');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('movements');
    }
};
