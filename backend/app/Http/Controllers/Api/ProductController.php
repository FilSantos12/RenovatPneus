<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Http\Resources\ProductCollection;
use App\Http\Resources\ProductResource;
use App\Models\BarcodeSequence;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(private ProductService $service) {}

    public function nextBarcode(): JsonResponse
    {
        $this->authorize('create', Product::class);

        return response()->json([
            'barcode' => BarcodeSequence::peekNext(),
        ]);
    }

    public function index(Request $request): ProductCollection
    {
        $this->authorize('viewAny', Product::class);

        $perPage = max(1, min((int) ($request->per_page ?? 15), 100));

        $products = Product::query()
            ->when($request->name, fn ($q, $v) => $q->where('name', 'like', "%{$v}%"))
            ->when($request->brand, fn ($q, $v) => $q->where('brand', 'like', "%{$v}%"))
            ->when($request->size, fn ($q, $v) => $q->where('size', $v))
            ->when($request->boolean('low_stock'), fn ($q) => $q->whereColumn('quantity', '<=', 'min_stock'))
            ->when(! is_null($request->active), fn ($q) => $q->where('active', $request->boolean('active')))
            ->orderBy('created_at', 'desc')
            ->orderBy('id', 'desc')
            ->paginate($perPage);

        return new ProductCollection($products);
    }

    public function store(StoreProductRequest $request): ProductResource
    {
        $this->authorize('create', Product::class);

        $product = $this->service->store($request->validated());

        return new ProductResource($product);
    }

    public function show(Product $product): ProductResource
    {
        $this->authorize('view', $product);

        return new ProductResource($product);
    }

    public function showByBarcode(string $barcode): ProductResource
    {
        $this->authorize('viewAny', Product::class);

        $product = $this->service->findByBarcode($barcode);

        return new ProductResource($product);
    }

    public function update(UpdateProductRequest $request, Product $product): ProductResource
    {
        $this->authorize('update', $product);

        $product = $this->service->update($product, $request->validated());

        return new ProductResource($product);
    }

    public function destroy(Product $product): JsonResponse
    {
        $this->authorize('delete', $product);

        $this->service->destroy($product);

        return $this->deleted('Produto removido com sucesso.');
    }
}
