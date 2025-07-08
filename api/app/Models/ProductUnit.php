<?php

namespace App\Models;


class ProductUnit extends Model
{
    protected $table = 'product_has_unit';

    protected $fillable = [
        'product_id',
        'unit_id',
        'sale_price',
        'purchase_price',
        'notes',
        'status',
    ];

    protected $relations = [];

    public function searchableColumns()
    {
        return [
            'product_id',
            'unit_id',
            'sale_price',
            'purchase_price',
            'notes',
            'status',
        ];
    }

    public function getAllColumns()
    {
        return [
            'product_id' => 'int',
            'unit_id' => 'int',
            'sale_price' => 'int',
            'purchase_price' => 'int',
            'notes' => 'text',

            'id' => 'int',
            'status' => 'int',
            'created_at' => 'text',
            'updated_at' => 'text',
        ];
    }

    public function getDefaultColumns()
    {
        return [
            'id',
            'product_id',
            'unit_id',
            'sale_price',
            'purchase_price',
            'notes',
            'created_at',
            'updated_at',
            'deleted_at',
            'status',
        ];
    }

    public function validationRule()
    {
        return [
            'product_id' => '',
            'unit_id' => '',
            'sale_price' => '',
            'purchase_price' => '',
            'notes' => '',
            'status' => '',
        ];
    }

    public function validationMessage()
    {
        return [
            'name' => 'Name is required field',
        ];
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

}
