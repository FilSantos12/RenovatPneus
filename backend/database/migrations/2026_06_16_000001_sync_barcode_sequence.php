<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $maxBarcode = DB::table('products')
            ->where('barcode', 'like', 'RNV-%')
            ->orderBy('barcode', 'desc')
            ->value('barcode');

        if ($maxBarcode !== null) {
            $maxNum  = (int) substr($maxBarcode, 4);
            $current = (int) (DB::table('barcode_sequences')->value('last_sequence') ?? 0);
            DB::table('barcode_sequences')->update([
                'last_sequence' => max($maxNum, $current),
                'updated_at'    => now(),
            ]);
        }
    }

    public function down(): void {}
};

