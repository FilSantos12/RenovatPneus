<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('barcode')->unique();       // crítico para scanner
            $table->index('barcode', 'products_barcode_index');
            $table->text('description')->nullable();
            $table->string('brand')->nullable();
            $table->string('size')->nullable();        // ex: "175/70 R14"
            $table->decimal('price_cost', 10, 2);
            $table->decimal('price_sale', 10, 2);
            $table->integer('quantity')->default(0);
            $table->integer('min_stock')->default(2);  // alerta de estoque baixo
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
