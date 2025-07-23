<?php

namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Validation\Rule;

class Expense extends Model
{
    use SoftDeletes;
    protected $table = 'expense_record';

    protected $fillable = [
        'expense_type',
        'amount',
        'note',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected $relations = [];

    public function searchableColumns()
    {
        return [
            'id',
            'expense_type',
            'amount',
            'note',
            'created_at',
            'updated_at',
            'deleted_at',
        ];
    }

    public function getAllColumns()
    {
        return [
            'id' => 'int',
            'expense_type' => 'text',
            'amount' => 'text',
            'note' => 'text',
            'created_at' => 'text',
            'updated_at' => 'text',
        ];
    }

    public function getDefaultColumns()
    {
        return [
            'id',
            'expense_type',
            'amount',
            'note',
            'created_at',
            'updated_at',
            'deleted_at',
        ];
    }

    public function validationRule()
    {
        return [
            'id' => '',
            'expense_type' => ['required', Rule::in(['expense', 'gain'])],
            'amount' => 'required',
            'note' => 'required',
        ];
    }

    public function validationMessage()
    {
        return [
            'expense_type' => 'Expense Type is required field',
            'expense_type.in' => 'Expense Type must be either "expense" or "gain".',
            'amount' => 'Amount is required field',
            'note' => 'Note is required field',
        ];
    }

}
