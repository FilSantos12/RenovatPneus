<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class BarcodeSequence extends Model
{
    protected $fillable = ['last_sequence'];

    public static function generateNext(): string
    {
        return DB::transaction(function () {
            $sequence = static::lockForUpdate()->first();
            $next = $sequence->last_sequence + 1;
            $sequence->update(['last_sequence' => $next]);
            return 'RNV-' . str_pad($next, 6, '0', STR_PAD_LEFT);
        });
    }

    public static function peekNext(): string
    {
        $sequence = static::first();
        $next = ($sequence?->last_sequence ?? 0) + 1;
        return 'RNV-' . str_pad($next, 6, '0', STR_PAD_LEFT);
    }
}
