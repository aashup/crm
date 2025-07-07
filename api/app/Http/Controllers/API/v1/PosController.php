<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\API\BaseResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInventoryRequest;
use App\Http\Requests\UpdateInventoryRequest;
use App\Models\Contact;
use App\Models\Inventory;
use App\Models\Product;
use Illuminate\Http\Request;

class PosController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $contacts = Contact::select(['id', 'address', 'pin', 'mob1', 'mob2', 'type', 'status'])->where('status', 1)->get();
        $products = Product::with([
            'productUnit' => function ($q) {
                return $q->with('unit')->select([
                    'product_id',
                    'unit_id',
                    'sale_price',
                    'status'
                ]);
            }
        ])->select([
            'id',
            'name',
            'status',
            'slug',
            'type'
        ])->where('status', 1)->get();
        return BaseResponse::success(['contacts' => $contacts, 'products' => $products]);
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
    public function store(StoreInventoryRequest $request) {}

    /**
     * Display the specified resource.
     */
    public function show(Inventory $inventory) {}

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
    public function update(UpdateInventoryRequest $request, Inventory $inventory) {}

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Inventory $inventory) {}
}
