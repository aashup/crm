<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Role;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\Permission;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
       
        DB::transaction(function () {
             DB::table('menus')->where('order_by', 9)->update(['order_by' => 10]);
             DB::table('menus')->where('order_by', 8)->update(['order_by' => 9]);
             
            $menus = [
                [
                    'name' => "Expense",
                    'page' => "/app/expense",
                    'icon' => "element-11",
                    'root' => 1,
                    'status' => 1,
                    'order_by' => 8,
                    'children' => [],
                ],
            ];

            $permisions = [
                "view any",
                "show",
                "create",
                "update",
                "delete",
            ];



            $tempPermissionsId = [];
            foreach ($menus as $menu) {
                $parentId = DB::table('menus')->insertGetId([
                    'name' => $menu['name'],
                    'page' => $menu['page'],
                    'icon' => $menu['icon'],
                    'root' => $menu['root'],
                    'status' => $menu['status'],
                    'parent_id' => null,
                    'order_by' => $menu['order_by'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                foreach ($permisions as $permission) {
                    $permissions = Permission::create([
                        'name' => Str::slug("{$menu['name']} {$permission}", '.'),
                        'guard_name' => 'api',
                        'description' => $permission,
                        'menu_id' => $parentId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    $permissions->roles()->attach(1);
                }


            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
         DB::table('menus')->whereIn('name', [
            'Expense',
        ])->delete();
    }
};
