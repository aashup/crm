<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreVendorRequest;
use App\Http\Requests\UpdateVendorRequest;
use App\Models\Vendor;
use Illuminate\Http\Request;

class VendorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Vendor::class);

        $pageSize = null;
        if (intval($request->pageSize)) {
            $pageSize = intval($request->get('pageSize', 1000));
        }
        $model = new Vendor();
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
    public function store(StoreVendorRequest $request)
    {
        $this->authorize('create', Vendor::class);

        $model = new Vendor();
        $model->fill($request->all());
        $model->save();

        return $this->success("Vendor created successfully!", $model);
    }

    /**
     * Display the specified resource.
     */
    public function show(Vendor $vendor)
    {
        $this->authorize('view', Vendor::class);

        $vendor->load($vendor->getWith(request()->with));
        return $this->success("", $vendor);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Vendor $vendor)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateVendorRequest $request, Vendor $vendor)
    {
        $this->authorize('update', $vendor);

        $model = $vendor;
        $model->fill($request->all());
        $model->save();

        return $this->success("Vendor updated successfully!", $model);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Vendor $vendor)
    {
        $this->authorize('delete', $vendor);

        try {
            return $this->success("Permission deleted successfully!", $vendor->delete());
        } catch (\Exception $e) {
            return $this->error("Vendor cannot be deleted! : " . $e->getMessage(), 500);
        }
    }
}
