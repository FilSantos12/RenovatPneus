<?php

namespace App\Http\Controllers\Api;

use App\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(private ReportService $service) {}

    public function entries(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
            'user_id'    => 'nullable|integer|exists:users,id',
            'product_id' => 'nullable|integer|exists:products,id',
        ]);

        $result = $this->service->getEntriesReport($filters);

        return response()->json(['data' => $result, 'total' => $result->count()]);
    }

    public function sales(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
            'user_id'    => 'nullable|integer|exists:users,id',
            'product_id' => 'nullable|integer|exists:products,id',
        ]);

        $result = $this->service->getSalesReport($filters);

        return response()->json(['data' => $result, 'total' => $result->count()]);
    }
}
