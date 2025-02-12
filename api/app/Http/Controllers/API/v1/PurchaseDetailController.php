<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePurchaseDetailRequest;
use App\Http\Requests\UpdatePurchaseDetailRequest;
use App\Models\PurchaseDetail;

class PurchaseDetailController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePurchaseDetailRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(PurchaseDetail $purchaseDetail)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePurchaseDetailRequest $request, PurchaseDetail $purchaseDetail)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PurchaseDetail $purchaseDetail)
    {
        //
    }
}
