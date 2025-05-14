<?php

namespace App\Models;

class Customer extends Model
{
    protected $fillable = [
        "id",
        "name",
        "contact_id",
        "address_id",
    ];


    protected $relations = [
        'contact',
        "address"
    ];

    public function searchableColumns()
    {
        return [
            "name",
            "contact_id",
            "address_id",
        ];
    }

    public function getAllColumns()
    {
        return [
            'id' => 'int',
            'name' => 'text',
            'contact_id' => 'int',
            'address_id' => 'int',
            'created_at' => 'text',
            'updated_at' => 'text',
        ];
    }

    public function getDefaultColumns()
    {
        return [
            "id",
            "name",
            "contact_id",
            "address_id",
            'created_at',
            'updated_at',
        ];
    }

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }

    public function address()
    {
        return $this->belongsTo(Address::class);
    }
}
