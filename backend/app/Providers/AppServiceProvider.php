<?php

namespace App\Providers;

use App\Models\Movement;
use App\Models\Product;
use App\Models\Sale;
use App\Models\Service;
use App\Models\User;
use App\Policies\MovementPolicy;
use App\Policies\ProductPolicy;
use App\Policies\SalePolicy;
use App\Policies\ServicePolicy;
use App\Policies\UserPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(Product::class, ProductPolicy::class);
        Gate::policy(Movement::class, MovementPolicy::class);
        Gate::policy(Service::class, ServicePolicy::class);
        Gate::policy(Sale::class, SalePolicy::class);
    }
}
