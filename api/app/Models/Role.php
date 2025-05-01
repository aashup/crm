<?php

namespace App\Models;

use App\Traits\BaseModelTrait;
use Spatie\Permission\Models\Role as SpatieRole;



class Role extends SpatieRole
{
    use BaseModelTrait;


    protected $relations = ['permissions'];

    protected $fillable = [
        'name',
        'guard_name',
        'status',
    ];

    public function getAllColumns()
    {
        return ([
            'id' => 'int',
            'name' => 'text',
            'status' => 'text',
            'guard_name' => 'text',
            'created_at' => 'date',
            'updated_at' => 'date',
        ]);
    }

    public function getDefaultColumns()
    {
        return [
            'id',
            'name',
            'status',
            'guard_name',
            'created_at'
        ];
    }

    public function searchableColumns()
    {
        return [
            'name',
            'status',
            'guard_name'
        ];
    }
}
