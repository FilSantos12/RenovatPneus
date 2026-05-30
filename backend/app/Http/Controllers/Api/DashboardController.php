<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\ProductResource;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __construct(private DashboardService $service) {}

    public function summary(): JsonResponse
    {
        $data = $this->service->getSummary();

        $data['low_stock_products'] = ProductResource::collection($data['low_stock_products']);

        return response()->json($data);
    }
}
