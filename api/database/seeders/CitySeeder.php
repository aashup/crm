<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $st = DB::table('states')->where('name', 'Uttar Pradesh')->first();
        $id = $st->id;
        $cid = $st->country_id;
        $cities = [
            ['name' => 'Agra', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Aligarh', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Prayagraj', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Amroha', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Azamgarh', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Bareilly', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Bahraich', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Ballia', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Banda', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Barabanki', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Basti', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Bijnor', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Budaun', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Bulandshahr', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Etawah', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Faizabad', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Farrukhabad', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Fatehpur', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Firozabad', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Ghaziabad', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Ghazipur', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Gonda', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Gorakhpur', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Hapur', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Hardoi', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Hathras', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Jaunpur', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Jhansi', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Kanpur', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Kasganj', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Lakhimpur Kheri', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Lalitpur', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Lucknow', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Mathura', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Mau', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Meerut', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Mirzapur', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Moradabad', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Muzaffarnagar', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Noida', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Raebareli', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Rampur', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Saharanpur', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Sambhal', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Shahjahanpur', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Sitapur', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Sultanpur', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
            ['name' => 'Varanasi', 'state_id' => $id, 'country_id' => $cid, 'status' => 1],
        ];

        DB::table('cities')->insert($cities);
    }
}
