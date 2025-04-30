<?php

namespace App\Services;

use App\Models\Role;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Hash;

class UserService
{
    /**
     * @param User $user
     * @return void
     */
    private $user;

    public function __construct(User $user)
    {
        $this->user = $user;
    }

    public function index(Request $request)
    {
        $props = [
            'page' => $request->get('page', 0),
            'pageSize' => $request->get('pageSize', 10),
            'cols' => $request->get('cols', []),
            'filter' => $request->get('filter', ''),
            'orderField' => $request->get('orderField', 'id'),
            'orderBy' => $request->get('orderBy', 'desc'),
            'with' => $request->get('with', [])
        ];
        $model = new User();
        $model = $model
            ->handleWith($props['with'])
            ->selectCols($props['cols'])
            ->applyFilter($props['filter'])
            ->sortOrder($props['orderField'], $props['orderBy'])
            ->getBuilder();
        return $model->paginate($props['pageSize'], ['*'], 'page', $props['page']);
    }

    public function store($data)
    {
        $data['password'] = Hash::make($data['password']);
        $this->user = $this->user->create($data);
        if (!empty($data['roles'])) {
            $this->user->syncRoles(Role::whereIn('id', $data['roles'])->get());
        }
        return $this->user;
    }

    public function update($id, $data)
    {
        $data = Arr::whereNotNull($data);
        if (Arr::has($data, 'password')) {
            $data['password'] = Hash::make($data['password']);
        }
        $this->user = $this->user->find($id);
        $this->user->update($data);
        $this->checkAndSyncRoles($data['roles'] ?? []);
        return $this->user;
    }

    public function destroy(Request $request)
    {
        try {
            return $this->user->find($request->user)->delete();
        } catch (Exception $e) {
            return $e;
        }
    }

    public function show($user)
    {
        return $this->user->with('roles.permissions')->find($user);
    }

    protected function checkAndSyncRoles($roles = [])
    {
        $roles = Role::whereIn('id', $roles)->get();
        if (!$this->user->hasExactRoles($roles)) {
            $this->user->syncRoles($roles);
        }
        return;
    }
}
