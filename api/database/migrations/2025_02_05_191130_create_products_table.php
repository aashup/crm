<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        try {
            Schema::create('countries', callback: function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->boolean('status')->default(true);
                $table->timestamps();
                $table->softDeletes();
            });

            Schema::create('states', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->boolean('status')->default(true);
                $table->unsignedBigInteger('country_id');
                $table->foreign('country_id')->references('id')->on('countries');
                $table->timestamps();
                $table->softDeletes();
            });

            Schema::create('cities', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->boolean('status')->default(true);
                $table->unsignedBigInteger('state_id');
                $table->foreign('state_id')->references('id')->on('states');
                $table->unsignedBigInteger('country_id');
                $table->foreign('country_id')->references('id')->on('countries');
                $table->timestamps();
                $table->softDeletes();
            });

            Schema::create('contacts', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('mob1', 20)->nullable();
                $table->string('mob2', 20)->nullable();
                $table->boolean('status')->default(true);
                $table->unsignedBigInteger('created_by');
                $table->timestamps();
                $table->softDeletes();
            });

            Schema::create('addresses', function (Blueprint $table) {
                $table->id();
                $table->string('address');
                $table->string('pin', 10)->nullable();
                $table->string('mob1', 20)->nullable();
                $table->string('mob2', 20)->nullable();
                $table->tinyInteger('type', false, true)
                ->default(1)->comment('1-billing, 2-shipping');
                $table->unsignedBigInteger('city_id');
                $table->boolean('status')->default(true);
                $table->unsignedBigInteger('created_by');
                $table->foreign('created_by')->references('id')->on('users');
                $table->foreign('city_id')->references('id')->on('cities');
                $table->timestamps();
                $table->softDeletes();
            });

            Schema::create('units', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->boolean('status')->default(true);
                $table->timestamps();
                $table->softDeletes();
            });
            
            Schema::create('products', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug')->nullable();
                $table->tinyInteger('type', false, true)->default(1);
                $table->boolean('status')->default(true);
                $table->unsignedBigInteger('created_by')->nullable();
                $table->timestamps();
                $table->foreign('created_by')->references('id')->on('users');
                $table->softDeletes();
            });

            Schema::create('product_details', function (Blueprint $table) {
                $table->id();
                $table->string(column: 'mrp');

                $table->boolean('status')->default(true);
                $table->unsignedBigInteger('product_id');
                $table->timestamps();
                $table->softDeletes();
                
                $table->foreign('product_id')->references('id')->on('products');
            });

            Schema::create('suppliers', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('contact_id')->nullable();
                $table->string('name')->nullable();
                $table->string('gst')->nullable();
                $table->unsignedBigInteger('billing_address_id')->nullable();
                $table->unsignedBigInteger('shipping_address_id')->nullable();
                $table->string(column: 'notes')->nullable();
                $table->tinyInteger( 'type', false, true)->default(1);
                $table->tinyInteger( 'level', false, true)->default(1);

                $table->boolean(column: 'status')->default(true);
                $table->timestamps();
                $table->softDeletes();
                
                $table->foreign('contact_id')->references('id')->on('contacts');
            });

            Schema::create('suppliers_has_product', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('product_id');
                $table->unsignedBigInteger('supplier_id');
                $table->unsignedBigInteger('unit_id');
                $table->decimal('price')->nullable();
                $table->string(column: 'notes')->nullable();
                $table->tinyInteger( 'type', false, true)->default(1);
                $table->timestamps();
                $table->softDeletes();

                $table->boolean(column: 'status')->default(true);
                $table->foreign('product_id')->references('id')->on('products');
                $table->foreign('supplier_id')->references('id')->on('suppliers');
                $table->foreign('unit_id')->references('id')->on('units');
            });

            Schema::create('product_has_unit', function (Blueprint $table) {
                $table->unsignedBigInteger('product_id');
                $table->unsignedBigInteger('unit_id');
                $table->decimal('sale_price')->nullable();
                $table->decimal('purchase_price')->nullable();
                $table->string(column: 'notes')->nullable();
                $table->timestamps();
                $table->softDeletes();

                $table->boolean(column: 'status')->default(true);
                $table->foreign('product_id')->references('id')->on('products');
                $table->foreign('unit_id')->references('id')->on('units');
                $table->unique(['product_id', 'unit_id']);
            });

            Schema::create('inventry', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('product_id');
                $table->unsignedBigInteger('unit_id');
                $table->unsignedBigInteger('created_by');
                $table->decimal('qty')->nullable();
                $table->decimal('rem_qty')->nullable();
                $table->decimal('purchase_price')->nullable();
                $table->decimal('sale_price')->nullable();
                $table->string(column: 'notes')->nullable();
                $table->timestamps();
                $table->softDeletes();

                $table->boolean(column: 'status')->default(true);
                $table->foreign('product_id')->references('id')->on('products');
                $table->foreign('unit_id')->references('id')->on('units');
            });

            Schema::create('sales', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger(column: 'contact_id');
                $table->unsignedBigInteger('unit_id');
                $table->unsignedBigInteger('created_by');
                $table->decimal('amount')->nullable();
                $table->decimal('discount_amount')->default(0);
                $table->tinyInteger('discount_type', false, true)->default(1)
                ->comment("1. flat, 2. percent");
                $table->decimal(column: 'net_total')->nullable();
                $table->string(column: 'notes')->nullable();
                $table->timestamps();
                $table->softDeletes();

                $table->boolean(column: 'status')->default(true);
                $table->foreign('contact_id')->references('id')->on('contacts');
                $table->foreign('unit_id')->references('id')->on('units');
                $table->foreign('created_by')->references('id')->on('users');
            });

            Schema::create('sale_details', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger(column: 'sale_id');
                $table->unsignedBigInteger('product_id');
                $table->unsignedBigInteger('unit_id');
                $table->decimal('amount')->nullable();
                $table->decimal('discount_amount')->default(0);
                $table->tinyInteger('discount_type', false, true)->default(1)
                ->comment("1. flat, 2. percent");
                $table->decimal(column: 'net')->nullable();
                $table->timestamps();
                $table->softDeletes();

                $table->foreign('sale_id')->references('id')->on('sales');
                $table->foreign('unit_id')->references('id')->on('units');
                $table->foreign('product_id')->references('id')->on('products');
            });

            Schema::create('purchase', callback: function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger( 'contact_id');
                $table->unsignedBigInteger('unit_id');
                $table->unsignedBigInteger('supplier_id');
                $table->unsignedBigInteger('created_by');
                $table->decimal('amount')->nullable();
                $table->string(column: 'notes')->nullable();
                $table->timestamps();
                $table->softDeletes();

                $table->foreign('contact_id')->references('id')->on('contacts');
                $table->foreign('unit_id')->references('id')->on('units');
                $table->foreign('supplier_id')->references('id')->on('suppliers');
                $table->foreign('created_by')->references('id')->on('users');
            });

            Schema::create('purchase_details', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('purchase_id');
                $table->unsignedBigInteger('product_id');
                $table->unsignedBigInteger('unit_id');
                $table->decimal('amount')->nullable();
                $table->timestamps();
                $table->softDeletes();
                
                $table->foreign('purchase_id')->references('id')->on('purchase');
                $table->foreign('unit_id')->references('id')->on('units');
                $table->foreign('product_id')->references('id')->on('products');
            });
            
            Schema::create('payments', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('created_by');
                $table->unsignedBigInteger('payment_id');
                $table->text('payment_type');
                $table->unsignedBigInteger('contact_id')->nullable();
                $table->unsignedBigInteger('supplier_id')->nullable();
                $table->decimal('amount')->nullable();
                $table->tinyInteger('type', false, true)
                ->comment('1-sale, 2-purchase')
                ->default(1);
                $table->timestamps();
                $table->softDeletes();

                $table->index('payment_id');
                
                $table->foreign('contact_id')->references('id')->on('contacts');
                $table->foreign('supplier_id')->references('id')->on('suppliers');
                $table->foreign('created_by')->references('id')->on('users');
            });
        } catch (\Throwable $e) {
            $this->down();
            throw $e;
        }

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('countries');
        Schema::dropIfExists('states');
        Schema::dropIfExists('cities');
        Schema::dropIfExists('contacts');
        Schema::dropIfExists('addresses');
        Schema::dropIfExists('units');
        Schema::dropIfExists('products');
        Schema::dropIfExists('product_details');
        Schema::dropIfExists('suppliers');
        Schema::dropIfExists('suppliers_has_product');
        Schema::dropIfExists('product_has_unit');
        Schema::dropIfExists('inventry');
        Schema::dropIfExists('sale');
        Schema::dropIfExists('sales');
        Schema::dropIfExists('sale_details');
        Schema::dropIfExists('purchase');
        Schema::dropIfExists('purchase_details');
        Schema::dropIfExists('payments');
        Schema::enableForeignKeyConstraints();
    }
};
