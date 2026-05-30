<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'     => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'min:3', 'max:30', 'unique:users,username', 'alpha_dash'],
            'email'    => ['nullable', 'email', 'unique:users,email'],
            'password' => ['required', Password::min(6)],
            'role'     => ['required', new Enum(UserRole::class)],
            'active'   => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'        => 'O nome é obrigatório.',
            'username.required'    => 'O nome de usuário é obrigatório.',
            'username.min'         => 'O nome de usuário deve ter pelo menos 3 caracteres.',
            'username.max'         => 'O nome de usuário deve ter no máximo 30 caracteres.',
            'username.unique'      => 'Este nome de usuário já está em uso.',
            'username.alpha_dash'  => 'O nome de usuário só pode ter letras, números, hífen e underscore.',
            'password.required'    => 'A senha é obrigatória.',
            'role.required'        => 'O papel é obrigatório.',
        ];
    }
}
