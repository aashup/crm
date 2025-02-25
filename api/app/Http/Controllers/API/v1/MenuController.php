<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\API\BaseResponse;
use App\Http\Controllers\Controller;
use App\Models\Menu;
use Illuminate\Http\Request;

class MenuController extends Controller
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
        $model = new Menu();
        $model = $model->handleWith($request->with)->selectCols($request->get('cols'))
            ->applyFilter($request->get('filter'))->sortOrder($request->orderField, $request->orderBy)->getBuilder();
        $filter = json_decode($request->get('filter'), 1);
        $model = $model->whereHas('state', function ($q) {
            $q->where('status', 1);
        });

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
        $model = new Menu();
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
    public function show(Menu $model, Request $request)
    {
        $model->load($model->getWith($request->with));

        return BaseResponse::success($model);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Models\Menu  $model
     * @return \Illuminate\Http\Response
     *
     * @throws
     */
    public function update(Request $request, Menu $Menu)
    {
        $model = $Menu;
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
    public function destroy(Menu $model)
    {
        return BaseResponse::success($model->delete());
    }
}
