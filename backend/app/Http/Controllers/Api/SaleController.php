<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Sale\StoreSaleRequest;
use App\Http\Requests\Sale\UpdateSaleStatusRequest;
use App\Http\Resources\SaleCollection;
use App\Http\Resources\SaleResource;
use App\Models\Sale;
use App\Services\SaleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SaleController extends Controller
{
    public function __construct(private SaleService $service) {}

    public function index(Request $request): SaleCollection
    {
        $this->authorize('viewAny', Sale::class);

        $sales = Sale::with(['user', 'items.product', 'services.service'])
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->when($request->user_id, fn ($q, $v) => $q->where('user_id', $v))
            ->when($request->date, fn ($q, $v) => $q->whereDate('created_at', $v))
            ->latest()
            ->paginate(15);

        return new SaleCollection($sales);
    }

    public function store(StoreSaleRequest $request): SaleResource
    {
        $this->authorize('create', Sale::class);

        $sale = $this->service->store($request->validated(), $request->user());

        return new SaleResource($sale);
    }

    public function show(Sale $sale): SaleResource
    {
        $this->authorize('view', $sale);

        $sale->loadMissing(['user', 'items.product', 'services.service']);

        return new SaleResource($sale);
    }

    public function updateStatus(UpdateSaleStatusRequest $request, Sale $sale): SaleResource
    {
        $this->authorize('update', $sale);

        $sale = $this->service->updateStatus($sale, $request->validated());

        return new SaleResource($sale);
    }

    public function destroy(Sale $sale): JsonResponse
    {
        $this->authorize('delete', $sale);

        $this->service->destroy($sale);

        return $this->deleted('Venda removida com sucesso.');
    }
}
