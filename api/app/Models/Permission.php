<?php

namespace App\Models;


class Permission extends Model
{
    protected $table = 'permissions';

    protected $fillable = [
        'name',
        'slug',
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
            'name' => 'string',
            'slug' => 'string',
            'status' => 'int',
        ];
    }

    public function getDefaultColumns()
    {
        return [
            'id',
            'name',
            'slug',
            'status',
        ];
    }

    public function validationRule()
    {
        return [
            'name' => 'required',
            'slug' => 'required',
        ];
    }

    public function validationMessage()
    {
        return [
            'name' => 'Name is required field',
            'slug' => 'Slug is required field',
        ];
    }

}
