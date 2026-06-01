<?php

namespace App\Services;

use App\Models\BarcodeSequence;
use App\Models\Product;

class ProductService
{
    public function store(array $data): Product
    {
        if (empty($data['barcode'])) {
            $data['barcode'] = BarcodeSequence::generateNext();
        }

        return Product::create($data);
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
