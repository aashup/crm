<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\API\BaseResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateStateRequest;
use App\Models\State;
use Illuminate\Http\Request;

class StateController extends Controller
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
        $model = new State();
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
        $model = new State();
        $data = $request->validate( $model->validationRule(), $model->validationMessage());
        $model->fill($data);
        $model->save();

        return BaseResponse::success($model);
    }

    /**
     * Display the specified resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function show(State $model, Request $request)
    {
        $model->load($model->getWith($request->with));

        return BaseResponse::success($model);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Models\State  $coutry
     * @return \Illuminate\Http\Response
     *
     * @throws
     */
    public function update(Request $request, State $State)
    {
        $model = $State;
        $data = $request->validate( $model->validationRule(), $model->validationMessage());
        $model->fill($data);
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
    public function destroy(State $State)
    {
        return BaseResponse::success($State->delete());
    }
}
