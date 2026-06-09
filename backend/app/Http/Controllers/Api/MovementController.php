<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Movement\StoreMovementRequest;
use App\Http\Resources\MovementCollection;
use App\Http\Resources\MovementResource;
use App\Models\Movement;
use App\Services\MovementService;
use Illuminate\Http\Request;

class MovementController extends Controller
{
    public function __construct(private MovementService $service) {}

    public function index(Request $request): MovementCollection
    {
        $this->authorize('viewAny', Movement::class);

        $movements = Movement::with(['product', 'user'])
            ->when($request->product_id, fn ($q, $v) => $q->where('product_id', $v))
            ->when($request->type, fn ($q, $v) => $q->where('type', $v))
            ->when($request->date, fn ($q, $v) => $q->whereDate('created_at', $v))
            ->latest()
            ->paginate(15);

        return new MovementCollection($movements);
    }

    public function store(StoreMovementRequest $request): MovementResource
    {
        $this->authorize('create', Movement::class);

        $movement = $this->service->store($request->validated(), $request->user());

        return new MovementResource($movement);
    }

    public function show(Movement $movement): MovementResource
    {
        $this->authorize('view', $movement);

        $movement->loadMissing(['product', 'user']);

        return new MovementResource($movement);
    }

    public function destroy(Movement $movement): \Illuminate\Http\JsonResponse
    {
        $this->authorize('delete', $movement);
        $this->service->destroy($movement);
        return response()->json(['message' => 'Entrada excluída com sucesso.']);
    }
}
