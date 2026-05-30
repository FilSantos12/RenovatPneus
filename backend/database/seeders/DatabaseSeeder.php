<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

// Ordem respeita as chaves estrangeiras: Users → Products/Services → (futuro: Sales)
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            ProductSeeder::class,
            ServiceSeeder::class,
        ]);
    }
}
