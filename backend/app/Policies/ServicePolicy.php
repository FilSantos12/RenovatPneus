<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Service;
use App\Models\User;

class ServicePolicy
{
    public function viewAny(User $auth): bool
    {
        return true;
    }

    public function view(User $auth, Service $service): bool
    {
        return true;
    }

    public function create(User $auth): bool
    {
        return $auth->role === UserRole::ADM;
    }

    public function update(User $auth, Service $service): bool
    {
        return $auth->role === UserRole::ADM;
    }

    public function delete(User $auth, Service $service): bool
    {
        return $auth->role === UserRole::ADM;
    }
}
