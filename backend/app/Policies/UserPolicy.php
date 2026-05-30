<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\User;

class UserPolicy
{
    public function viewAny(User $auth): bool
    {
        return true;
    }

    public function view(User $auth, User $user): bool
    {
        return $auth->role === UserRole::ADM || $auth->id === $user->id;
    }

    public function create(User $auth): bool
    {
        return $auth->role === UserRole::ADM;
    }

    public function update(User $auth, User $user): bool
    {
        return $auth->role === UserRole::ADM || $auth->id === $user->id;
    }

    public function delete(User $auth, User $user): bool
    {
        return $auth->role === UserRole::ADM && $auth->id !== $user->id;
    }
}
