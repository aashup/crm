<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\API\BaseResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePartyRequest;
use App\Http\Requests\UpdatePartyRequest;
use App\Models\Party;
use Illuminate\Http\Request;

class PartyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Party::class);

        $pageSize = null;
        if (intval($request->pageSize)) {
            $pageSize = intval($request->get('pageSize', 1000));
        }
        $model = new Party();
        $model = $model->handleWith($request->with)->selectCols($request->get('cols'))
            ->applyFilter($request->get('filter'))->sortOrder($request->orderField, $request->orderBy)->getBuilder();

        return $model->paginate($pageSize, ['*'], 'page', $request->page);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePartyRequest $request)
    {
        $this->authorize('create', Party::class);

        $model = new Party();
        $model->fill($request->all());
        $model->save();

        return $this->success("Party created successfully!", $model);
    }

    /**
     * Display the specified resource.
     */
    public function show(Party $party, Request $request)
    {
        $this->authorize('view', $party);

        $party->load($party->getWith($request->with));

        return $this->success("fetched successfully!", $party);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePartyRequest $request, Party $party)
    {
        $this->authorize('update', $party);

        $party->fill($request->all());
        $party->save();

        return $this->success("Party updated successfully!", $party);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Party $party)
    {
        $this->authorize('delete', $party);

        try {
            return $this->success("Party deleted successfully!", $party->delete());
        } catch (\Exception $e) {
            return $this->error("Party cannot be deleted! : " . $e->getMessage(), 500);
        }
    }
}
