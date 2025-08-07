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
        Schema::create('voucher', function (Blueprint $table) {
            $table->id()->unsigned();
            
            $table->bigInteger('party_id', false, true);
            $table->foreign('party_id')->references('id')->on('parties');

            $table->tinyInteger('voucher_type', false, true)->nullable();
            $table->string('notes')->nullable();
            $table->enum('txn_type', ['Credit', 'Debit'])->default('Credit');
            $table->tinyText('reference_model')->nullable();
            $table->bigInteger('reference_id', false, true)->nullable();
            $table->decimal('amount', 15, 2)->default(0);
            $table->dateTime('opening_ts')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('voucher');
    }
};
