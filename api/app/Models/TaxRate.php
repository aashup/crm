<?php

namespace App\Models;

class TaxRate extends Model
{
    protected $fillable = [
        'rate',
        'type',
        'is_active',
    ];


    public function getAllColumns()
    {
        return ([
            'id' => 'int',
            'rate' => 'decimal:2',
            'type' => 'tinyInteger',
            'is_active' => 'boolean',
            'created_at' => 'date',
            'updated_at' => 'date',
        ]);
    }

    public function getDefaultColumns()
    {
        return [
            'id',
            'rate',
            'type',
            'is_active',
            'created_at'
        ];
    }

    public function searchableColumns()
    {
        return [
            'id',
            'rate',
            'type',
            'is_active',
            'created_at',
            'updated_at',
        ];
    }
}
