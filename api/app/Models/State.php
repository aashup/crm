<?php

namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;

class State extends Model
{
    use SoftDeletes;
    protected $table = 'states';

    protected $fillable = [
        'name',
        'country_id',
        'status',
    ];

    protected $relations = [
        'country'
    ];

    public function searchableColumns()
    {
        return [
            'name',
            'status',
            'country_id',
        ];
    }

    public function getAllColumns()
    {
        return [
            'id' => 'int',
            'name' => 'text',
            'status' => 'int',
            'country_id' => 'int',
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
            'country_id',
            'created_at',
            'updated_at',
        ];
    }

    public function validationRule()
    {
        return [
            'name' => 'required',
            'country_id' => 'required',
            'created_at' => '',
            'updated_at' => '',
        ];
    }

    public function validationMessage()
    {
        return [
            'name' => 'Name is required field',
            'country_id' => 'Contry is required field',
        ];
    }

    public function city()
    {
        return $this->hasMany(\App\Models\City::class, 'city_id', 'id');
    }

    public function country()
    {
        return $this->belongsTo(\App\Models\Country::class, 'country_id', 'id');
    }
}
