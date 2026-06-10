<?php

namespace App\Services;

use App\Models\BarcodeSequence;
use App\Models\Movement;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ProductService
{
    public function store(array $data): Product
    {
        return DB::transaction(function () use ($data) {
            if (empty($data['barcode'])) {
                $data['barcode'] = BarcodeSequence::generateNext();
            }

            $product = Product::create($data);

            if ($product->quantity > 0) {
                Movement::create([
                    'product_id' => $product->id,
                    'type'       => 'entrada',
                    'quantity'   => $product->quantity,
                    'user_id'    => Auth::id(),
                    'notes'      => 'Estoque inicial',
                ]);
            }

            return $product;
        });
    }

    public function update(Product $product, array $data): Product
    {
        $product->update($data);

        return $product->fresh();
    }

    public function destroy(Product $product): void
    {
        $product->delete();
    }

    public function findByBarcode(string $barcode): Product
    {
        return Product::where('barcode', $barcode)->firstOrFail();
    }
}
