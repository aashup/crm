<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePartyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:parties,name',
            'gstin' => 'nullable|string|max:15',
            'mobile' => 'nullable|string|max:15',
            'opening_balance' => 'nullable|numeric',
            'opening_balance_date' => 'nullable|date',
            'gst_type' => 'nullable|integer|in:1,2,3', // 1: Unregistered/Consumer, 2: Registered - Regular, 3: Registered - Composition
            'credit_limit' => 'boolean',
            'credit_limit_amount' => 'required_if:credit_limit,true|numeric',
            'billing_address' => 'required|string|max:500',
            'state_id' => 'nullable|exists:states,id',
            'email' => 'nullable|email|max:255',
        ];
    }
}
