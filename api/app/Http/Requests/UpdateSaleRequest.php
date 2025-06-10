<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSaleRequest extends FormRequest
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
            'contact_id' => 'required|integer',
            'unit_id' => 'required|integer',
            'amount' => 'required|numeric',
            'discount_amount' => 'nullable|numeric',
            'discount_type' => 'nullable|integer|in:1,2', // Assuming 1 for flat and 2 for percentage amount
            'net_total' => 'required|numeric',
            'notes' => 'nullable|string|max:255',
            'status' => 'required|integer|in:1,2', // Assuming 1: active, 2: inactive
            'saleDetails' => 'required|array',
            'saleDetails.*.product_id' => 'required|integer',
            'saleDetails.*.unit_id' => 'required|integer',
            'saleDetails.*.quantity' => 'required|numeric|min:0',
            'saleDetails.*.amount' => 'required|numeric',
            'saleDetails.*.discount_amount' => 'nullable|numeric',
            'saleDetails.*.discount_type' => 'nullable|integer|in:1,2', // Assuming 1 for flat and 2 for percentage amount
            'saleDetails.*.net' => 'required|numeric',
        ];
    }
}
