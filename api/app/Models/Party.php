<?php

namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;

class Party extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'gstin',
        'mobile',
        'opening_balance',
        'opening_balance_date',
        'credit_limit',
        'credit_limit_amount',
        'billing_address',
        'state_id',
        'email',
    ];

    protected $relations = [
        'state'
    ];

    public function searchableColumns()
    {
        return [
            'name',
            'gstin',
            'mobile',
            'email',
            'billing_address',
        ];
    }

    public function getAllColumns()
    {
        return [
            'id' => 'int',
            'name' => 'string',
            'gstin' => 'string',
            'mobile' => 'string',
            'opening_balance' => 'string',
            'opening_balance_date' => 'string',
            'credit_limit' => 'boolean',
            'credit_limit_amount' => 'string',
            'billing_address' => 'string',
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
            'name',
            'gstin',
            'mobile',
            'opening_balance',
            'opening_balance_date',
            'credit_limit',
            'credit_limit_amount',
            'billing_address',
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
}
