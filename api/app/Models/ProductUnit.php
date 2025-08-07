<?php

namespace App\Models;


class ProductUnit extends Model
{
    protected $table = 'product_has_unit';

    protected $fillable = [
        'product_id',
        'unit_id',
        'sale_price',
        'sale_price_tax_type', // 'sale_price_tax_type' can be 'with tax' or 'without tax'
        'sale_price_discount_amount',
        'sale_price_discount_type', // 'sale_price_discount_type' can be 'fixed' or 'percentage'
        'purchase_price',
        'purchase_price_tax_type', // 'purchase_price_tax_type' can be 'with tax' or 'without tax'
        'tax_rate',
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
            'sale_price_tax_type' => 'int', // 1 for with tax, 2 for without tax
            'sale_price_discount_amount' => 'decimal',
            'sale_price_discount_type' => 'int', // 1 for flat, 2 for percent
            'sale_price_tax_type' => 'string',
            'purchase_price' => 'int',
            'purchase_price_tax_type' => 'int', // 1 for with tax, 2 for without tax
            'tax_rate' => 'int',
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
            'sale_price_tax_type',
            'sale_price_discount_amount',
            'sale_price_discount_type',
            'purchase_price',
            'purchase_price_tax_type',
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
            'unit_id' => '',
            'sale_price' => '',
            'sale_price_tax_type' => 'required_if:sale_price,!=,0,|in:1,2', // 1 for with tax, 2 for without tax
            'sale_price_discount_amount' => '',
            'sale_price_discount_type' => 'required_if:sale_price_discount_amount,!=,0,|in:1,2', // 1 for flat, 2 for percent
            'purchase_price' => '',
            'purchase_price_tax_type' => 'required_if:purchase_price,!=,0,|in:1,2', // 1 for with tax, 2 for without tax
            'tax_rate' => '',
            'notes' => '',
            'status' => '',
        ];
    }

    public function validationMessage()
    {
        return [
            'sale_price_tax_type.required_if' => 'Sale price tax type is required when sale price is not zero.',
            'sale_price_tax_type.in' => 'Sale price tax type must be either 1 (with tax) or 2 (without tax).',
            'sale_price_discount_type.required_if' => 'Sale price discount type is required when sale price discount amount is not zero.',
            'sale_price_discount_type.in' => 'Sale price discount type must be either 1 (flat) or 2 (percent).',
            'purchase_price_tax_type.required_if' => 'Purchase price tax type is required when purchase price is not zero.',
            'purchase_price_tax_type.in' => 'Purchase price tax type must be either 1 (with tax) or 2 (without tax).',
        ];
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

}
