<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->nullable()->change();
        });
    }

    /**
     * Best-effort: falha se já existirem linhas com email NULL no momento
     * do rollback (violação de NOT NULL). Não há como reidratar um e-mail
     * que nunca foi coletado — reverter esta migration após uso em produção
     * exige backfill manual antes do down(), ou aceitar a falha.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->nullable(false)->change();
        });
    }
};
