<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePurchaseRequest;
use App\Http\Requests\StoreSaleRequest;
use App\Http\Requests\UpdateSaleRequest;
use App\Models\Inventory;
use App\Models\Party;
use App\Models\Product;
use App\Models\ProductUnit;
use App\Models\Sale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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
                        'sale_price' => $item['price_per_unit'],
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
                    $product = Product::find($detail['product_id']);
                    $productUnit = $product->units()->create([
                        'unit_id' => $item['unit_id'],
                        'sale_price' => $item['price_per_unit'],
                        'sale_price_tax_type' => $item['sale_price_tax_type'] ?? 2,
                        'sale_price_discount_amount' => $item['discount_amount'] ?? 0,
                        'sale_price_discount_type' => $item['discount_type'] ?? 1,
                        'tax_rate_id' => $item['tax_rate'] ? getTaxRateIdFromString($item['tax_rate']) : null,
                        'status' => 1,
                    ]);
                    $this->updateInventory($productUnit, $detail);
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
                        'sale_price' => $item['price_per_unit'],
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

            $sale->fill($validated);
            $sale->save();

            foreach ($sale->saleDetails as $oldDetail) {
                $productUnit = ProductUnit::where('product_id', $oldDetail->product_id)
                    ->where('unit_id', $oldDetail->unit_id)
                    ->first();

                if ($productUnit) {
                    $this->restoreInventory($productUnit, $oldDetail);
                }
            }

            $sale->saleDetails()->delete(); // Clear existing details
            $sale->saleDetails()->createMany($validated['saleDetails']);

            foreach ($validated['saleDetails'] as $detail) {
                $productUnit = ProductUnit::where('product_id', $detail['product_id'])
                    ->where('unit_id', $detail['unit_id'])
                    ->first();

                if ($productUnit) {
                    $this->updateInventory($productUnit, $detail);
                } else {
                    $product = Product::find($detail['product_id']);
                    $productUnit = $product->units()->create([
                        'unit_id' => $item['unit_id'],
                        'sale_price' => $item['price_per_unit'],
                        'sale_price_tax_type' => $item['sale_price_tax_type'] ?? 2,
                        'sale_price_discount_amount' => $item['discount_amount'] ?? 0,
                        'sale_price_discount_type' => $item['discount_type'] ?? 1,
                        'tax_rate_id' => $item['tax_rate'] ? getTaxRateIdFromString($item['tax_rate']) : null,
                        'status' => 1,
                    ]);
                    $this->updateInventory($productUnit, $detail);
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

        return $this->success("Sale updated successfully", $sale);
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

    private function restoreInventory($productUnit, $detail)
    {
        $inventory = Inventory::where([
            'product_id' => $productUnit->product_id,
            'unit_id' => $productUnit->unit_id
        ])->first();

        if ($inventory) {
            $inventory->rem_qty += $detail->quantity; // restore back
            $inventory->save();
        }
    }
}
