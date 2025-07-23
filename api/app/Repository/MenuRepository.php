<?php

namespace App\Repository;

use App\Models\Menu;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class MenuRepository
{
    public function getMenu(User $user)
    {
        $menuIds = $user->getPermissionsViaRoles()->pluck('menu_id')->unique()->toArray();
        $menu = $user->hasRole('Super Admin') ? Menu::where('status', 1) : Menu::whereIn('id', $menuIds)->where('status', 1);
        // $menu = Menu::where('status', 1);
        return $this->sortMenu($menu->orderBy('order_by', 'asc')->get());
    }

    protected function sortMenu(Collection $menu)
    {
        $parentMenus = $menu->where('parent_id', 0);
        foreach ($parentMenus as $parentMenu) {
            $children = $menu->where('parent_id', $parentMenu->id);
            if ($children->isNotEmpty()) {
                $parentMenu['children'] = $children->values()->toArray();
            }
        }
        return $parentMenus->values();
    }

}
