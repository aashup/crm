<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Contact extends Model
{
    use SoftDeletes, HasFactory;

    protected $fillable = [
        'id',
        'name',
        'mob1',
        'mob2',
        'status',
        'created_by',
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    protected $relations = [
        'createdBy',
    ];

    public function searchableColumns()
    {
        return [
            'id',
            'name',
            'mob1',
            'mob2',
            'status',
            'created_by',
        ];
    }

    public function getAllColumns()
    {
        return [
            'id' => 'int',
            'name' => 'text',
            'mob1' => 'text',
            'mob2' => 'text',
            'status' => 'int',
            'created_by' => 'int',
            'created_at' => 'text',
            'updated_at' => 'text',
        ];
    }

    public function getDefaultColumns()
    {
        return [
            'id',
            'name',
            'mob1',
            'mob2',
            'status',
            'created_by',
            'created_at',
            'updated_at',
        ];
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
