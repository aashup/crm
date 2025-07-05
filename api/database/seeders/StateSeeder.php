<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $india = DB::table('countries')->where('name', 'India')->first();
        $id = $india->id;
        $states = [
            ['name' => 'Andhra Pradesh', 'country_id' => $id, 'status' => 1],
            ['name' => 'Arunachal Pradesh', 'country_id' => $id, 'status' => 1],
            ['name' => 'Assam', 'country_id' => $id, 'status' => 1],
            ['name' => 'Bihar', 'country_id' => $id, 'status' => 1],
            ['name' => 'Chhattisgarh', 'country_id' => $id, 'status' => 1],
            ['name' => 'Goa', 'country_id' => $id, 'status' => 1],
            ['name' => 'Gujarat', 'country_id' => $id, 'status' => 1],
            ['name' => 'Haryana', 'country_id' => $id, 'status' => 1],
            ['name' => 'Himachal Pradesh', 'country_id' => $id, 'status' => 1],
            ['name' => 'Jharkhand', 'country_id' => $id, 'status' => 1],
            ['name' => 'Karnataka', 'country_id' => $id, 'status' => 1],
            ['name' => 'Kerala', 'country_id' => $id, 'status' => 1],
            ['name' => 'Madhya Pradesh', 'country_id' => $id, 'status' => 1],
            ['name' => 'Maharashtra', 'country_id' => $id, 'status' => 1],
            ['name' => 'Manipur', 'country_id' => $id, 'status' => 1],
            ['name' => 'Meghalaya', 'country_id' => $id, 'status' => 1],
            ['name' => 'Mizoram', 'country_id' => $id, 'status' => 1],
            ['name' => 'Nagaland', 'country_id' => $id, 'status' => 1],
            ['name' => 'Odisha', 'country_id' => $id, 'status' => 1],
            ['name' => 'Punjab', 'country_id' => $id, 'status' => 1],
            ['name' => 'Rajasthan', 'country_id' => $id, 'status' => 1],
            ['name' => 'Sikkim', 'country_id' => $id, 'status' => 1],
            ['name' => 'Tamil Nadu', 'country_id' => $id, 'status' => 1],
            ['name' => 'Telangana', 'country_id' => $id, 'status' => 1],
            ['name' => 'Tripura', 'country_id' => $id, 'status' => 1],
            ['name' => 'Uttar Pradesh', 'country_id' => $id, 'status' => 1],
            ['name' => 'Uttarakhand', 'country_id' => $id, 'status' => 1],
            ['name' => 'West Bengal', 'country_id' => $id, 'status' => 1],
        ];

        DB::table('states')->insert($states);
    }
}
