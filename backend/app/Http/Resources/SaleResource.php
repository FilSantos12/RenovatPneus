<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SaleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'customer_name' => $this->customer_name,
            'status' => $this->status->value,
            'payment_method' => $this->payment_method->value,
            'total' => $this->total,
            'notes' => $this->notes,
            'paid_at' => $this->paid_at?->toISOString(),
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ],
            'items' => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'product' => [
                    'id' => $item->product->id,
                    'name' => $item->product->name,
                ],
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
                'subtotal' => $item->subtotal,
            ]),
            'services' => $this->services->map(fn ($ss) => [
                'id' => $ss->id,
                'service' => [
                    'id' => $ss->service->id,
                    'name' => $ss->service->name,
                ],
                'quantity' => $ss->quantity,
                'unit_price' => $ss->unit_price,
                'subtotal' => $ss->subtotal,
            ]),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
