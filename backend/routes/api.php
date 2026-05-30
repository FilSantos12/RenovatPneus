<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\MovementController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// Health check (público)
Route::get('/health', fn () => response()->json(['status' => 'ok', 'timestamp' => now()]));

// Autenticação (público)
Route::post('/login', [AuthController::class, 'login']);

// Rotas protegidas
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/dashboard', [DashboardController::class, 'summary']);

    // Produto por barcode — antes do resource para não conflitar com route model binding
    Route::get('/products/barcode/{barcode}', [ProductController::class, 'showByBarcode']);
    Route::apiResource('products', ProductController::class);

    Route::apiResource('movements', MovementController::class)->only(['index', 'show', 'store']);

    Route::apiResource('services', ServiceController::class);

    Route::patch('/sales/{sale}/status', [SaleController::class, 'updateStatus']);
    Route::apiResource('sales', SaleController::class);

    // Usuários — só ADM (middleware role complementa as Policies)
    Route::middleware('role:adm')->group(function () {
        Route::patch('/users/{user}/toggle-active', [UserController::class, 'toggleActive']);
        Route::apiResource('users', UserController::class);
    });
});
