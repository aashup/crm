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
        Schema::table('sales', function (Blueprint $table) {
            $table->integer('payment_method')->default(1)->after('status')->comment("1: Cash, 2: Online, 3: Split Payment"); // Adding payment_method column
            $table->decimal('cash_amount')->nullable('pending')->after('payment_method');
            $table->decimal('online_amount')->nullable('pending')->after('payment_method');
            $table->decimal('return_amount')->default(0)->after('online_amount')->comment('Amount returned to customer, default is 0');
            $table->text('transaction_id')->nullable()->after('online_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropColumn('payment_method');
            $table->dropColumn('cash_amount');
            $table->dropColumn('online_amount');
            $table->dropColumn('return_amount');
            $table->dropColumn('transaction_id');
        });
    }
};
