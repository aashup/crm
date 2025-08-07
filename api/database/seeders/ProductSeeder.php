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
                'sale_price' => $sale = rand(50, 500),
                'purchase_price' => $sale - rand(1, 50),
                'sale_price_tax_type' => rand(1, 2), // 1 for with tax, 2 for without tax
                'sale_price_discount_amount' => rand(0, 20),
                'sale_price_discount_type' => rand(1, 2), // 1 for flat, 2 for percent
                'purchase_price_tax_type' => rand(1, 2), // 1 for with tax, 2 for without tax
                'tax_rate_id' => rand(1, 5), // Assuming there are 5 tax rates
                'notes' => fake()->text(50),
                'status' => 1
            ]);
        });
    }
}
