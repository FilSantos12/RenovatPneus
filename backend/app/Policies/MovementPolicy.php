<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Movement;
use App\Models\User;

class MovementPolicy
{
    public function viewAny(User $auth): bool
    {
        return true;
    }

    public function view(User $auth, Movement $movement): bool
    {
        return true;
    }

    public function create(User $auth): bool
    {
        return true;
    }

    // Movimentação é imutável — ninguém pode editar ou deletar
    public function update(User $auth, Movement $movement): bool
    {
        return false;
    }

    public function delete(User $auth, Movement $movement): bool
    {
        return $auth->role === UserRole::ADM;
    }
}
