<?php

namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;

class Party extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'contact_id',
        'name',
        'mobile',
        'gstin',
        'opening_balance',
        'opening_balance_date',
        'gst_type',
        'credit_limit',
        'credit_limit_amount',
        'billing_address_id',
        'shipping_address_id',
        'state_id',
        'email',
    ];

    protected $relations = [
        'state', 'contact', 'billingAddress', 'shippingAddress'
    ];

    public function searchableColumns()
    {
        return [
            'gstin',
            'email',
            'billing_address_id',
            'shipping_address_id',
            'state_id',
        ];
    }

    public function getAllColumns()
    {
        return [
            'id' => 'int',
            'gstin' => 'string',
            'contact_id' => 'int',
            'name' => 'string',
            'mobile' => 'string',
            'opening_balance' => 'string',
            'opening_balance_date' => 'string',
            'gst_type' => 'int',
            'credit_limit' => 'boolean',
            'credit_limit_amount' => 'string',
            'billing_address_id' => 'int',
            'shipping_address_id' => 'int',
            'state_id' => 'int',
            'email' => 'string',
            'created_at' => 'string',
            'updated_at' => 'string',
        ];
    }

    public function getDefaultColumns()
    {
        return [
            'id',
            'contact_id',
            'name',
            'mobile',
            'gstin',
            'opening_balance',
            'opening_balance_date',
            'gst_type',
            'credit_limit',
            'credit_limit_amount',
            'billing_address_id',
            'shipping_address_id',
            'state_id',
            'email',
            'created_at',
            'updated_at',
        ];
    }

    public function state()
    {
        return $this->belongsTo(State::class);
    }

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }

    public function billingAddress()
    {
        return $this->belongsTo(Address::class, 'billing_address_id');
    }

    public function shippingAddress()
    {
        return $this->belongsTo(Address::class, 'shipping_address_id');
    }
}
