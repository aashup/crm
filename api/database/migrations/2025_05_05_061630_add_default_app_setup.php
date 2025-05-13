<?php

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        DB::transaction(function () {
            $user = new User();
            $user->fill([
                'name' => 'Super Admin',
                'email' => 'vijay@xtrox.com',
                'password' => bcrypt('Vijay@123'),
            ]);
            $user->save();

            $role = new Role();
            $role->fill([
                'name' => 'Super Admin',
                'guard_name' => 'api',
                'status' => 1,
            ]);
            $role->save();
            $user->assignRole($role);

            $menus = [
                [
                    'name' => "Dashboard",
                    'page' => "/dashboard",
                    'icon' => "element-11",
                    'root' => 1,
                    'status' => 1,
                    'order_by' => 1,
                    'children' => [],
                ],
                [
                    'name' => "Vendors",
                    'page' => "/app/vendor",
                    'icon' => "element-11",
                    'root' => 1,
                    'status' => 1,
                    'order_by' => 2,
                    'children' => [],
                ],
                [
                    'name' => "Customers",
                    'page' => "/app/customer",
                    'icon' => "element-11",
                    'root' => 1,
                    'status' => 1,
                    'order_by' => 3,
                    'children' => [],
                ],
                [
                    'name' => "Products",
                    'page' => "/app/product",
                    'icon' => "element-11",
                    'root' => 1,
                    'status' => 1,
                    'order_by' => 4,
                    'children' => [],
                ],
                [
                    'name' => "User Management",
                    'page' => null,
                    'icon' => "user",
                    'root' => 1,
                    'status' => 1,
                    'order_by' => 5,
                    'children' => [
                        ['name' => "Users", 'page' => "/app/usermanagement/users", 'order_by' => 1],
                        ['name' => "Role", 'page' => "/app/usermanagement/roles", 'order_by' => 4],
                        ['name' => "Permission", 'page' => "/app/usermanagement/permissions", 'order_by' => 5],
                    ],
                ],
                [
                    'name' => 'Settings',
                    'page' => null,
                    'icon' => 'setting',
                    'root' => 1,
                    'status' => 1,
                    'order_by' => 6,
                    'children' => [
                        ['name' => "City", 'page' => "/app/settings/city", 'order_by' => 1],
                        ['name' => "State", 'page' => "/app/settings/state", 'order_by' => 2],
                        ['name' => "Country", 'page' => "/app/settings/country", 'order_by' => 3],
                        ['name' => "Menu", 'page' => "/app/settings/menu", 'order_by' => 6],
                        ['name' => "Contact", 'page' => "/app/settings/contact", 'order_by' => 7],
                        ['name' => "Units", 'page' => "/app/settings/unit", 'order_by' => 8],
                        ['name' => "Address", 'page' => "/app/settings/address", 'order_by' => 9],
                    ],
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
                    $tempPermissionsId[] = DB::table('permissions')->insertGetId([
                        'name' => Str::slug("{$menu['name']} {$permission}", '.'),
                        'guard_name' => 'api',
                        'description' => $permission,
                        'menu_id' => $parentId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }


                foreach ($menu['children'] as $child) {
                    $childMenuId = DB::table('menus')->insertGetId([
                        'name' => $child['name'],
                        'page' => $child['page'],
                        'icon' => $child['icon'] ?? null,
                        'root' => $child['root'] ?? 0,
                        'status' => $child['status'] ?? 1,
                        'parent_id' => $parentId,
                        'order_by' => $child['order_by'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    foreach ($permisions as $permission) {
                        $tempPermissionsId[] = DB::table('permissions')->insertGetId([
                            'name' => Str::slug("{$child['name']} {$permission}", '.'),
                            'guard_name' => 'api',
                            'description' => $permission,
                            'menu_id' => $childMenuId,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }

                    if ($child['name'] == 'Role') {
                        $tempPermissionsId[] = DB::table('permissions')->insertGetId([
                            'name' => Str::slug("{$child['name']} sync permission", '.'),
                            'guard_name' => 'api',
                            'description' => 'sync permission',
                            'menu_id' => $childMenuId,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            }
            $role->syncPermissions($tempPermissionsId);
        });
    }

    public function down(): void
    {
        DB::table('menus')->whereIn('name', [
            'Dashboard',
            'Products',
            'User Management',
            'Settings',
            'Users',
            'City',
            'State',
            'Country',
            'Role',
            'Permission',
            'Menu',
            'Contact',
            'Units',
            'Vendors',
            'Customers',
            'Address'
        ])->delete();
    }
};
