<?php

use App\Models\Permission;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tax_rates', function (Blueprint $table) {
            $table->id()->unsigned();
            $table->decimal('rate', 5, 2)->comment('Tax rate percentage');
            $table->tinyInteger('type', false, true)->default(1)->comment('1. gst, 2. igst, 3. cgst, 4. sgst, 5. vat, 6. service tax, 7. other');
            $table->boolean('is_active')->default(true)->comment('Indicates if the tax rate is active');
            $table->timestamps();

            $table->softDeletes()->comment('Soft delete column to mark records as deleted without removing them from the database');

            $table->unique(['rate', 'type'], 'unique_tax_rate'); // Ensure unique combination of rate and type
        });

        DB::table('tax_rates')->insert([
            ['rate' => 0.00, 'type' => 1, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['rate' => 0.00, 'type' => 2, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);

        $permisions = [
            "view any",
            "show",
            "create",
            "update",
            "delete",
        ];

        $parentId = DB::table('menus')->where('name', 'Settings')->value('id');
        $menuId = DB::table('menus')->insertGetId([
            'name' => 'Tax Rates',
            'page' => '/app/tax-rates',
            'icon' => 'element-11',
            'root' => 1,
            'status' => 1,
            'parent_id' => $parentId,
            'order_by' => 12,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        foreach ($permisions as $permission) {
            $permissions = Permission::create([
                'name' => Str::slug("Tax Rates {$permission}", '.'),
                'guard_name' => 'api',
                'description' => $permission,
                'menu_id' => $menuId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $permissions->roles()->attach(1);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tax_rates');
    }
};
