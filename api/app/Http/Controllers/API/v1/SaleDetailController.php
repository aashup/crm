<?php
namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSaleDetailRequest;
use App\Http\Requests\UpdateSaleDetailRequest;
use App\Models\SaleDetail;

class SaleDetailController extends Controller
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
    public function store(StoreSaleDetailRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(SaleDetail $saleDetail)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSaleDetailRequest $request, SaleDetail $saleDetail)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SaleDetail $saleDetail)
    {
        //
    }
}
