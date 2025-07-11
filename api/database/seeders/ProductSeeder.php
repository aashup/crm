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
            $product->productUnit()->create([
                'product_id' => $product->id,
                'unit_id' => rand(1, 23),
                'sale_price' => $sale = rand(50,500),
                'purchase_price' => $sale - rand(1, 50),
                'notes' => fake()->text(50),
                'status' => 1
            ]);
        });
    }
}
