<?php

namespace App\Models;

class PurchaseDetail extends Model
{
    protected $fillable = [
        "purchase_id",
        "product_id",
        "unit_id",
        "amount",
    ];


    protected $relations = [
        'product',
        "purchase",
        "unit",
    ];

    public function searchableColumns()
    {
        return [
            "purchase_id",
            "product_id",
            "unit_id",
            "amount",
        ];
    }

    public function getAllColumns()
    {
        return [
            'id' => 'int',
            'purchase_id' => 'int',
            'product_id' => 'int',
            'unit_id' => 'int',
            'amount' => 'int',
            'created_at' => 'text',
            'updated_at' => 'text',
        ];
    }

    public function getDefaultColumns()
    {
        return [
            "id",
            "purchase_id",
            "product_id",
            "unit_id",
            "amount",
            'created_at',
            'updated_at',
        ];
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function purchase()
    {
        return $this->belongsTo(Purchase::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }
}
