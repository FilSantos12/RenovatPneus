<?php

namespace App\Services;

use App\Enums\SaleStatus;
use App\Models\Sale;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class SaleService
{
    public function __construct(private MovementService $movementService) {}

    public function store(array $data, User $user): Sale
    {
        return DB::transaction(function () use ($data, $user) {
            $items = $data['items'] ?? [];
            $services = $data['services'] ?? [];

            $total = collect($items)->sum(fn ($i) => $i['quantity'] * $i['unit_price'])
                   + collect($services)->sum(fn ($s) => $s['quantity'] * $s['unit_price']);

            $sale = Sale::create([
                'user_id' => $user->id,
                'customer_name' => $data['customer_name'] ?? null,
                'payment_method' => $data['payment_method'],
                'status' => SaleStatus::PENDENTE,
                'total' => $total,
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($items as $item) {
                $sale->items()->create([
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $item['quantity'] * $item['unit_price'],
                ]);

                // Dar baixa no estoque reutilizando MovementService
                $this->movementService->store([
                    'product_id' => $item['product_id'],
                    'type' => 'saida',
                    'quantity' => $item['quantity'],
                    'notes' => "Venda #{$sale->id}",
                ], $user);
            }

            foreach ($services as $service) {
                $sale->services()->create([
                    'service_id' => $service['service_id'],
                    'quantity' => $service['quantity'],
                    'unit_price' => $service['unit_price'],
                    'subtotal' => $service['quantity'] * $service['unit_price'],
                ]);
            }

            return $sale->load(['user', 'items.product', 'services.service']);
        });
    }

    public function updateStatus(Sale $sale, array $data): Sale
    {
        $updateData = ['status' => $data['status']];

        if (! empty($data['payment_method'])) {
            $updateData['payment_method'] = $data['payment_method'];
        }

        if ($data['status'] === 'pago' && ! $sale->paid_at) {
            $updateData['paid_at'] = now();
        }

        $sale->update($updateData);

        return $sale->fresh(['user', 'items.product', 'services.service']);
    }

    public function destroy(Sale $sale): void
    {
        $sale->delete();
    }
}
