<?php

namespace App\Http\Controllers\Api;

use App\Enums\SaleStatus;
use App\Enums\PaymentMethod;
use App\Models\Sale;
use App\Services\PeriodService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FinanceController extends Controller
{
    public function __construct(private PeriodService $periodService) {}

    public function summary(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Sale::class);

        $period = $request->query('period', 'month');
        $tz     = config('app.business_timezone');

        [$start, $end] = match ($period) {
            'today' => [Carbon::now($tz)->startOfDay(), Carbon::now($tz)],
            'year'  => [Carbon::now($tz)->startOfYear(), Carbon::now($tz)],
            // $end aqui é sempre "agora", não o fim do período configurado —
            // o período pode ainda não ter terminado, e queremos refletir só
            // o que já ocorreu até o momento, igual ao comportamento anterior.
            default => [$this->periodService->currentMonthPeriod()['start'], Carbon::now($tz)],
        };

        // Todas as vendas não-canceladas do período (PAGO + PENDENTE)
        $sales = Sale::with(['items.product', 'services.service', 'user'])
            ->whereBetween('created_at', [$start, $end])
            ->where('status', '!=', SaleStatus::CANCELADO)
            ->get();

        $revenue = $sales->sum('total');

        $cost = $sales->flatMap->items->sum(function ($item) {
            return ((float) ($item->product?->price_cost ?? 0)) * $item->quantity;
        });

        $serviceCost = $sales->flatMap->services->sum(function ($ss) {
            return ((float) ($ss->service?->price_cost ?? 0)) * $ss->quantity;
        });

        // Lucro = Receita - Custo dos Produtos - Custo dos Serviços
        $profit = (float) $revenue - $cost - $serviceCost;
        $margin = (float) $revenue > 0 ? round(($profit / (float) $revenue) * 100, 1) : 0;

        $fiadoTotal = Sale::where('payment_method', PaymentMethod::FIADO)
            ->where('status', SaleStatus::PENDENTE)
            ->sum('total');

        $fiadoCount = Sale::where('payment_method', PaymentMethod::FIADO)
            ->where('status', SaleStatus::PENDENTE)
            ->count();

        $paymentMethods = $sales
            ->groupBy(fn ($s) => $s->payment_method->value)
            ->map(fn ($group) => [
                'total' => round((float) $group->sum('total'), 2),
                'count' => $group->count(),
            ]);

        $series = $this->buildSeries($period, $start, $end);

        $recentSales = $sales->sortByDesc('created_at')->take(8);

        return response()->json([
            'data' => [
                'period'          => $period,
                'revenue'         => round($revenue, 2),
                'cost'            => round($cost, 2),
                'service_cost'    => round($serviceCost, 2),
                'profit'          => round($profit, 2),
                'margin'          => $margin,
                'fiado_count'     => $fiadoCount,
                'fiado_total'     => round($fiadoTotal, 2),
                'payment_methods' => $paymentMethods,
                'series'          => $series,
                'recent_sales'    => $recentSales->values()->map(fn ($s) => [
                    'id'             => $s->id,
                    'description'    => $this->buildSaleDescription($s),
                    'total'          => $s->total,
                    'status'         => $s->status->value,
                    'payment_method' => $s->payment_method->value,
                    'user_name'      => $s->user?->name,
                    'created_at'     => $s->created_at->format('d/m H:i'),
                ]),
            ],
        ]);
    }

    private function buildSeries(string $period, Carbon $start, Carbon $end): array
    {
        if ($period === 'today') {
            return $this->seriesByHour($start, $end);
        }

        if ($period === 'year') {
            return $this->seriesByMonth($start, $end);
        }

        return $this->seriesByWeek($start, $end);
    }

    private function seriesByWeek(Carbon $start, Carbon $end): array
    {
        $weeks = [];
        $cursor = $start->copy()->startOfWeek();

        while ($cursor->lte($end)) {
            $weekEnd = $cursor->copy()->endOfWeek();
            $sales = Sale::where('status', '!=', SaleStatus::CANCELADO)
                ->whereBetween('created_at', [$cursor, $weekEnd])
                ->with(['items.product', 'services.service'])
                ->get();

            $revenue     = (float) $sales->sum('total');
            $cost        = $sales->flatMap->items->sum(fn ($i) => ((float) ($i->product?->price_cost ?? 0)) * $i->quantity);
            $serviceCost = $sales->flatMap->services->sum(fn ($s) => ((float) ($s->service?->price_cost ?? 0)) * $s->quantity);

            $weeks[] = [
                'label'   => 'Sem ' . $cursor->weekOfMonth,
                'revenue' => round($revenue, 2),
                'cost'    => round($cost, 2),
                'profit'  => round($revenue - $cost - $serviceCost, 2),
            ];

            $cursor->addWeek();
        }

        return array_slice($weeks, -4);
    }

    private function seriesByMonth(Carbon $start, Carbon $end): array
    {
        $months = [];
        $monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

        // Limitação conhecida: $start aqui é sempre 1º de janeiro (calendário,
        // vindo do branch 'year' de summary()). Quando dia_inicio_mes != 1,
        // periodContaining(1º de janeiro) encontra o ciclo que CONTÉM essa
        // data, que pode ter começado em dezembro do ano anterior — ou seja,
        // o primeiro bucket do gráfico anual pode representar um ciclo
        // parcial iniciado no ano anterior. Decisão de UX pendente (rotular/
        // cortar esse ciclo parcial de outra forma) — ver histórico do
        // projeto / discussão da feature de dia_inicio_mes configurável.
        $period = $this->periodService->periodContaining($start);

        while ($period['start']->lte($end)) {
            $sales = Sale::where('status', '!=', SaleStatus::CANCELADO)
                ->whereBetween('created_at', [$period['start'], $period['end']])
                ->with(['items.product', 'services.service'])
                ->get();

            $revenue     = (float) $sales->sum('total');
            $cost        = $sales->flatMap->items->sum(fn ($i) => ((float) ($i->product?->price_cost ?? 0)) * $i->quantity);
            $serviceCost = $sales->flatMap->services->sum(fn ($s) => ((float) ($s->service?->price_cost ?? 0)) * $s->quantity);

            // Rotula pelo mês em que o ciclo COMEÇA — ex.: com dia_inicio_mes=25,
            // o período de 25/set a 24/out aparece rotulado como "Set".
            $months[] = [
                'label'   => $monthNames[$period['start']->month - 1],
                'revenue' => round($revenue, 2),
                'cost'    => round($cost, 2),
                'profit'  => round($revenue - $cost - $serviceCost, 2),
            ];

            $period = $this->periodService->nextPeriod($period);
        }

        return $months;
    }

    private function seriesByHour(Carbon $start, Carbon $end): array
    {
        $hours = [];
        $cursor = $start->copy()->startOfDay()->setHour(7);

        while ($cursor->lte($end) && $cursor->hour <= 20) {
            $hourEnd = $cursor->copy()->addHour();
            $sales = Sale::where('status', '!=', SaleStatus::CANCELADO)
                ->whereBetween('created_at', [$cursor, $hourEnd])
                ->with(['items.product', 'services.service'])
                ->get();

            $revenue     = (float) $sales->sum('total');
            $cost        = $sales->flatMap->items->sum(fn ($i) => ((float) ($i->product?->price_cost ?? 0)) * $i->quantity);
            $serviceCost = $sales->flatMap->services->sum(fn ($s) => ((float) ($s->service?->price_cost ?? 0)) * $s->quantity);

            $hours[] = [
                'label'   => $cursor->format('H') . 'h',
                'revenue' => round($revenue, 2),
                'cost'    => round($cost, 2),
                'profit'  => round($revenue - $cost - $serviceCost, 2),
            ];

            $cursor->addHour();
        }

        return $hours;
    }

    private function buildSaleDescription(Sale $sale): string
    {
        $parts = [];

        $firstItem = $sale->items->first();
        if ($firstItem) {
            $name = $firstItem->product?->name ?? 'Produto';
            if (strlen($name) > 22) {
                $name = substr($name, 0, 22) . '…';
            }
            $parts[] = $name . ' ×' . $firstItem->quantity;
        }

        $firstService = $sale->services->first();
        if ($firstService && !$firstItem) {
            $parts[] = $firstService->service?->name ?? 'Serviço';
        }

        if ($sale->items->count() + $sale->services->count() > 1) {
            $parts[] = '+ outros';
        }

        return implode(' · ', $parts) ?: 'Venda #' . $sale->id;
    }
}
