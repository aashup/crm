<?php

namespace App\Http\Controllers\API\v1;

use App\Models\Expense;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Controllers\API\BaseResponse;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

class ExpenseController extends Controller
{
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
        $this->authorize('viewAny', Expense::class);

        $pageSize = null;
        if (intval($request->pageSize)) {
            $pageSize = intval($request->get('pageSize', 1000));
        }
        $filter = json_decode($request->get('filter'), 1);

        $model = new Expense();
        $model = $model->handleWith($request->with)->selectCols($request->get('cols'))
            ->applyFilter($request->get('filter'))->sortOrder($request->orderField, $request->orderBy)->getBuilder();

        if (isset($filter['expenseInterval']) && $filter['expenseInterval'] && isset($this->mapInterval[$filter['expenseInterval']])) {
            $raw = $this->mapInterval[$filter['expenseInterval']];
            $model = $model->whereRaw($raw);
        }

        if (!empty($filter['start_date'])) {
            $from_date = Carbon::parse($filter['start_date'])->setTimeZone('UTC');
            $model->where('created_at', '>=', $from_date);
        } 
        if (!empty($filter['end_date'])) {
            $to_date = Carbon::parse($filter['end_date'])->setTimeZone('UTC')->addDay();
            $model->where('created_at', '<', $to_date);
        }

        return $model->paginate($pageSize, ['*'], 'page', $request->page);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('create', Expense::class);

        $model = new Expense();
        try {
            $request->validate($model->validationRule(), $model->validationMessage());
        } catch (ValidationException $e) {
            return BaseResponse::error($e->validator->errors()->all());
        }

        $model->fill($request->all());
        $model->save();

        return BaseResponse::success($model);
    }

    /**
     * Display the specified resource.
     */
    public function show(Expense $expense)
    {
        $this->authorize('view', $expense);

        return BaseResponse::success($expense);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Expense $expense)
    {
        $this->authorize('update', $expense);

        $model = $expense;
        try {
            $request->validate($model->validationRule(), $model->validationMessage());
        } catch (ValidationException $e) {
            return BaseResponse::error($e->validator->errors()->all());
        }
        $model->fill($request->all());
        $model->save();

        return BaseResponse::success($model);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Expense $expense)
    {
        $this->authorize('delete', $expense);

        try {
            return BaseResponse::success($expense->delete());
        } catch (\Exception $e) {
            return BaseResponse::error($e->getMessage());
        }
    }
}
