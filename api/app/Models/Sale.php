<?php

namespace App\Models;



class Sale extends Model
{

    protected $fillable = [
        'contact_id',
        'unit_id',
        'created_by',
        'amount',
        'discount_amount',
        'discount_type',
        'net_total',
        'notes',
        'created_at',
        'updated_at',
        'deleted_at',
        'status'
    ];

    protected $relations = [
        "contact",
        "unit",
        "saleDetails",
        'createdBy'
    ];

    public function searchableColumns()
    {
        return [
            'id',
            'contact_id',
            'unit_id',
            'created_by',
            'amount',
            'discount_amount',
            'discount_type',
            'net_total',
            'notes',
            'created_at',
            'updated_at',
            'deleted_at',
            'status'
        ];
    }

    public function getAllColumns()
    {
        return [
            'id' => 'int',
            'contact_id' => 'int',
            'unit_id' => 'int',
            'created_by' => 'int',
            'amount' => 'int',
            'discount_amount' => 'int',
            'discount_type' => 'int',
            'net_total' => 'int',
            'notes' => 'text',
            'status' => 'int',
            'created_at' => 'text',
            'updated_at' => 'text',
        ];
    }

    public function getDefaultColumns()
    {
        return [
            'id',
            'contact_id',
            'unit_id',
            'created_by',
            'amount',
            'discount_amount',
            'discount_type',
            'net_total',
            'notes',
            'status',
            'created_at',
            'updated_at',
            'deleted_at',
        ];
    }

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function saleDetails()
    {
        return $this->hasMany(SaleDetail::class);
    }
}
