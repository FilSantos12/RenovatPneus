<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        // Replicado do mockData.ts (campo duration removido — não consta no schema v1)
        $services = [
            [
                'name'        => 'Montagem de Pneu',
                'description' => 'Serviço de montagem e balanceamento de pneu',
                'price'       => 45.00,
                'active'      => true,
            ],
            [
                'name'        => 'Balanceamento',
                'description' => 'Balanceamento de rodas',
                'price'       => 35.00,
                'active'      => true,
            ],
            [
                'name'        => 'Alinhamento',
                'description' => 'Alinhamento de direção',
                'price'       => 80.00,
                'active'      => true,
            ],
            [
                'name'        => 'Rotação de Pneus',
                'description' => 'Rodízio de pneus para desgaste uniforme',
                'price'       => 60.00,
                'active'      => true,
            ],
            [
                'name'        => 'Reparo de Pneu',
                'description' => 'Reparo de furo em pneu',
                'price'       => 25.00,
                'active'      => true,
            ],
            [
                'name'        => 'Calibragem',
                'description' => 'Calibragem de pneus',
                'price'       => 0.00,
                'active'      => true,
            ],
        ];

        foreach ($services as $service) {
            Service::create($service);
        }
    }
}
