<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\API\BaseResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInventoryRequest;
use App\Http\Requests\StorePOSRequest;
use App\Http\Requests\UpdateInventoryRequest;
use App\Models\Contact;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\ProductUnit;
use App\Models\Sale;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PosController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $contacts = Contact::select(['id', 'name', 'mob1', 'mob2', 'status'])->where('status', 1)->orderBy('name')->get();
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
        ])->where('status', 1)->orderBy('name')->get();

        $units = Unit::select(['id', 'name', 'status'])->orderBy('name')->where('status', 1)->get();
        return BaseResponse::success(['contacts' => $contacts, 'products' => $products, 'units' => $units]);
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
    public function store(StorePOSRequest $request)
    {
        try {
            DB::beginTransaction();

            $validated = $request->validated();

            if (!$validated['contact_id']) {
                $contactExists = Contact::where('mob1', $validated['mobile'])->orWhere('mob2', $validated['mobile'])->orWhere('name', $validated['name'])->exists();
                if ($contactExists) {
                    return $this->error("Contact with this mobile or name already exists");
                }
                $contact = Contact::create([
                    'name' => $validated['name'],
                    'mob1' => $validated['mobile'],
                    'status' => 1,
                    'created_by' => Auth::id(),
                ]);
                $validated['contact_id'] = $contact->id;
            }

            $validated['created_by'] = Auth::id();

            $sale = new Sale();
            $sale->fill($validated);
            $sale->save();

            $sale->saleDetails()->createMany($validated['saleDetails']);
            
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Sale Creation Failed: ' . $e->getMessage(), [
                'stack' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);
            return $this->error("Unable to create Sale");
        }

        return $this->success("Sale created successfully", $sale);
    }

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
