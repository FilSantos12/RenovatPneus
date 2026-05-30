<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Service\StoreServiceRequest;
use App\Http\Requests\Service\UpdateServiceRequest;
use App\Http\Resources\ServiceCollection;
use App\Http\Resources\ServiceResource;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index(Request $request): ServiceCollection
    {
        $this->authorize('viewAny', Service::class);

        $services = Service::query()
            ->when($request->name, fn ($q, $v) => $q->where('name', 'like', "%{$v}%"))
            ->when(! is_null($request->active), fn ($q) => $q->where('active', $request->boolean('active')))
            ->paginate(15);

        return new ServiceCollection($services);
    }

    public function store(StoreServiceRequest $request): ServiceResource
    {
        $this->authorize('create', Service::class);

        $service = Service::create($request->validated());

        return new ServiceResource($service);
    }

    public function show(Service $service): ServiceResource
    {
        $this->authorize('view', $service);

        return new ServiceResource($service);
    }

    public function update(UpdateServiceRequest $request, Service $service): ServiceResource
    {
        $this->authorize('update', $service);

        $service->update($request->validated());

        return new ServiceResource($service->fresh());
    }

    public function destroy(Service $service): JsonResponse
    {
        $this->authorize('delete', $service);

        $service->delete();

        return $this->deleted('Serviço removido com sucesso.');
    }
}
