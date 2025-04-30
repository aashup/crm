<?php
namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\API\BaseResponse;
use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\Country;
use App\Models\Role;
use App\Models\State;
use Illuminate\Support\Str;

class FindController extends Controller
{


    public function handler($type)
    {
        if (is_callable([$this, Str::camel($type)])) {
            return $this->{Str::camel($type)}();
        }

        return BaseResponse::error('Not found', 404);
    }

    public function city()
    {
        $model = new City();
        $model = $model->select('id', 'name', 'state_id', 'country_id')->where('status', 1);
        if (request()->has('state_id') && intval(request('state_id'))) {
            $model = $model->where('state_id', intval(request('state_id')));
        }

        return BaseResponse::success($model->orderBy('name')->limit(2000)->get());
    }

    public function state()
    {
        $model = new State();
        $model = $model->select('id', 'name', 'country_id')->where('status', 1);
        if (request()->has('country_id') && intval(request('country_id'))) {
            $model = $model->where('country_id', +request('country_id'));
        }

        return BaseResponse::success($model->orderBy('name')->limit(1000)->get());
    }

    public function country()
    {
        $model = new Country();
        $model = $model->select('id', 'name')->where('status', operator: 1);

        return BaseResponse::success($model->orderBy('name', 'desc')->limit(250)->get());
    }

    public function role()
    {
        $model = new Role();
        $model = $model->select('id', 'name');

        return BaseResponse::success($model->orderBy('name', 'desc')->limit(250)->get());
    }

}

?>