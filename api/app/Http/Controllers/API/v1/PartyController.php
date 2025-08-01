<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\API\BaseResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePartyRequest;
use App\Http\Requests\UpdatePartyRequest;
use App\Models\Contact;
use App\Models\Party;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

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

        try {

            DB::beginTransaction();

            $validated = $request->validated();

            if (!$validated['contact_id']) {
                $contactExists = Contact::where('mob1', $validated['name'])->orWhere('name', $validated['mobile'])->exists();
                if ($contactExists) {
                    return $this->error("Contact with this mobile or name already exists");
                }
                $contact = Contact::create([
                    'name' => $validated['name'],
                    'mob1' => $validated['mobile'],
                    'status' => 1,
                    'created_by' => Auth::id(),
                ]);
                $validated['contact_id'] = $contact->id;
            }

            $model = new Party();
            $model->fill($validated);
            $model->save();

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error("Party cannot be created! : " . $e->getMessage(), 500);
        }


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

        try {
            DB::beginTransaction();
            $validated = $request->validated();

            $party->fill($validated);
            $party->save();
        } catch (\Exception $e) {
            return $this->error("Party cannot be updated! : " . $e->getMessage(), 500);
        }



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
