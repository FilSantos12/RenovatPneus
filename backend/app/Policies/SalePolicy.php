<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Sale;
use App\Models\User;

class SalePolicy
{
    public function viewAny(User $auth): bool
    {
        return true;
    }

    public function view(User $auth, Sale $sale): bool
    {
        return true;
    }

    public function create(User $auth): bool
    {
        return true;
    }

    public function update(User $auth, Sale $sale): bool
    {
        return $auth->role === UserRole::ADM || $auth->id === $sale->user_id;
    }

    public function delete(User $auth, Sale $sale): bool
    {
        return $auth->role === UserRole::ADM;
    }
}
