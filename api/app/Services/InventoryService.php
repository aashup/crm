<?php

namespace App\Services;

use App\Models\Inventory;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class InventoryService
{
    public function processPurchaseInventory(array $purchaseDetails)
    {
        foreach ($purchaseDetails as $detail) {
            $this->updateInventory(
                $detail['product_id'],
                $detail['unit_id'],
                $detail['quantity'],
                $detail['amount'],
                null,
                true
            );
        }
    }

    public function processSalesInventory(array $saleDetails)
    {
        foreach ($saleDetails as $detail) {
            $this->updateInventory(
                $detail['product_id'],
                $detail['unit_id'],
                $detail['quantity'],
                null,
                $detail['amount'],
                false
            );
        }
    }

    private function updateInventory($product_id, $unit_id, $qty, $purchase_price = null, $sale_price = null, $isPurchase = true)
    {
        try {
            $inventory = Inventory::firstOrNew([
                'product_id' => $product_id,
                'unit_id' => $unit_id
            ]);

            $user = Auth::user();

            if ($inventory->exists) {
                if ($isPurchase) {
                    $inventory->qty += $qty;
                    $inventory->rem_qty += $qty;
                    if ($purchase_price !== null) {
                        $inventory->purchase_price = $purchase_price;
                    }
                } else {
                    $inventory->rem_qty -= $qty;
                    if ($sale_price !== null) {
                        $inventory->sale_price = $sale_price;
                    }
                }
            } else {
                $inventory->qty = $isPurchase ? $qty : 0;
                $inventory->rem_qty = $isPurchase ? $qty : 0;
                $inventory->purchase_price = $purchase_price;
                $inventory->sale_price = $sale_price;
                $inventory->created_by = $user->id;
                $inventory->status = 1;
            }

            $inventory->save();
            return $inventory;

        } catch (\Exception $ex) {
            Log::error("Inventory update failed: " . $ex->getMessage());
            throw $ex;
        }
    }
}
