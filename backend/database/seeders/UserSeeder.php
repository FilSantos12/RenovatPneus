<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

// Senhas de teste: password (todas)
// Nunca commitar senhas reais — usar variáveis de ambiente em produção.
class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name'     => 'Administrador',
            'username' => 'admin',
            'email'    => 'admin@renovatpneus.com.br',
            'password' => Hash::make('password'),
            'role'     => UserRole::ADM,
            'active'   => true,
        ]);

        User::create([
            'name'     => 'Operador 1',
            'username' => 'operador1',
            'email'    => 'operador1@renovatpneus.com.br',
            'password' => Hash::make('password'),
            'role'     => UserRole::OPERADOR,
            'active'   => true,
        ]);

        User::create([
            'name'     => 'Operador 2',
            'username' => 'operador2',
            'email'    => 'operador2@renovatpneus.com.br',
            'password' => Hash::make('password'),
            'role'     => UserRole::OPERADOR,
            'active'   => true,
        ]);
    }
}
