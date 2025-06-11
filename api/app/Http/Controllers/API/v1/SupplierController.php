<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSupplierRequest;
use App\Http\Requests\UpdateSupplierRequest;
use App\Models\Supplier;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Supplier::class);

        $pageSize = null;
        if (intval($request->pageSize)) {
            $pageSize = intval($request->get('pageSize', 1000));
        }
        $model = new Supplier();
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
    public function store(StoreSupplierRequest $request)
    {
        $this->authorize('create', Supplier::class);

        $model = new Supplier();
        $model->fill($request->all());
        $model->save();

        return $this->success("Vendor created successfully!", $model);
    }

    /**
     * Display the specified resource.
     */
    public function show(Supplier $supplier)
    {
        $this->authorize('view', Supplier::class);

        $supplier->load($supplier->getWith(request()->with));
        return $this->success("", $supplier);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Supplier $supplier)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSupplierRequest $request, Supplier $supplier)
    {
        $this->authorize('update', $supplier);

        $model = $supplier;
        $model->fill($request->all());
        $model->save();

        return $this->success("Vendor updated successfully!", $model);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Supplier $supplier)
    {
        $this->authorize('delete', $supplier);

        try {
            return $this->success("Permission deleted successfully!", $supplier->delete());
        } catch (QueryException $e) {
            if ($e->getCode() == '23000') {
                return $this->error("Supplier is linked to other records and cannot be deleted.", 400);
            }
            return $this->error("Supplier cannot be deleted! : " . $e->getMessage(), 500);
        }
    }
}
