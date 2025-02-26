<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\API\BaseResponse;
use App\Http\Controllers\Controller;
use App\Models\Unit;
use Illuminate\Http\Request;

class UnitController extends Controller
{
     /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $pageSize = null;
        if (intval($request->pageSize)) {
            $pageSize = intval($request->get('pageSize', 1000));
        }
        $model = new Unit();
        $model = $model->handleWith($request->with)->selectCols($request->get('cols'))
            ->applyFilter($request->get('filter'))->sortOrder($request->orderField, $request->orderBy)->getBuilder();

        return $model->paginate($pageSize, ['*'], 'page', $request->page);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @return \Illuminate\Http\Response
     *
     * @throws
     */
    public function store(Request $request)
    {
        $model = new Unit();
        $request->validate( $model->validationRule(), $model->validationMessage());
        $model->fill($request->all());
        $model->save();

        return BaseResponse::success($model);
    }

    /**
     * Display the specified resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function show(Unit $unit, Request $request)
    {
        $unit->load($unit->getWith($request->with));

        return BaseResponse::success($unit);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Models\Unit  $model
     * @return \Illuminate\Http\Response
     *
     * @throws
     */
    public function update(Request $request, Unit $Unit)
    {
        $model = $Unit;
        $request->validate( $model->validationRule(), $model->validationMessage());
        $model->fill($request->all());
        $model->save();

        return BaseResponse::success($model);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @return \Illuminate\Http\Response
     *
     * @throws
     */
    public function destroy(Unit $unit)
    {
        return BaseResponse::success($unit->delete());
    }
}
