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
        Schema::table('product_has_unit', function (Blueprint $table) {
            $table->tinyInteger('sale_price_tax_type', false, true)->nullable()->after('sale_price')->comment("1. with tax, 2. without tax");
            $table->decimal('sale_price_discount_amount', 10, 2)->nullable()->after('sale_price_tax_type');
            $table->tinyInteger('sale_price_discount_type', false, true)->nullable()->after('sale_price_discount_amount')->comment("1. flat, 2. percent");

            $table->tinyInteger('purchase_price_tax_type', false, true)->nullable()->after('purchase_price')->comment("1. with tax, 2. without tax");

            $table->decimal('tax_rate', 5, 2)->nullable()->after('purchase_price_tax_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_has_unit', function (Blueprint $table) {
            $table->dropColumn([
                'sale_price_tax_type',
                'sale_price_discount_amount',
                'sale_price_discount_type',
                'purchase_price_tax_type',
                'tax_rate',
            ]);
        });
    }
};
