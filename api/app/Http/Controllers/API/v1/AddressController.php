<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAddressRequest;
use App\Http\Requests\UpdateAddressRequest;
use App\Models\Address;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Address::class);

        $pageSize = null;
        if (intval($request->pageSize)) {
            $pageSize = intval($request->get('pageSize', 1000));
        }
        $model = new Address();
        $model = $model->handleWith($request->with)->selectCols($request->get('cols'))
            ->applyFilter($request->get('filter'))->sortOrder($request->orderField, $request->orderBy)->getBuilder();

        return $model->paginate($pageSize, ['*'], 'page', $request->page);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAddressRequest $request)
    {
        $this->authorize('create', Address::class);

        $model = new Address();
        $model->fill($request->all());
        $model->save();

        return $this->success("Address created successfully!", $model);
    }

    /**
     * Display the specified resource.
     */
    public function show(Address $address, Request $request)
    {
        $this->authorize('view', Address::class);

        $address->load($address->getWith($request->with));

        return $this->success("", $address);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Address $address)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAddressRequest $request, Address $address)
    {
        $this->authorize('update', $address);

        $model = $address;
        $model->fill($request->all());
        $model->save();

        return $this->success("Address updated successfully!", $model);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Address $address)
    {
        $this->authorize('delete', $address);

        try {
            return $this->success("Permission deleted successfully!", $address->delete());
        } catch (\Exception $e) {
            return $this->error("Address cannot be deleted! : " . $e->getMessage(), 500);
        }
    }
}
