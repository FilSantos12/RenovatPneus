<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\FinanceController;
use App\Http\Controllers\Api\MovementController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReportController;
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

    // Rotas fixas de produtos ANTES do apiResource (evita conflito com route model binding)
    Route::get('/products/next-barcode', [ProductController::class, 'nextBarcode']);
    Route::get('/products/barcode/{barcode}', [ProductController::class, 'showByBarcode']);
    Route::apiResource('products', ProductController::class);

    Route::apiResource('movements', MovementController::class)->only(['index', 'show', 'store', 'destroy']);

    Route::apiResource('services', ServiceController::class);

    Route::patch('/sales/{sale}/status', [SaleController::class, 'updateStatus']);
    Route::apiResource('sales', SaleController::class);

    // ADM — finanças, relatórios e usuários
    Route::middleware('role:adm')->group(function () {
        Route::get('/finance/summary', [FinanceController::class, 'summary']);
        Route::get('/reports/entries', [ReportController::class, 'entries']);
        Route::get('/reports/sales',   [ReportController::class, 'sales']);
        Route::patch('/users/{user}/toggle-active', [UserController::class, 'toggleActive']);
        Route::apiResource('users', UserController::class);
    });
});
