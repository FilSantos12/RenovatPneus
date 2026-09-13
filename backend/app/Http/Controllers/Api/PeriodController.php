<?php

namespace App\Http\Controllers\Api;

use App\Models\Setting;
use App\Services\PeriodService;
use Illuminate\Http\JsonResponse;

class PeriodController extends Controller
{
    public function __construct(private PeriodService $service) {}

    public function current(): JsonResponse
    {
        $period = $this->service->currentMonthPeriod();

        return response()->json([
            'data' => [
                'start'          => $period['start']->toIso8601String(),
                'end'            => $period['end']->toIso8601String(),
                'dia_inicio_mes' => (int) Setting::get('dia_inicio_mes', 1),
            ],
        ]);
    }
}
