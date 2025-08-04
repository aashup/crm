<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes, HasFactory;
    protected $table = 'products';

    protected $fillable = [
        'name',
        'hsn',
        'item_code',
        'slug',
        'type',
        'status',
        'created_by'
    ];

    protected $relations = [
        'units'
    ];

    public function searchableColumns()
    {
        return [
            'name',
            'hsn',
            'item_code',
            'slug',
            'type',
            'status',
        ];
    }

    public function getAllColumns()
    {
        return [
            'id' => 'int',
            'name' => 'text',
            'hsn' => 'text',
            'item_code' => 'text',
            'slug' => 'text',
            'status' => 'int',
            'type' => 'int',
            'created_at' => 'text',
            'updated_at' => 'text',
        ];
    }

    public function getDefaultColumns()
    {
        return [
            'id',
            'name',
            'hsn',
            'item_code',
            'status',
            'slug',
            'type',
            'created_at',
            'updated_at',
        ];
    }

    public function validationRule()
    {
        return [
            'name' => 'required',
            'slug' => '',
            'type' => '',
            'status' => '',
        ];
    }

    public function validationMessage()
    {
        return [
            'name' => 'Name is required field',
            'slug' => 'Contry is required field',
        ];
    }

    public function units()
    {
        return $this->hasMany(ProductUnit::class, 'product_id');
    }

    public function productUnit()
    {
        return $this->hasMany(ProductUnit::class, 'product_id', 'id');
    }
}
