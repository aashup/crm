<?php

namespace App\Models;

class Address extends Model
{
    protected $fillable = [
        "id",
        "address",
        "pin",
        "mob1",
        "mob2",
        "type",
        "city_id",
        "status",
        "created_by",
    ];


    protected $relations = [
        'vendor', "city", "createdBy"
    ];

    public function searchableColumns()
    {
        return [
            "address",
            "pin",
            "mob1",
            "mob2",
            "type",
            "city_id",
            "status",
            "created_by",
        ];
    }

    public function getAllColumns()
    {
        return [
            'id' => 'int',
            'address' => 'text',
            'pin' => 'text',
            'mob1' => 'text',
            'mob2' => 'text',
            'status' => 'int',
            'type' => 'int',
            'city_id' => 'int',
            'created_by' => 'int',
            'created_at' => 'text',
            'updated_at' => 'text',
        ];
    }

    public function getDefaultColumns()
    {
        return [
            "id",
            "address",
            "pin",
            "mob1",
            "mob2",
            "type",
            "city_id",
            "status",
            "created_by",
            'created_at',
            'updated_at',
        ];
    }

    public function vendor()
    {
        return $this->hasMany(Vendor::class);
    }

    public function city()
    {
        return $this->belongsTo(City::class);
    }
    
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
