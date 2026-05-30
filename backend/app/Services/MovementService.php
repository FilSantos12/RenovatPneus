<?php

namespace App\Services;

use App\Enums\MovementType;
use App\Exceptions\InsufficientStockException;
use App\Models\Movement;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class MovementService
{
    public function store(array $data, User $user): Movement
    {
        return DB::transaction(function () use ($data, $user) {
            $product = Product::lockForUpdate()->findOrFail($data['product_id']);
            $type = MovementType::from($data['type']);

            if ($type === MovementType::SAIDA) {
                if ($product->quantity < $data['quantity']) {
                    throw new InsufficientStockException(
                        $product->name,
                        $data['quantity'],
                        $product->quantity
                    );
                }
                $product->decrement('quantity', $data['quantity']);
            } else {
                $product->increment('quantity', $data['quantity']);
            }

            $movement = Movement::create([
                'product_id' => $product->id,
                'user_id' => $user->id,
                'type' => $type,
                'quantity' => $data['quantity'],
                'notes' => $data['notes'] ?? null,
            ]);

            return $movement->load(['product', 'user']);
        });
    }
}
