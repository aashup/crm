<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePurchaseRequest;
use App\Http\Requests\UpdatePurchaseRequest;
use App\Models\Inventory;
use App\Models\Party;
use App\Models\Product;
use App\Models\ProductUnit;
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

            $purchaseDetails = $validated['purchaseDetails'];
            foreach ($purchaseDetails as &$item) {
                if (empty($item['product_id']) && !empty($item['product_name'])) {
                    $product = Product::create([
                        'name' => $item['product_name'],
                        'unit_id' => $item['unit_id'],
                        'status' => 1,
                        'created_by' => Auth::id(),
                    ]);

                    $product->units()->create([
                        'unit_id' => $item['unit_id'],
                        'purchase_price' => $item['rate'],
                        'purchase_price_tax_type' => $item['purchase_price_tax_type'] ?? 2,
                        'tax_rate_id' => $item['tax_rate'] ? getTaxRateIdFromString($item['tax_rate']) : null,
                        'status' => 1,
                    ]);

                    $item['product_id'] = $product->id;
                }
            }
            $validated['purchaseDetails'] = $purchaseDetails;

            $purchase = new Purchase();
            $purchase->fill($validated);
            $purchase->save();

            $purchase->purchaseDetails()->createMany($validated['purchaseDetails']);

            foreach ($validated['purchaseDetails'] as $detail) {
                $productUnit = ProductUnit::where('product_id', $detail['product_id'])
                    ->where('unit_id', $detail['unit_id'])
                    ->first();

                if ($productUnit) {
                    $this->updateInventory($productUnit, $detail);
                } else {
                    $product = Product::find($detail['product_id']);

                    $productUnit = $product->units()->create([
                        'unit_id' => $detail['unit_id'],
                        'purchase_price' => $detail['rate'],
                        'purchase_price_tax_type' => $detail['purchase_price_tax_type'] ?? 2,
                        'tax_rate_id' => $detail['tax_rate'] ? getTaxRateIdFromString($detail['tax_rate']) : null,
                        'status' => 1,
                    ]);

                    $this->updateInventory($productUnit, $detail);
                }
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return $e;
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

            $purchaseDetails = $validated['purchaseDetails'];
            foreach ($purchaseDetails as &$item) {
                if (empty($item['product_id']) && !empty($item['product_name'])) {
                    $product = Product::create([
                        'name' => $item['product_name'],
                        'unit_id' => $item['unit_id'],
                        'status' => 1,
                        'created_by' => Auth::id(),
                    ]);

                    $product->units()->create([
                        'unit_id' => $item['unit_id'],
                        'purchase_price' => $item['rate'],
                        'purchase_price_tax_type' => $item['purchase_price_tax_type'] ?? 2,
                        'tax_rate_id' => $item['tax_rate'] ? getTaxRateIdFromString($item['tax_rate']) : null,
                        'status' => 1,
                    ]);

                    $item['product_id'] = $product->id;
                }
            }
            $validated['purchaseDetails'] = $purchaseDetails;

            foreach ($purchase->purchaseDetails as $oldDetail) {
                $productUnit = ProductUnit::where('product_id', $oldDetail->product_id)
                    ->where('unit_id', $oldDetail->unit_id)
                    ->first();

                if ($productUnit) {
                    $this->reverseInventory($productUnit, $oldDetail);
                }
            }

            $purchase->fill($validated);
            $purchase->save();

            $purchase->purchaseDetails()->delete();
            $purchase->purchaseDetails()->createMany($request->purchaseDetails);

            foreach ($validated['purchaseDetails'] as $detail) {
                $productUnit = ProductUnit::where('product_id', $detail['product_id'])
                    ->where('unit_id', $detail['unit_id'])
                    ->first();

                if ($productUnit) {
                    $this->updateInventory($productUnit, $detail);
                } else {
                    $product = Product::find($detail['product_id']);

                    $productUnit = $product->units()->create([
                        'unit_id' => $detail['unit_id'],
                        'purchase_price' => $detail['rate'],
                        'purchase_price_tax_type' => $detail['purchase_price_tax_type'] ?? 2,
                        'tax_rate_id' => $detail['tax_rate'] ? getTaxRateIdFromString($detail['tax_rate']) : null,
                        'status' => 1,
                    ]);

                    $this->updateInventory($productUnit, $detail);
                }
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error("Unable to delete purchase details");
        }
        return $this->success("Purchase updated successfully", $purchase);
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

    private function updateInventory($productUnit, $detail)
    {
        $inventory = Inventory::where(['product_id' => $productUnit->product_id, 'unit_id' => $productUnit->unit_id])->first();
        if ($inventory) {
            $inventory->qty += $detail['quantity'];
            $inventory->rem_qty += $detail['quantity'];
            $inventory->save();
        } else {
            Inventory::create([
                'product_id' => $productUnit->product_id,
                'unit_id' => $productUnit->unit_id,
                'rem_qty' => $detail['quantity'],
                'qty' => $detail['quantity'],
                'created_by' => Auth::id(),
                'unit_price' => $detail['rate'] ?? 0,
            ]);
        }
    }

    private function reverseInventory($productUnit, $detail)
    {
        $inventory = Inventory::where([
            'product_id' => $productUnit->product_id,
            'unit_id' => $productUnit->unit_id
        ])->first();

        if ($inventory) {
            $inventory->qty = max(0, $inventory->qty - $detail['quantity']);
            $inventory->rem_qty = max(0, $inventory->rem_qty - $detail['quantity']);
            $inventory->save();
        }
    }
}
