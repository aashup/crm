<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCityRequest;
use App\Http\Requests\UpdateCityRequest;
use App\Models\City;
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
        if (isset($filter['country_id'])) {
            $country_id = $filter['country_id'];
            if (isset($country_id) && $country_id !== '') {
                $model->whereHas('state.country', function ($q) use ($country_id) {
                    $q->where('id', $country_id);
                });
            }
        }
        $model = $model->whereHas('state.country', function ($q) {
            $q->where('isActive', 1);
        });
        if (isset($filter['state_id'])) {
            $state_id = $filter['state_id'];
            if (isset($state_id) && $state_id !== '') {
                $model = $model->whereHas('state', function ($q) use ($state_id) {
                    $q->where('id', $state_id);
                });
            }
        }
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
        $$request->validate( $model->validationRule(), $model->validationMessage());
        $model->fill($request->all());
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
    public function destroy(City $model)
    {
        return BaseResponse::success($model->delete());
    }
}
