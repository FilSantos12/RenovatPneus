<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function login(array $credentials): User
    {
        $user = User::where('username', $credentials['username'])
            ->where('active', true)
            ->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw new AuthenticationException('Usuário ou senha incorretos.');
        }

        return $user;
    }

    public function logout(User $user): void
    {
        // Revoga tokens Sanctum ativos (se houver)
        $user->tokens()->delete();
    }
}
