<?php

namespace App\Models;

class Purchase extends Model
{
    protected $fillable = [
        "party_id",
        "created_by",
        "amount",
        'discount_amount',
        'discount_type',
        'net_total',
        "notes",
        'due_amount',
        'payment_method',
        'cash_amount',
        'online_amount',
        'transaction_id',
        'return_amount',
    ];


    protected $relations = [
        'createdBy',
        "party",
        "purchaseDetails"
    ];

    public function searchableColumns()
    {
        return [
            "party_id",
            "created_by",
            "amount",
            'discount_amount',
            'discount_type',
            'net_total',
            "notes",
            'due_amount',
            'payment_method',
            'cash_amount',
            'online_amount',
            'transaction_id',
            'return_amount',
        ];
    }

    public function getAllColumns()
    {
        return [
            'id' => 'int',
            'party_id' => 'int',
            'created_by' => 'int',
            'amount' => 'int',
            'discount_amount' => 'int',
            'discount_type' => 'text',
            'net_total' => 'int',
            'notes' => 'text',
            'due_amount' => 'int',
            'payment_method' => 'text',
            'cash_amount' => 'int',
            'online_amount' => 'int',
            'transaction_id' => 'text',
            'return_amount' => 'int',
            'deleted_at' => 'text',
            'created_at' => 'text',
            'updated_at' => 'text',
        ];
    }

    public function getDefaultColumns()
    {
        return [
            "id",
            "party_id",
            "created_by",
            "amount",
            'discount_amount',
            'discount_type',
            'net_total',
            "notes",
            'due_amount',
            'payment_method',
            'cash_amount',
            'online_amount',
            'transaction_id',
            'return_amount',
            'deleted_at',
            'created_at',
            'updated_at',
        ];
    }

    public function party()
    {
        return $this->belongsTo(Party::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function purchaseDetails()
    {
        return $this->hasMany(PurchaseDetail::class);
    }
}
