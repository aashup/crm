<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use App\Traits\ApiResponser;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    use ApiResponser;

    private $dashboardService;

    public function __construct()
    {
        $this->dashboardService = new DashboardService();
    }

    protected $mapInterval = [
        1 => 'DATE(created_at) = CURDATE()', // Today
        2 => '(YEARWEEK(created_at) = YEARWEEK(NOW()) AND YEAR(created_at) = YEAR(CURRENT_DATE()))', // This week
        3 => '(DATE(created_at) >= DATE(SUBDATE(now(), INTERVAL 7 DAY)))', // Last 7 days
        4 => '(MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE()))', // This Month
        5 => '(DATE(created_at) >= DATE(SUBDATE(now(), INTERVAL 1 MONTH)))', // Last 30 days
        6 => '(YEAR(created_at) = YEAR(CURDATE()))', // This year
        7 => '(DATE(created_at) >= DATE(SUBDATE(now(), INTERVAL 365 DAY)))', // Last 365 days
        8 => '(QUARTER(created_at) = QUARTER(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE()))', // Current Quarters
        9 => '(QUARTER(created_at) = 1 AND YEAR(created_at) = YEAR(CURRENT_DATE()))', // Q1 Quarters
        10 => '(QUARTER(created_at) = 2 AND YEAR(created_at) = YEAR(CURRENT_DATE()))', // Q2 Quarters
        11 => '(QUARTER(created_at) = 3 AND YEAR(created_at) = YEAR(CURRENT_DATE()))', // Q3 Quarters
        12 => '(QUARTER(created_at) = 4 AND YEAR(created_at) = YEAR(CURRENT_DATE()))', // Q4 Quarters
        13 => '(MONTH(created_at) = IF((MONTH(CURRENT_DATE())-1) = 0, 12, (MONTH(CURRENT_DATE())-1)) AND YEAR(created_at) = IF((MONTH(CURRENT_DATE())-1) = 0, (YEAR(CURRENT_DATE()) - 1), YEAR(CURRENT_DATE())) AND YEAR(created_at) = YEAR(CURRENT_DATE()))', // LAST MONTH
    ];

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $raw = $this->mapInterval[7];
        if ($request->interval && in_array($request->interval, [1, 2, 3, 4, 5, 6, 7])) {
            $raw = $this->mapInterval[$request->interval];
        }

        $card = [
            'total_sales' => $this->dashboardService->getTotalSales($raw),
            'total_purchases' => $this->dashboardService->getTotalPurchases($raw),
            'expenses' => [
                'total_expenses' => $this->dashboardService->getTotalExpenses($raw, 'expense'),
                'total_gains' => $this->dashboardService->getTotalExpenses($raw, 'gain'),
            ],
            'total_products' => $this->dashboardService->getTotalProducts($raw),
            'total_parties' => $this->dashboardService->getTotalParties($raw),
        ];

        $card['net_profit'] = ($card['total_sales'] + $card['expenses']['total_gains']) - ($card['total_purchases'] + $card['expenses']['total_expenses']);

        $data = [
            'card' => $card,
            'sales' => [
                'top_selling_products' => $this->dashboardService->getTopSellingProducts($raw), // Bar chart
                'sales_by_payment_method' => $this->dashboardService->getSalesByPaymentMethod($raw), //Pie / Donut chart
                'sales_by_party' => $this->dashboardService->getSalesByParty($raw), //Horizontal bar chart
            ],
            'purchase' => [
                'top_purchasing_products' => $this->dashboardService->getTopPurchasingProducts($raw), // Bar chart
                'purchase_by_payment_method' => $this->dashboardService->getPurchaseByPaymentMethod($raw), //Pie / Donut chart
                'purchase_by_party' => $this->dashboardService->getPurchaseByParty($raw), //Horizontal bar chart
            ]
        ];

        return $this->success('Dashboard data fetched successfully.', $data);
    }
}
