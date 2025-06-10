<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePurchaseRequest extends FormRequest
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
            'supplier_id' => 'required|integer',
            'amount' => 'required|numeric',
            'notes' => 'nullable|string|max:255',
            "purchaseDetails" => 'required|array',
            "purchaseDetails.*.product_id" => 'required|integer',
            "purchaseDetails.*.unit_id" => 'required|integer',
            "purchaseDetails.*.quantity" => 'required|numeric|min:0',
            "purchaseDetails.*.amount" => 'required|numeric',
        ];
    }
}
