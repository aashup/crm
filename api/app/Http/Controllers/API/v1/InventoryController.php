<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInventoryRequest;
use App\Http\Requests\UpdateInventoryRequest;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class InventoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Inventory::class);

        $pageSize = null;
        if (intval($request->pageSize)) {
            $pageSize = intval($request->get('pageSize', 1000));
        }
        $model = new Inventory();
        $model = $model->handleWith($request->with)->selectCols($request->get('cols'))
            ->applyFilter($request->get('filter'))->sortOrder($request->orderField, $request->orderBy)->getBuilder();

        return $model->paginate($pageSize, ['*'], 'page', $request->page);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreInventoryRequest $request)
    {
        $this->authorize('create', Inventory::class);
        $model = new Inventory();
        $request->merge(['created_by' => Auth::user()->id]);
        $model->fill($request->all());
        $model->save();

        return $this->success("Inventory created successfully!", $model);
    }

    /**
     * Display the specified resource.
     */
    public function show(Inventory $inventory)
    {
        $this->authorize('view', Inventory::class);

        $inventory->load($inventory->getWith(request()->with));
        return $this->success("", $inventory);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Inventory $inventory)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateInventoryRequest $request, Inventory $inventory)
    {
        $this->authorize('update', $inventory);

        $model = $inventory;
        $model->fill($request->all());
        $model->save();

        return $this->success("Inventory updated successfully!", $model);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Inventory $inventory)
    {
        $this->authorize('delete', $inventory);

        try {
            return $this->success("Inventory deleted successfully!", $inventory->delete());
        } catch (\Exception $e) {
            return $this->error("Inventory cannot be deleted! : " . $e->getMessage(), 500);
        }
    }
}
