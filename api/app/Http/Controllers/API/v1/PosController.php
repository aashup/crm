<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\API\BaseResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInventoryRequest;
use App\Http\Requests\StorePOSRequest;
use App\Http\Requests\StoreSaleRequest;
use App\Http\Requests\UpdateInventoryRequest;
use App\Models\Contact;
use App\Models\Inventory;
use App\Models\Party;
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
        $parties = Party::select(['id', 'name', 'mobile'])->orderBy('name')->get();
        $products = Product::with([
            'productUnit' => function ($q) {
                return $q->with('unit:id,name,status', 'taxRate:id,rate,type,is_active')->select([
                    'product_id',
                    'unit_id',
                    'sale_price',
                    'sale_price_tax_type',
                    'sale_price_discount_amount',
                    'sale_price_discount_type',
                    'tax_rate_id',
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
        return BaseResponse::success(['parties' => $parties, 'products' => $products, 'units' => $units]);
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
    public function store(StoreSaleRequest $request)
    {
        try {
            DB::beginTransaction();

            $validated = $request->validated();

            if (!$validated['party_id']) {
                $partyExists = Party::where('name', $validated['name'])->exists();
                if ($partyExists) {
                    return $this->error("Party with this name already exists");
                }

                $party = Party::create([
                    'name' => $validated['name'],
                    'mobile' => $validated['mobile'],
                ]);
                
                $validated['party_id'] = $party->id;
            }

            $validated['created_by'] = Auth::id();

            $salesDetails = $validated['saleDetails'];
            foreach ($salesDetails as &$item) {
                if (empty($item['product_id']) && !empty($item['product_name'])) {
                    $product = Product::create([
                        'name' => $item['product_name'],
                        'unit_id' => $item['unit_id'],
                        'status' => 1,
                        'created_by' => Auth::id(),
                    ]);

                    $product->units()->create([
                        'unit_id' => $item['unit_id'],
                        'sale_price' => $item['rate'],
                        'sale_price_tax_type' => $item['sale_price_tax_type'] ?? 2,
                        'sale_price_discount_amount' => $item['discount_amount'] ?? 0,
                        'sale_price_discount_type' => $item['discount_type'] ?? 1,
                        'tax_rate_id' => $item['tax_rate'] ? getTaxRateIdFromString($item['tax_rate']) : null,
                        'status' => 1,
                    ]);

                    $item['product_id'] = $product->id;
                }
            }
            $validated['saleDetails'] = $salesDetails;

            $sale = new Sale();
            $sale->fill($validated);
            $sale->save();

            $sale->saleDetails()->createMany($validated['saleDetails']);

            foreach ($validated['saleDetails'] as $detail) {
                $productUnit = ProductUnit::where('product_id', $detail['product_id'])
                    ->where('unit_id', $detail['unit_id'])
                    ->first();

                if ($productUnit) {
                    $this->updateInventory($productUnit, $detail);
                } else {
                    DB::rollBack();
                    return $this->error("Product unit not found for product ID: {$detail['product_id']} and unit ID: {$detail['unit_id']}");
                }
            }

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

    private function updateInventory($productUnit, $detail)
    {
        $inventory = Inventory::where(['product_id' => $productUnit->product_id, 'unit_id' => $productUnit->unit_id])->first();
        if ($inventory) {
            $inventory->rem_qty -= $detail['quantity'];
            $inventory->save();
        } else {
            Inventory::create([
                'product_id' => $productUnit->product_id,
                'unit_id' => $productUnit->unit_id,
                'rem_qty' => -$detail['quantity'],
                'qty' => $detail['quantity'],
                'created_by' => Auth::id(),
                'unit_price' => $detail['rate'] ?? 0,
            ]);
        }
    }
}
