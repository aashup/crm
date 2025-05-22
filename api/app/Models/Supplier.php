<?php

namespace App\Models;


class Supplier extends Model
{
    protected $fillable = [
        "contact_id",
        "name",
        "gst",
        "billing_address_id",
        "shipping_address_id",
        "notes",
        "type",
        "level",
        "status"
    ];


    protected $relations = [
        'contact',
        "BillingAddress",
        "ShippingAddress",
    ];

    public function searchableColumns()
    {
        return [
            "contact_id",
            "name",
            "gst",
            "billing_address_id",
            "shipping_address_id",
            "notes",
            "type",
            "level",
            "status"
        ];
    }

    public function getAllColumns()
    {
        return [
            'id' => 'int',
            'name' => 'text',
            'contact_id' => 'int',
            'billing_address_id' => 'int',
            'shipping_address_id' => 'int',
            'type' => 'int',
            'level' => 'int',
            'status' => 'int',
            'created_at' => 'text',
            'updated_at' => 'text',
        ];
    }

    public function getDefaultColumns()
    {
        return [
            "id",
            "contact_id",
            "name",
            "gst",
            "billing_address_id",
            "shipping_address_id",
            "notes",
            "type",
            "level",
            "status",
            'created_at',
            'updated_at',
        ];
    }

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }

    public function billingAddress()
    {
        return $this->belongsTo(Address::class, "billing_address_id");
    }

    public function shippingAddress()
    {
        return $this->belongsTo(Address::class, "shipping_address_id");
    }
}
