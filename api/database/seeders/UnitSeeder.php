<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Unit;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UnitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $units = [
            ['id' => 1, 'name' => 'Piece'],
            ['id' => 2, 'name' => 'Kilogram'],
            ['id' => 3, 'name' => 'Gram'],
            ['id' => 4, 'name' => 'Litre'],
            ['id' => 5, 'name' => 'Millilitre'],
            ['id' => 6, 'name' => 'Meter'],
            ['id' => 7, 'name' => 'Centimeter'],
            ['id' => 8, 'name' => 'Inch'],
            ['id' => 9, 'name' => 'Foot'],
            ['id' => 10, 'name' => 'Yard'],
            ['id' => 11, 'name' => 'Dozen'],
            ['id' => 12, 'name' => 'Box'],
            ['id' => 13, 'name' => 'Pack'],
            ['id' => 14, 'name' => 'Bottle'],
            ['id' => 15, 'name' => 'Can'],
            ['id' => 16, 'name' => 'Roll'],
            ['id' => 17, 'name' => 'Bag'],
            ['id' => 18, 'name' => 'Set'],
            ['id' => 19, 'name' => 'Bundle'],
            ['id' => 20, 'name' => 'Carton'],
            ['id' => 21, 'name' => 'Sq Foot'],
            ['id' => 22, 'name' => 'Trolly'],
            ['id' => 23, 'name' => 'Trolly 100'],
        ];
        $c = DB::table('units')->count();
        if ($c < 1)
            Unit::insert($units);
    }
}
