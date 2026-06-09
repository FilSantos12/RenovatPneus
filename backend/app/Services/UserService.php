<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public function store(array $data): User
    {
        $data['password'] = Hash::make($data['password']);

        return User::create($data);
    }

    public function update(User $user, array $data): User
    {
        if (! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        if ($user->id === auth()->id()) {
            unset($data['role']);
        }

        $user->update($data);

        return $user->fresh();
    }

    public function toggleActive(User $user): User
    {
        $user->update(['active' => ! $user->active]);

        return $user->fresh();
    }
}
