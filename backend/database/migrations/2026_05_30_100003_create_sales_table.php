<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->string('customer_name')->nullable();
            $table->string('status')->default('pendente');         // pendente | pago | cancelado
            $table->string('payment_method');                       // dinheiro | cartao_credito | cartao_debito | pix | fiado
            $table->decimal('total', 10, 2);
            $table->text('notes')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
