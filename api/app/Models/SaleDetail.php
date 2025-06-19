<?php

namespace App\Models;



class SaleDetail extends Model
{
    protected $fillable = [
        'sale_id',
        'product_id',
        'unit_id',
        'amount',
        'quantity',
        'discount_amount',
        'discount_type',
        'net',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected $relations = [
        "sale",
        "product",
        "unit",
    ];

    public function searchableColumns()
    {
        return [
            'id',
            'sale_id',
            'product_id',
            'unit_id',
            'amount',
            'discount_amount',
            'discount_type',
            'net',
            'created_at',
            'updated_at',
            'deleted_at',
        ];
    }

    public function getAllColumns()
    {
        return [
            'id' => 'int',
            'sale_id' => 'int',
            'product_id' => 'int',
            'unit_id' => 'int',
            'amount' => 'int',
            'discount_amount' => 'int',
            'discount_type' => 'int',
            'net' => 'int',
            'created_at' => 'text',
            'updated_at' => 'text',
        ];
    }

    public function getDefaultColumns()
    {
        return [
            'id',
            'sale_id',
            'product_id',
            'unit_id',
            'amount',
            'discount_amount',
            'discount_type',
            'net',
            'created_at',
            'updated_at',
            'deleted_at',
        ];
    }

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }
}
