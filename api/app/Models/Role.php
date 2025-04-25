<?php

namespace App\Models;



class Role extends Model
{
    protected $fillable = [
        'name',
        'status',
    ];

    protected $relations = [

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
            'name' => 'text',
            'status' => 'int',
            'created_at' => 'text',
            'updated_at' => 'text',
        ];
    }

    public function getDefaultColumns()
    {
        return [
            'id',
            'name',
            'status',
            'created_at',
            'updated_at',
        ];
    }
}
