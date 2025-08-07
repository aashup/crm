<?php

namespace App\Models;


class Voucher extends Model
{
    protected $fillable = [
        'party_id',
        'voucher_type',
        'notes',
        'txn_type',
        'reference_model',
        'reference_id',
        'amount',
        'opening_ts',
    ];

    protected $relations = [
        "party",
    ];

    public function searchableColumns()
    {
        return [
            'id',
            'party_id',
            'voucher_type',
            'notes',
            'txn_type',
            'reference_model',
            'reference_id',
            'amount',
            'opening_ts'
        ];
    }

    public function getAllColumns()
    {
        return [
            'id' => 'int',
            'party_id' => 'int',
            'voucher_type' => 'int',
            'notes' => 'string',
            'txn_type' => 'string',
            'reference_model' => 'string',
            'reference_id' => 'int',
            'amount' => 'decimal',
            'opening_ts' => 'datetime',
            'created_at' => 'string',
            'updated_at' => 'string',
        ];
    }

    public function getDefaultColumns()
    {
        return [
            'id',
            'party_id',
            'voucher_type',
            'notes',
            'txn_type',
            'reference_model',
            'reference_id',
            'amount',
            'opening_ts',
            'created_at',
            'updated_at',
        ];
    }

    public function party()
    {
        return $this->belongsTo(Party::class, 'party_id');
    }

    public function reference()
    {
        return $this->morphTo(null, 'reference_model', 'reference_id');
    }
}
