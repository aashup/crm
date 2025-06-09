<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\API\BaseResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCityRequest;
use App\Http\Requests\UpdateCityRequest;
use App\Models\City;
use App\Models\State;
use Illuminate\Http\Request;

class CityController extends Controller
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
        $model = new City();
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
        $model = new City();
        $request->validate($model->validationRule(), $model->validationMessage());
        $state = State::findOrFail($request->state_id);
        $model->fill($request->all());
        $model->country_id =  $state->country_id;
        $model->save();

        return BaseResponse::success($model);
    }

    /**
     * Display the specified resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function show(City $model, Request $request)
    {
        $model->load($model->getWith($request->with));

        return BaseResponse::success($model);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Models\City  $model
     * @return \Illuminate\Http\Response
     *
     * @throws
     */
    public function update(Request $request, City $city)
    {
        $model = $city;
        $request->validate($model->validationRule(), $model->validationMessage());
        $state = State::findOrFail($request->state_id);
        $model->fill($request->all());
        $model->country_id =  $state->country_id;
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
    public function destroy(City $city)
    {
        try {
            return BaseResponse::success($city->delete());
        } catch (\Exception $e) {
            return BaseResponse::error($e->getMessage());
        }
    }
}
