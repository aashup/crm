<?php

namespace App\Services;

use App\Http\Controllers\API\BaseResponse;
use App\Models\Expense;
use App\Models\Party;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\PurchaseDetail;
use App\Models\Sale;
use App\Models\SaleDetail;

class DashboardService
{
    public function downloadReport($rawWhere)
    {
        $sales = Sale::with('party', 'saleDetails', 'unit', 'createdBy')->whereRaw($rawWhere)->get();

        $purchases = Purchase::with('createdBy', "party", "purchaseDetails")->whereRaw($rawWhere)->get();

        $expenses = Expense::whereRaw($rawWhere)->get();

        $data = [
            'sales' => $sales,
            'purchases' => $purchases,
            'expenses' => $expenses,
        ];

        return BaseResponse::success([
            'message' => 'Report data fetched successfully.',
            'data' => $data,
        ]);
    }

    public function getTotalSales($rawWhere)
    {
        $model = new Sale();
        return  $model
            ->whereRaw($rawWhere)
            ->sum('net_total');
    }

    public function getTotalPurchases($rawWhere)
    {
        $model = new Purchase();
        return  $model
            ->whereRaw($rawWhere)
            ->sum('net_total');
    }

    public function getTotalExpenses($rawWhere, $type)
    {
        $model = new Expense();
        return  $model
            ->whereRaw($rawWhere)
            ->where('expense_type', $type)
            ->sum('amount');
    }

    public function getExpensesByType($rawWhere)
    {
        $model = new Expense();
        return  $model
            ->selectRaw('SUM(amount) as total, expense_type')
            ->whereRaw($rawWhere)
            ->groupBy('expense_type')
            ->get();
    }

    public function getTotalProducts($rawWhere)
    {
        $model = new Product();
        return  $model
            ->whereRaw($rawWhere)
            ->count('id');
    }

    public function getTotalParties($rawWhere)
    {
        $model = new Party();
        return  $model
            ->whereRaw($rawWhere)
            ->count('id');
    }

    public function getSalesByPaymentMethod($rawWhere)
    {
        $model = new Sale();
        return  $model
            ->selectRaw('SUM(net_total) as total, payment_method')
            ->whereRaw($rawWhere)
            ->groupBy('payment_method')
            ->get();
    }

    public function getTopSellingProducts($rawWhere)
    {
        $model = new SaleDetail();
        return  $model
            ->selectRaw('SUM(quantity) as total_qty, SUM(net) as total_sales, product_id, products.name as product_name')
            ->join('products', 'products.id', '=', 'sale_details.product_id')
            ->whereRaw(str_replace('created_at', 'sale_details.created_at', $rawWhere))
            ->groupBy('product_id')
            ->orderByDesc('total_sales')
            ->limit(10)
            ->get();
    }

    public function getSalesByParty($rawWhere)
    {
        $model = new Sale();
        return  $model
            ->selectRaw('SUM(net_total) as total, party_id, parties.name as party_name')
            ->join('parties', 'parties.id', '=', 'sales.party_id')
            ->whereRaw(str_replace('created_at', 'sales.created_at', $rawWhere))
            ->groupBy('party_id')
            ->orderByDesc('total')
            ->limit(10)
            ->get();
    }

    public function getPurchaseByPaymentMethod($rawWhere)
    {
        $model = new Purchase();
        return  $model
            ->selectRaw('SUM(net_total) as total, payment_method')
            ->whereRaw($rawWhere)
            ->groupBy('payment_method')
            ->get();
    }

    public function getTopPurchasingProducts($rawWhere)
    {
        $model = new PurchaseDetail();
        return  $model
            ->selectRaw('SUM(quantity) as total_qty, SUM(net) as total_sales, product_id, products.name as product_name')
            ->join('products', 'products.id', '=', 'purchase_details.product_id')
            ->whereRaw(str_replace('created_at', 'purchase_details.created_at', $rawWhere))
            ->groupBy('product_id')
            ->orderByDesc('total_sales')
            ->limit(10)
            ->get();
    }

    public function getPurchaseByParty($rawWhere)
    {
        $model = new Purchase();
        return  $model
            ->selectRaw('SUM(net_total) as total, party_id, parties.name as party_name')
            ->join('parties', 'parties.id', '=', 'purchases.party_id')
            ->whereRaw(str_replace('created_at', 'purchases.created_at', $rawWhere))
            ->groupBy('party_id')
            ->orderByDesc('total')
            ->limit(10)
            ->get();
    }
}
