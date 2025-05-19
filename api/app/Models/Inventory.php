<?php

namespace App\Models;

class Inventory extends Model
{
    protected $fillable = [
        "product_id",
        "unit_id",
        "qty",
        "rem_qty",
        "purchase_price",
        "sale_price",
        "created_by",
        "notes",
        "status",
    ];


    protected $relations = [
        'product',
        "unit"
    ];

    public function searchableColumns()
    {
        return [
            "product_id",
            "unit_id",
            "created_by",
            "qty",
            "rem_qty",
            "purchase_price",
            "sale_price",
            "notes",
            "status",
        ];
    }

    public function getAllColumns()
    {
        return [
            'id' => 'int',
            'product_id' => 'int',
            'unit_id' => 'int',
            'created_by' => 'int',
            'qty' => 'int',
            'rem_qty' => 'int',
            'purchase_price' => 'int',
            'sale_price' => 'int',
            'notes' => 'text',
            'status' => 'int',
            'created_at' => 'text',
            'updated_at' => 'text',
        ];
    }

    public function getDefaultColumns()
    {
        return [
            "id",
            "product_id",
            "unit_id",
            "created_by",
            "qty",
            "rem_qty",
            "purchase_price",
            "sale_price",
            "notes",
            "status",
            'created_at',
            'updated_at',
        ];
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
