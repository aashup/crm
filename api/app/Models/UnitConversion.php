<?php

namespace App\Models;

use App\Traits\BaseModelTrait;
use Illuminate\Database\Eloquent\Model;

class UnitConversion extends Model
{
    use BaseModelTrait;


    protected $relations = ["product", "fromUnit", "toUnit"];

    protected $fillable = [
        'product_id',
        'from_unit_id',
        'to_unit_id',
        'conversion_factor',
        'description',
        'status',
    ];

    public function getAllColumns()
    {
        return ([
            'id' => 'int',
            'product_id' => 'int',
            'from_unit_id' => 'int',
            'to_unit_id' => 'int',
            'conversion_factor' => 'text',
            'description' => 'text',
            'status' => 'int',
            'created_at' => 'date',
            'updated_at' => 'date',
        ]);
    }

    public function getDefaultColumns()
    {
        return [
            'id',
            'product_id',
            'from_unit_id',
            'to_unit_id',
            'conversion_factor',
            'description',
            'status',
            'created_at'
        ];
    }

    public function searchableColumns()
    {
        return [
            'id',
            'product_id',
            'from_unit_id',
            'to_unit_id',
            'conversion_factor',
            'description',
            'status',
        ];
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function fromUnit()
    {
        return $this->belongsTo(Unit::class, 'from_unit_id');
    }

    public function toUnit()
    {
        return $this->belongsTo(Unit::class, 'to_unit_id');
    }
}
