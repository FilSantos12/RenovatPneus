<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'barcode' => $this->barcode,
            'description' => $this->description,
            'brand' => $this->brand,
            'size' => $this->size,
            'price_cost' => $this->price_cost,
            'price_sale' => $this->price_sale,
            'quantity' => $this->quantity,
            'min_stock' => $this->min_stock,
            'low_stock' => $this->quantity <= $this->min_stock,
            'active' => $this->active,
        ];
    }
}
