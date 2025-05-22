<?php

namespace App\Models;

class Purchase extends Model
{
    protected $fillable = [
        "contact_id",
        "unit_id",
        "supplier_id",
        "created_by",
        "amount",
        "notes",
    ];


    protected $relations = [
        'createdBy',
        "unit",
        "contact",
        "supplier",
        "purchaseDetails"
    ];

    public function searchableColumns()
    {
        return [
            "contact_id",
            "unit_id",
            "supplier_id",
            "created_by",
            "amount",
            "notes",
        ];
    }

    public function getAllColumns()
    {
        return [
            'id' => 'int',
            'contact_id' => 'int',
            'unit_id' => 'int',
            'supplier_id' => 'int',
            'created_by' => 'int',
            'amount' => 'int',
            'notes' => 'text',
            'created_at' => 'text',
            'updated_at' => 'text',
        ];
    }

    public function getDefaultColumns()
    {
        return [
            "id",
            "contact_id",
            "unit_id",
            "supplier_id",
            "created_by",
            "amount",
            "notes",
            'created_at',
            'updated_at',
        ];
    }

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function purchaseDetails()
    {
        return $this->hasMany(PurchaseDetail::class);
    }
}
