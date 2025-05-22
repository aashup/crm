<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePurchaseRequest;
use App\Http\Requests\UpdatePurchaseRequest;
use App\Models\Purchase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PurchaseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Purchase::class);

        $pageSize = null;
        if (intval($request->pageSize)) {
            $pageSize = intval($request->get('pageSize', 1000));
        }
        $model = new Purchase();
        $model = $model->handleWith($request->with)->selectCols($request->get('cols'))
            ->applyFilter($request->get('filter'))->sortOrder($request->orderField, $request->orderBy)->getBuilder();

        return $model->paginate($pageSize, ['*'], 'page', $request->page);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePurchaseRequest $request)
    {
        $this->authorize('create', Purchase::class);

        try {
            DB::beginTransaction();
            $purchase = new Purchase();
            $request->merge([
                'created_by' => Auth::id(),
            ]);
            $purchase->fill($request->all());
            $purchase->save();
            $purchase->purchaseDetails()->createMany($request->purchaseDetails);
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error("Unable to create purchase");
        }

        return $this->success("Purchase created successfully", $purchase);
    }

    /**
     * Display the specified resource.
     */
    public function show(Purchase $purchase, Request $request)
    {
        $this->authorize('view', $purchase);

        $purchase->load($purchase->getWith($request->with));

        return $this->success("Purchase retrieved successfully", $purchase);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePurchaseRequest $request, Purchase $purchase)
    {
        $this->authorize('update', $purchase);

        try {
            DB::beginTransaction();
            $purchase->fill($request->all());
            $purchase->save();
            $purchase->purchaseDetails()->delete();
            $purchase->purchaseDetails()->createMany($request->purchaseDetails);
            DB::commit();
            return $this->success("Purchase updated successfully", $purchase);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error("Unable to delete purchase details");
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Purchase $purchase)
    {
        $this->authorize('delete', $purchase);
        try {
            $purchase->purchaseDetails()->delete();
            $purchase->delete();
            return $this->success("Purchase deleted successfully");
        } catch (\Exception $e) {
            return $this->error("Unable to delete purchase details");
        }
    }
}
