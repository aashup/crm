<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUnitConversionRequest;
use App\Http\Requests\UpdateUnitConversionRequest;
use App\Models\UnitConversion;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;

class UnitConversionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', UnitConversion::class);

        $pageSize = null;
        if (intval($request->pageSize)) {
            $pageSize = intval($request->get('pageSize', 1000));
        }
        $model = new UnitConversion();
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
    public function store(StoreUnitConversionRequest $request)
    {
        $this->authorize('create', UnitConversion::class);

        $model = new UnitConversion();
        $model->fill($request->all());
        $model->save();

        return $this->success("Vendor created successfully!", $model);
    }

    /**
     * Display the specified resource.
     */
    public function show(UnitConversion $unitConversion)
    {
        $this->authorize('view', $unitConversion);

        $unitConversion->load($unitConversion->getWith(request()->with));
        return $this->success("", $unitConversion);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(UnitConversion $unitConversion)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUnitConversionRequest $request, UnitConversion $unitConversion)
    {
        $this->authorize('update', $unitConversion);

        $model = $unitConversion;
        $model->fill($request->all());
        $model->save();

        return $this->success("Vendor updated successfully!", $model);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(UnitConversion $unitConversion)
    {
        $this->authorize('delete', $unitConversion);

        try {
            return $this->success("Unit Conversion deleted successfully!", $unitConversion->delete());
        } catch (QueryException $e) {
            if ($e->getCode() == '23000') {
                return $this->error("Unit Conversion is linked to other records and cannot be deleted.", 400);
            }
            return $this->error("Unit Conversion cannot be deleted! : " . $e->getMessage(), 500);
        }
    }
}
