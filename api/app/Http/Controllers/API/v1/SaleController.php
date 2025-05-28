<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSaleRequest;
use App\Http\Requests\UpdateSaleRequest;
use App\Models\Sale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Sale::class);

        $pageSize = null;
        if (intval($request->pageSize)) {
            $pageSize = intval($request->get('pageSize', 1000));
        }
        $model = new Sale();
        $model = $model->handleWith($request->with)->selectCols($request->get('cols'))
            ->applyFilter($request->get('filter'))->sortOrder($request->orderField, $request->orderBy)->getBuilder();

        return $model->paginate($pageSize, ['*'], 'page', $request->page);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSaleRequest $request)
    {
        $this->authorize('create', Sale::class);

        try {
            DB::beginTransaction();
            $purchase = new Sale();
            $request->merge([
                'created_by' => Auth::id(),
            ]);
            $purchase->fill($request->all());
            $purchase->save();
            $purchase->saleDetails()->createMany($request->saleDetails);
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error("Unable to create Sale");
        }

        return $this->success("Sale created successfully", $purchase);
    }

    /**
     * Display the specified resource.
     */
    public function show(Sale $sale, Request $request)
    {
        $this->authorize('view', $sale);

        $sale->load($sale->getWith($request->with));

        return $this->success("Sale retrieved successfully", $sale);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSaleRequest $request, Sale $sale)
    {
        $this->authorize('update', $sale);

        try {
            DB::beginTransaction();
            $sale->fill($request->all());
            $sale->save();
            $sale->saleDetails()->delete();
            $sale->saleDetails()->createMany($request->saleDetails);
            DB::commit();
            return $this->success("Sale updated successfully", $sale);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error("Unable to delete purchase details");
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Sale $sale)
    {
        $this->authorize('delete', $sale);
        try {
            $sale->saleDetails()->delete();
            $sale->delete();
            return $this->success("Sale deleted successfully");
        } catch (\Exception $e) {
            return $this->error("Unable to delete sale details");
        }
    }
}
