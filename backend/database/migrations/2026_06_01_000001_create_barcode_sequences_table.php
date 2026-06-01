<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barcode_sequences', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('last_sequence')->default(0);
            $table->timestamps();
        });

        DB::table('barcode_sequences')->insert([
            'last_sequence' => 0,
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('barcode_sequences');
    }
};
