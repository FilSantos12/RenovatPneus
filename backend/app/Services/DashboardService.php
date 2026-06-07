<?php

namespace App\Services;

use App\Models\Movement;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleService;
use Illuminate\Support\Carbon;

class DashboardService
{
    public function getSummary(): array
    {
        $tz    = config('app.business_timezone');
        $start = Carbon::now($tz)->startOfDay()->setTimezone('UTC');
        $end   = Carbon::now($tz)->endOfDay()->setTimezone('UTC');

        $lowStockProducts = Product::query()
            ->whereColumn('quantity', '<=', 'min_stock')
            ->where('active', true)
            ->get();

        return [
            'total_products'     => Product::where('active', true)->count(),
            'total_stock'        => Product::where('active', true)->sum('quantity'),
            'low_stock_count'    => $lowStockProducts->count(),
            'movements_today'    => Movement::whereBetween('created_at', [$start, $end])->count(),
            'entries_today'      => Movement::whereBetween('created_at', [$start, $end])->where('type', 'entrada')->count(),
            'exits_today'        => Movement::whereBetween('created_at', [$start, $end])->where('type', 'saida')->count(),
            'sales_today'        => Sale::whereBetween('created_at', [$start, $end])->whereHas('items')->count(),
            'services_today'     => SaleService::whereBetween('created_at', [$start, $end])->sum('quantity'),
            'revenue_today'      => Sale::whereBetween('created_at', [$start, $end])->where('status', 'pago')->sum('total'),
            'low_stock_products' => $lowStockProducts,
            'chart'              => $this->getWeeklyChart($tz),
        ];
    }

    private function getWeeklyChart(string $tz): array
    {
        $days = [];

        for ($i = 6; $i >= 0; $i--) {
            $day   = Carbon::now($tz)->subDays($i);
            $start = $day->copy()->startOfDay()->setTimezone('UTC');
            $end   = $day->copy()->endOfDay()->setTimezone('UTC');

            $days[] = [
                'date'     => $day->format('Y-m-d'),
                'entries'  => Movement::whereBetween('created_at', [$start, $end])->where('type', 'entrada')->sum('quantity'),
                'exits'    => Movement::whereBetween('created_at', [$start, $end])->where('type', 'saida')->sum('quantity'),
                'services' => SaleService::whereBetween('created_at', [$start, $end])->sum('quantity'),
            ];
        }

        return ['last_7_days' => $days];
    }
}
