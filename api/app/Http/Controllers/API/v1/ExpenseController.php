<?php

namespace App\Http\Controllers\API\v1;

use App\Models\Expense;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Controllers\API\BaseResponse;
use Illuminate\Validation\ValidationException;

class ExpenseController extends Controller
{
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
        $model = new Expense();
        $model = $model->handleWith($request->with)->selectCols($request->get('cols'))
            ->applyFilter($request->get('filter'))->sortOrder($request->orderField, $request->orderBy)->getBuilder();

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
