<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\API\BaseResponse;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductUnit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ProductUnitController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request, Product $product)
    {
        $product->load('units.unit');
        return BaseResponse::success($product->units);
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
        return BaseResponse::success($product->units()->create($request->all()));
    }

    /**
     * Display the specified resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function show(ProductUnit $productUnit, Request $request, Product $product)
    {
        $productUnit->load($productUnit->getWith($request->with));

        return BaseResponse::success($productUnit);
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
        $request->validate($model->validationRule(), $model->validationMessage());
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
    public function destroy($productId, $unitId)
    {
        $deleted = DB::table('product_has_unit')
            ->where('product_id', $productId)
            ->where('unit_id', $unitId)
            ->delete();

        if (!$deleted) {
            return response()->json(['message' => 'Unit not found for this product.'], 404);
        }

        return response()->json(['message' => 'Unit removed from product successfully.']);
    }
}
