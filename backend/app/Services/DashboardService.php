<?php

namespace App\Services;

use App\Models\Movement;
use App\Models\Product;
use App\Models\Sale;

class DashboardService
{
    public function getSummary(): array
    {
        $today = today();

        $lowStockProducts = Product::query()
            ->whereColumn('quantity', '<=', 'min_stock')
            ->where('active', true)
            ->get();

        return [
            'total_products' => Product::where('active', true)->count(),
            'total_stock' => Product::where('active', true)->sum('quantity'),
            'low_stock_count' => $lowStockProducts->count(),
            'movements_today' => Movement::whereDate('created_at', $today)->count(),
            'entries_today' => Movement::whereDate('created_at', $today)->where('type', 'entrada')->count(),
            'exits_today' => Movement::whereDate('created_at', $today)->where('type', 'saida')->count(),
            'sales_today' => Sale::whereDate('created_at', $today)->count(),
            'revenue_today' => Sale::whereDate('created_at', $today)->where('status', 'pago')->sum('total'),
            'low_stock_products' => $lowStockProducts,
        ];
    }
}
