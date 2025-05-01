<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePermissionRequest;
use App\Http\Requests\UpdatePermissionRequest;
use App\Models\Menu;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PermissionController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $pageSize = null;
        if (intval($request->pageSize)) {
            $pageSize = intval($request->get('pageSize', 1000));
        }
        $model = new Permission();
        $model = $model->handleWith($request->with)->selectCols($request->get('cols'))
            ->applyFilter($request->get('filter'))->sortOrder($request->orderField, $request->orderBy)->getBuilder();

        return $model->paginate($pageSize, ['*'], 'page', $request->page);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @return \Illuminate\Http\Response
     *
     * @throws
     */
    public function store(StorePermissionRequest $request)
    {
        $model = new Permission();
        $menu = Menu::find($request->menu_id);
        $request->merge([
            'name' => Str::slug("{$menu->name} {$request->description}", '.'),
        ]);
        $model->fill($request->all());
        $model->save();

        return $this->success("Permission created successfully!", $model);
    }

    /**
     * Display the specified resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function show(Permission $permission, Request $request)
    {
        $permission->load($permission->getWith($request->with));

        return $this->success("", $permission);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Models\Permission  $model
     * @return \Illuminate\Http\Response
     *
     * @throws
     */
    public function update(UpdatePermissionRequest $request, Permission $permission)
    {
        $model = $permission;
        if ($permission->menu_id != $request->menu_id || $permission->description != $request->description) {
            $menu = Menu::find($request->menu_id);
            $request->merge([
                'name' => Str::slug("{$menu->name} {$request->description}", '.'),
            ]);
        }
        $model->fill($request->all());
        $model->save();

        return $this->success("Permission updated successfully!", $model);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @return \Illuminate\Http\Response
     *
     * @throws
     */
    public function destroy(Permission $permission)
    {
        return $this->success("Permission deleted successfully!", $permission->delete());
    }
}
