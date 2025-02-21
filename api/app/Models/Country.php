<?php

namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;



class Country extends Model
{
    use SoftDeletes;
    protected $table = 'countries';

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

    public function validationRule()
    {
        return [
            'name' => 'required',
            'created_at' => '',
            'updated_at' => '',
        ];
    }

    public function validationMessage()
    {
        return [
            'name' => 'Name is required field',
        ];
    }

    public function state()
    {
        return $this->hasMany(\App\Models\State::class, 'country_id', 'id');
    }

    public function city()
    {
        return $this->belongsTo(\App\Models\City::class, 'city_id', 'id');
    }
}
