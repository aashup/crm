<?php

namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;

class City extends Model
{
    use SoftDeletes;

    protected $table = 'cities';

    protected $fillable = [
        'name',
        'status',
        'state_id',
        'country_id',
    ];

    protected $relations = [
        'state',
        'country',
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
            'state_id' => 'int',
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
            'state_id',
            'country_id',
            'created_at',
            'updated_at',
        ];
    }

    public function validationRule()
    {
        return [
            'id' => '',
            'name' => 'required',
            'state_id' => ['required','exists:App\Models\State,id'],
            'country_id' => ['required','exists:App\Models\Country,id'],
            'created_at' => '',
            'updated_at' => '',
        ];
    }

    public function validationMessage()
    {
        return [
            'name' => 'Name is required field',
            'state_id' => 'State is required field',
            'country_id' => 'Country is required field',
        ];
    }

    public function state()
    {
        return $this->belongsTo(\App\Models\State::class, 'state_id', 'id');
    }

    public function country()
    {
        return $this->belongsTo(\App\Models\Country::class, 'country_id', 'id');
    }
}
