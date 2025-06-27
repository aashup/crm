<?php

use App\Models\Permission;
use App\Models\Role;
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
        $menuId = DB::table('menus')->insertGetId([
            'name' => 'Unit Conversions',
            'page' => '/app/unit-conversion',
            'icon' => 'element-11',
            'root' => 0,
            'status' => 1,
            'parent_id' => DB::table('menus')->where('name', 'Settings')->value('id'),
            'order_by' => 10,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $permisions = [
            "view any",
            "show",
            "create",
            "update",
            "delete",
        ];

        $tempPermissionsId = [];
        foreach ($permisions as $permission) {
            $tempPermissionsId[] = DB::table('permissions')->insertGetId([
                'name' => Str::slug("Unit Conversions {$permission}", '.'),
                'guard_name' => 'api',
                'description' => $permission,
                'menu_id' => $menuId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $role = Role::where('name', 'Super Admin')->first();
        if ($role) {
            $role->syncPermissions(Permission::whereIn('id', $tempPermissionsId)->get());
        }

        Schema::create('unit_conversions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('product_id')
                ->constrained('products')
                ->onDelete('cascade')
                ->comment('Product this conversion applies to');

            $table->foreignId('from_unit_id')
                ->constrained('units')
                ->onDelete('restrict')
                ->comment('Unit to convert from');

            $table->foreignId('to_unit_id')
                ->constrained('units')
                ->onDelete('restrict')
                ->comment('Unit to convert to');

            $table->decimal('conversion_factor', 12, 6)
                ->comment('Factor to convert from one unit to another');

            $table->string('description')->nullable();
            $table->boolean('status')->default(1)->comment('1 for active, 0 for inactive');
            $table->timestamps();

            // Ensure no duplicate conversion pair (A→B or B→A)
            $table->unique(['product_id', 'from_unit_id', 'to_unit_id'], 'unique_unit_conversion');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('unit_conversions');
        $menuId = DB::table('menus')->where('name', 'Unit Conversions')->value('id');
        if ($menuId) {
            DB::table('permissions')->where('menu_id', $menuId)->delete();
            DB::table('menus')->where('id', $menuId)->delete();
        }
        $role = Role::where('name', 'Super Admin')->first();
        if ($role) {
            $role->permissions()->detach(DB::table('permissions')->whereIn('name', [
                Str::slug('Unit Conversions view any', '.'),
                Str::slug('Unit Conversions show', '.'),
                Str::slug('Unit Conversions create', '.'),
                Str::slug('Unit Conversions update', '.'),
                Str::slug('Unit Conversions delete', '.'),
            ])->pluck('id'));
        }
    }
};
