<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    public function viewAny(User $auth): bool
    {
        return true;
    }

    public function view(User $auth, Product $product): bool
    {
        return true;
    }

    public function create(User $auth): bool
    {
        return $auth->role === UserRole::ADM;
    }

    public function update(User $auth, Product $product): bool
    {
        return $auth->role === UserRole::ADM;
    }

    public function delete(User $auth, Product $product): bool
    {
        return $auth->role === UserRole::ADM;
    }
}
