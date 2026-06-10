<?php

namespace App\Services;

use App\Models\Movement;
use App\Models\Sale;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class ReportService
{
    public function getEntriesReport(array $filters): Collection
    {
        $tz    = config('app.business_timezone');
        $start = Carbon::createFromFormat('Y-m-d', $filters['start_date'], $tz)->startOfDay()->utc();
        $end   = Carbon::createFromFormat('Y-m-d', $filters['end_date'],   $tz)->endOfDay()->utc();

        return Movement::with(['product', 'user'])
            ->where('type', 'entrada')
            ->whereBetween('created_at', [$start, $end])
            ->when($filters['user_id']    ?? null, fn ($q, $v) => $q->where('user_id', $v))
            ->when($filters['product_id'] ?? null, fn ($q, $v) => $q->where('product_id', $v))
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($m) => [
                'id'              => $m->id,
                'product_name'    => $m->product?->name,
                'product_barcode' => $m->product?->barcode,
                'quantity'        => $m->quantity,
                'created_at'      => $m->created_at,
                'user_name'       => $m->user?->name,
            ]);
    }

    public function getSalesReport(array $filters): Collection
    {
        $tz    = config('app.business_timezone');
        $start = Carbon::createFromFormat('Y-m-d', $filters['start_date'], $tz)->startOfDay()->utc();
        $end   = Carbon::createFromFormat('Y-m-d', $filters['end_date'],   $tz)->endOfDay()->utc();

        $sales = Sale::with(['items.product', 'user'])
            ->whereBetween('created_at', [$start, $end])
            ->when($filters['user_id'] ?? null, fn ($q, $v) => $q->where('user_id', $v))
            ->when(
                $filters['product_id'] ?? null,
                fn ($q, $v) => $q->whereHas('items', fn ($iq) => $iq->where('product_id', $v))
            )
            ->orderBy('created_at', 'desc')
            ->get();

        return $sales->flatMap(function ($sale) use ($filters) {
            $items = $sale->items;

            if (!empty($filters['product_id'])) {
                $items = $items->where('product_id', (int) $filters['product_id']);
            }

            return $items->map(fn ($item) => [
                'sale_id'         => $sale->id,
                'product_name'    => $item->product?->name,
                'product_barcode' => $item->product?->barcode,
                'quantity'        => $item->quantity,
                'unit_price'      => (float) $item->unit_price,
                'subtotal'        => (float) $item->subtotal,
                'created_at'      => $sale->created_at,
                'payment_method'  => $sale->payment_method->value,
                'user_name'       => $sale->user?->name,
            ]);
        })->values();
    }
}
