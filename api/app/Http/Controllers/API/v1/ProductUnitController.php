<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\API\BaseResponse;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductUnit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProductUnitController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request, Product $product)
    {
        $pageSize = null;
        if (intval($request->pageSize)) {
            $pageSize = intval($request->get('pageSize', 1000));
        }
        $model = new ProductUnit();
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
    public function store(Request $request, Product $product)
    {
        $model = new ProductUnit();
        $request->validate( $model->validationRule(), $model->validationMessage());
        $model->fill([
            ...$request->all(),
            'created_by' => Auth::id()
        ]);
        $model->save();

        return BaseResponse::success($model);
    }

    /**
     * Display the specified resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function show(ProductUnit $productUnit, Request $request, Product $product)
    {
        $productUnit->load($productUnit->getWith($request->with));

        return BaseResponse::success( $productUnit);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Models\ProductUnit  $model
     * @return \Illuminate\Http\Response
     *
     * @throws
     */
    public function update(Request $request, ProductUnit $productUnit, Product $product)
    {
        $model = $productUnit;
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
    public function destroy(ProductUnit $productUnit, Product $product)
    {
        return BaseResponse::success($productUnit->delete());
    }
}
