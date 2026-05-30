<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

// Senhas de teste: admin/admin123, joao/joao123, ana/ana123
// Nunca commitar senhas reais — usar variáveis de ambiente em produção.
class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name'     => 'Administrador',
            'email'    => 'admin@renovatpneus.com.br',
            'password' => Hash::make('admin123'),
            'role'     => UserRole::ADM,
            'active'   => true,
        ]);

        User::create([
            'name'     => 'João Silva',
            'email'    => 'joao@renovatpneus.com.br',
            'password' => Hash::make('joao123'),
            'role'     => UserRole::OPERADOR,
            'active'   => true,
        ]);

        User::create([
            'name'     => 'Ana Paula',
            'email'    => 'ana@renovatpneus.com.br',
            'password' => Hash::make('ana123'),
            'role'     => UserRole::OPERADOR,
            'active'   => true,
        ]);
    }
}
