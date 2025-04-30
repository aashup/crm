<?php

namespace App\Models;

use App\Traits\BaseModelTrait;
use Spatie\Permission\Models\Permission as SpatiePermission;


class Permission extends SpatiePermission
{
    use BaseModelTrait;

    protected $relations = ['menu'];
    protected $with = ['menu'];

    public function getAllColumns()
    {
        return ([
            'id' => 'int',
            'name' => 'text',
            'description' => 'text',
            'guard_name' => 'text',
            'menu_id' => 'int',
            'created_at' => 'date',
            'updated_at' => 'date',
        ]);
    }

    public function getDefaultColumns()
    {
        return [
            'id',
            'name',
            'description',
            'guard_name',
            'menu_id',
            'created_at',
            'updated_at',
        ];
    }

    public function searchableColumns()
    {
        return [
            'name',
            'description',
            'guard_name'
        ];
    }

    public function menu()
    {
        return $this->belongsTo(Menu::class, 'menu_id', 'id');
    }
}
