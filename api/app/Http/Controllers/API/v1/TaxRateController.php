<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTaxRateRequest;
use App\Http\Requests\UpdateTaxRateRequest;
use App\Models\TaxRate;
use App\Traits\ApiResponser;
use Illuminate\Http\Request;

class TaxRateController extends Controller
{
    use ApiResponser;
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', TaxRate::class);

        $pageSize = null;
        if (intval($request->pageSize)) {
            $pageSize = intval($request->get('pageSize', 1000));
        }
        $model = new TaxRate();
        $model = $model->handleWith($request->with)->selectCols($request->get('cols'))
            ->applyFilter($request->get('filter'))->sortOrder($request->orderField, $request->orderBy)->getBuilder();

        return $model->paginate($pageSize, ['*'], 'page', $request->page);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTaxRateRequest $request)
    {
        $this->authorize('create', TaxRate::class);

        $model = new TaxRate();
        $model->fill($request->validated());
        $model->save();

        return $this->success("Tax Rate created successfully!", $model);
    }

    /**
     * Display the specified resource.
     */
    public function show(TaxRate $taxRate, Request $request)
    {
        $this->authorize('view', $taxRate);

        if ($request->with) {
            $taxRate->load($taxRate->getWith($request->with));
        }

        return $this->success('Tax Rate Created Successfully!', $taxRate);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTaxRateRequest $request, TaxRate $taxRate)
    {
        $this->authorize('update', $taxRate);
        
        $taxRate->fill($request->validated());
        $taxRate->save();

        return $this->success('Tax Rate Updated Successfully!', $taxRate);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TaxRate $taxRate)
    {
        $this->authorize('delete', $taxRate);

        if ($taxRate->delete()) {
            return $this->success('Tax Rate Deleted Successfully!');
        }

        return $this->error('Failed to delete Tax Rate.', 500);
    }
}
