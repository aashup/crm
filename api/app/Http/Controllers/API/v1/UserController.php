<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    /* @var UserService */
    protected $userService;

    /**
     * Create a new controller instance.
     *
     * @param UserService $userService
     * @return void
     */

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        // return $request->get('filter', '');
        // $this->authorize('viewAny', User::class);
        return $this->userService->index($request);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \App\Http\Requests\StoreUserRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreUserRequest $request)
    {
        // $this->authorize('create', User::class);
        try {
            DB::beginTransaction();
            $this->userService->store($request->validated());
            return $this->success('User Created Successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error($e->getMessage());
        } finally {
            DB::commit();
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $user
     * @return \Illuminate\Http\Response
     */
    public function show($user)
    {
        // $this->authorize('show', User::class);
        $props = [
            'title' => 'Permission Details: #' . $user,
            'user' => $this->userService->show($user),
        ];
        return $this->success('', $props);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $user
     * @return \Illuminate\Http\Response
     */
    public function edit(User $user)
    {
        $this->authorize('update', $user);
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateUserRequest $request, $user)
    {
        // $this->authorize('update', User::class);
        try {
            DB::beginTransaction();
            $this->userService->update($user, $request->validated());
            return $this->success('User updated successfully !');
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error($e->getMessage());
        } finally {
            DB::commit();
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $user
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request)
    {
        // $this->authorize('delete', User::class);
        try {
            $this->userService->destroy($request);
            return $this->success('User Deleted successfully');
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }
}
