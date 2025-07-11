<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Product::factory(500)->create()->each(function ($product) {
            $uid = rand(1, 23);
            $product->productUnit()->create([
                'unit_id' => $uid,
                // 'product_id' => $product->id,
                'sale_price' => $sale = rand(50, 500),
                'purchase_price' => $sale - rand(1, 50),
                'status' => 1
            ]);
            $product->productUnit()->create([
                'unit_id' => ($uid % 23) + 1,
                // 'product_id' => $product->id,
                'sale_price' => $sale = rand(50, 500),
                'purchase_price' => $sale - rand(1, 50),
                'status' => 1
            ]);
            $product->productUnit()->create([
                'product_id' => $product->id,
                'unit_id' => rand(1, 23),
                'sale_price' => $sale = rand(50,500),
                'unit_id' => ($uid % 22) + 2,
                // 'product_id' => $product->id,
                'sale_price' => $sale = rand(50, 500),
                'purchase_price' => $sale - rand(1, 50),
                'notes' => fake()->text(50),
                'status' => 1
            ]);
        });
    }
}
