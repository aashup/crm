<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('customers')) {
            Schema::rename('customers', 'parties');
            Schema::table('parties', function (Blueprint $blueprint) {
                $blueprint->tinyInteger('type', false, true)->default(1)->comment("1-Customer, 2-Bussiness, 3-Composition");
                $blueprint->integer('credit_limit', false, true)->default(0);
                $blueprint->integer('opening_balance', false, false)->default(0);
                $blueprint->bigInteger('balance', false, false)->default(0);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('parties')) {
            Schema::rename('parties', 'customers');
        }
        if(Schema::hasColumn('parties', 'type')) {
            Schema::dropColumns('parties', 'type');
        }
    }
};
