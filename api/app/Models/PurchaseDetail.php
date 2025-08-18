<?php

namespace App\Models;

class PurchaseDetail extends Model
{
    protected $fillable = [
        "purchase_id",
        "product_id",
        "unit_id",
        'quantity',
        'rate',
        'discount_amount',
        'discount_type',
        'tax_amount',
        'tax_rate',
        'with_tax',
        'net',
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
            'quantity',
            'rate',
            'discount_amount',
            'discount_type',
            'tax_amount',
            'tax_rate',
            'with_tax',
            'net'
        ];
    }

    public function getAllColumns()
    {
        return [
            'id' => 'int',
            'purchase_id' => 'int',
            'product_id' => 'int',
            'unit_id' => 'int',
            'quantity' => 'int',
            'rate' => 'int',
            'discount_amount' => 'int',
            'discount_type' => 'int',
            'tax_amount' => 'int',
            'tax_rate' => 'int',
            'with_tax' => 'int',
            'net' => 'int',
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
            'quantity',
            'rate',
            'discount_amount',
            'discount_type',
            'tax_amount',
            'tax_rate',
            'with_tax',
            'net',
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
