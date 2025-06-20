<?php

use App\Models\Role;
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
        $role = new Role();
        $role->fill([
            'name' => 'Customer',
            'guard_name' => 'api',
            'status' => 1,
        ]);
        $role->save();

        $menus = [
            "Dashboard",
            "Customers",
        ];

        $permissions = [
            "view any",
            "show",
            "create",
            "update",
            "delete",
        ];

        $permissionIds = [];

        foreach ($menus as $menuName) {
            $menuId = DB::table('menus')->where('name', $menuName)->value('id');

            if ($menuId) {
                foreach ($permissions as $permission) {
                    $permissionId = DB::table('permissions')
                        ->where('menu_id', $menuId)
                        ->where('description', $permission)
                        ->where('guard_name', 'api')
                        ->value('id');

                    if ($permissionId) {
                        $permissionIds[] = $permissionId;
                    }
                }
            }
        }

        if (!empty($permissionIds)) {
            $role->permissions()->sync($permissionIds);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $role = Role::where('name', 'Customer')->first();
        if ($role) {
            $role->permissions()->detach();
            $role->delete();
        }
    }
};
