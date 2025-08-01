<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePartyRequest extends FormRequest
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
            'contact_id' => ['nullable', 'exists:contacts,id'],
            'name' => ['required_without:contact_id', 'string', 'max:255'],
            'mobile' => ['required_without:contact_id', 'string', 'max:20', 'regex:/^\+[0-9\s\-\(\)\.]{7,20}$/'],
            'gstin' => 'nullable|string|max:15',
            'opening_balance' => 'nullable|numeric',
            'opening_balance_date' => 'nullable|date',
            'gst_type' => 'nullable|integer|in:1,2,3', // 1: Unregistered/Consumer, 2: Registered - Regular, 3: Registered - Composition
            'credit_limit' => 'boolean',
            'credit_limit_amount' => 'required_if:credit_limit,true|numeric',
            'billing_address_id' => 'required|exists:addresses,id',
            'shipping_address_id' => 'nullable|exists:addresses,id',
            'state_id' => 'nullable|exists:states,id',
            'email' => 'nullable|email|max:255',
        ];
    }
}
