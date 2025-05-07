<?php

namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;

class Menu extends Model
{
    use SoftDeletes;
    protected $table = 'menus';

    protected $fillable = [
        'name',
        'root',
        'icon',
        'page',
        'parent_id',
        'order_by',
        'status',
    ];

    protected $relations = [
        'parent', "permissions"
    ];

    public function searchableColumns()
    {
        return [
            'name',
            'status',
        ];
    }

    public function getAllColumns()
    {
        return [
            'id' => 'int',
            'name' => 'string',
            'root' => 'int',
            'icon' => 'string',
            'page' => 'string',
            'parent_id' => 'int',
            'order_by' => 'int',
            'status' => 'int',
        ];
    }

    public function getDefaultColumns()
    {
        return [
            'id',
            'name',
            'root',
            'icon',
            'page',
            'parent_id',
            'order_by',
            'status',
        ];
    }

    public function validationRule()
    {
        return [
            'name' => 'required',
        ];
    }

    public function validationMessage()
    {
        return [
            'name' => 'Name is required field',
        ];
    }

    public function parent()
    {
        return $this->belongsTo(\App\Models\Menu::class, 'parent_id', 'id');
    }

    public function permissions()
    {
        return $this->hasMany(Permission::class);
    }

}
