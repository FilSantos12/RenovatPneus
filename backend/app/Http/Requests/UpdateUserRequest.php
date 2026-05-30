<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Validation\Rules\Password;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('user')?->id ?? $this->route('user');

        return [
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'min:3', 'max:30', 'alpha_dash', "unique:users,username,{$userId}"],
            'email' => ['nullable', 'email', "unique:users,email,{$userId}"],
            'password' => ['nullable', Password::min(6)],
            'role' => ['required', new Enum(UserRole::class)],
            'active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'O nome é obrigatório.',
            'username.required' => 'O nome de usuário é obrigatório.',
            'username.min' => 'O nome de usuário deve ter pelo menos 3 caracteres.',
            'username.max' => 'O nome de usuário deve ter no máximo 30 caracteres.',
            'username.unique' => 'Este nome de usuário já está em uso.',
            'username.alpha_dash' => 'O nome de usuário só pode ter letras, números, hífen e underscore.',
            'role.required' => 'O papel é obrigatório.',
        ];
    }
}
