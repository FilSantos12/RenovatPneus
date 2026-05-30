<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Dados replicados do mockData.ts; price_cost estimado em ~70% do price_sale
        $products = [
            [
                'name'        => 'Pneu Aro 13',
                'barcode'     => '7891234567890',
                'description' => 'Pneu Aro 13 - 175/70 R13',
                'brand'       => 'Pirelli',
                'size'        => '175/70 R13',
                'price_cost'  => 196.00,
                'price_sale'  => 280.00,
                'quantity'    => 45,
                'min_stock'   => 10,
                'active'      => true,
            ],
            [
                'name'        => 'Pneu Aro 14',
                'barcode'     => '7891234567891',
                'description' => 'Pneu Aro 14 - 185/65 R14',
                'brand'       => 'Goodyear',
                'size'        => '185/65 R14',
                'price_cost'  => 224.00,
                'price_sale'  => 320.00,
                'quantity'    => 32,
                'min_stock'   => 15,
                'active'      => true,
            ],
            [
                'name'        => 'Pneu Aro 15',
                'barcode'     => '7891234567892',
                'description' => 'Pneu Aro 15 - 195/55 R15',
                'brand'       => 'Michelin',
                'size'        => '195/55 R15',
                'price_cost'  => 315.00,
                'price_sale'  => 450.00,
                'quantity'    => 8,
                'min_stock'   => 10,
                'active'      => true,
            ],
            [
                'name'        => 'Pneu Aro 16',
                'barcode'     => '7891234567893',
                'description' => 'Pneu Aro 16 - 205/55 R16',
                'brand'       => 'Continental',
                'size'        => '205/55 R16',
                'price_cost'  => 364.00,
                'price_sale'  => 520.00,
                'quantity'    => 0,
                'min_stock'   => 8,
                'active'      => true,
            ],
            [
                'name'        => 'Pneu Aro 17',
                'barcode'     => '7891234567894',
                'description' => 'Pneu Aro 17 - 215/50 R17',
                'brand'       => 'Pirelli',
                'size'        => '215/50 R17',
                'price_cost'  => 476.00,
                'price_sale'  => 680.00,
                'quantity'    => 25,
                'min_stock'   => 10,
                'active'      => true,
            ],
            [
                'name'        => 'Pneu Aro 13',
                'barcode'     => '7891234567895',
                'description' => 'Pneu Aro 13 - 165/70 R13',
                'brand'       => 'Goodyear',
                'size'        => '165/70 R13',
                'price_cost'  => 182.00,
                'price_sale'  => 260.00,
                'quantity'    => 18,
                'min_stock'   => 12,
                'active'      => true,
            ],
            [
                'name'        => 'Pneu Aro 14',
                'barcode'     => '7891234567896',
                'description' => 'Pneu Aro 14 - 175/65 R14',
                'brand'       => 'Bridgestone',
                'size'        => '175/65 R14',
                'price_cost'  => 238.00,
                'price_sale'  => 340.00,
                'quantity'    => 28,
                'min_stock'   => 15,
                'active'      => true,
            ],
            [
                'name'        => 'Pneu Aro 15',
                'barcode'     => '7891234567897',
                'description' => 'Pneu Aro 15 - 185/60 R15',
                'brand'       => 'Dunlop',
                'size'        => '185/60 R15',
                'price_cost'  => 266.00,
                'price_sale'  => 380.00,
                'quantity'    => 5,
                'min_stock'   => 10,
                'active'      => true,
            ],
            [
                'name'        => 'Pneu Aro 18',
                'barcode'     => '7891234567898',
                'description' => 'Pneu Aro 18 - 225/45 R18',
                'brand'       => 'Michelin',
                'size'        => '225/45 R18',
                'price_cost'  => 560.00,
                'price_sale'  => 800.00,
                'quantity'    => 12,
                'min_stock'   => 5,
                'active'      => true,
            ],
            [
                'name'        => 'Pneu Aro 20',
                'barcode'     => '7891234567899',
                'description' => 'Pneu Aro 20 - 275/40 R20',
                'brand'       => 'Continental',
                'size'        => '275/40 R20',
                'price_cost'  => 840.00,
                'price_sale'  => 1200.00,
                'quantity'    => 6,
                'min_stock'   => 3,
                'active'      => true,
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
