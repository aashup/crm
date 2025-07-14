<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreInventoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'contact_id' => ['nullable', 'exists:contacts,id'],
            'mobile' => ['required_without:contact_id', 'string', 'max:20', 'regex:/^\+[0-9]{7,15}$/'],
            'name' => ['required_without:contact_id', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0'],
            'discount_type' => ['nullable', 'in:1,2'], // 1 = fixed, 2 = percentage
            'discount_amount' => ['nullable', 'required_with:discount_type', 'numeric', 'min:0'],
            'net_total' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:500'],
            'status' => ['required', 'in:1,2'], // 1 = active, 2 = inactive

            'saleDetails' => ['required', 'array', 'min:1'],
            'saleDetails.*.product_id' => ['required', 'exists:products,id'],
            'saleDetails.*.unit_id' => ['required', 'exists:units,id'],
            'saleDetails.*.quantity' => ['required', 'numeric', 'min:1'],
            'saleDetails.*.amount' => ['required', 'numeric', 'min:0'],
            'saleDetails.*.discount_type' => ['nullable', 'in:1,2'],
            'saleDetails.*.discount_amount' => ['nullable', 'required_with:saleDetails.*.discount_type', 'numeric', 'min:0'],
            'saleDetails.*.net' => ['required', 'numeric', 'min:0'],
        ];
    }

    

    public function withValidator($validator)
    {
        $validator->after(function (Validator $validator) {
            $data = $this->all();

            $saleDetails = $data['saleDetails'] ?? [];

            $totalSaleAmount = collect($saleDetails)->sum('amount');

            if (isset($data['amount']) && $data['amount'] > $totalSaleAmount) {
                $validator->errors()->add('amount', 'The overall amount should not be greater than the total of sale item amounts.');
            }

            if (isset($data['net_total']) && isset($data['amount']) && $data['net_total'] > $data['amount']) {
                $validator->errors()->add('net_total', 'The net total cannot be greater than the amount.');
            }
        });
    }

    public function messages(): array
    {
        return [
            'mobile.required_without' => 'The mobile number is required when contact is not selected.',
            'mobile.regex' => 'The mobile number must be in the format: +[country code][number] (e.g., +1234567890).',
            'name.required_without' => 'The name is required when contact is not selected.',

            'discount_amount.required_with' => 'The discount amount is required when a discount type is selected.',
            'discount_amount.numeric' => 'The discount amount must be a number.',

            'status.in' => 'The selected status is invalid.',

            'saleDetails.required' => 'At least one sale item must be added.',
            'saleDetails.*.product_id.required' => 'Product is required for each sale item.',
            'saleDetails.*.product_id.exists' => 'Selected product does not exist.',
            'saleDetails.*.unit_id.required' => 'Unit is required for each sale item.',
            'saleDetails.*.unit_id.exists' => 'Selected unit does not exist.',
            'saleDetails.*.quantity.required' => 'Quantity is required for each sale item.',
            'saleDetails.*.quantity.numeric' => 'Quantity must be a number.',
            'saleDetails.*.amount.required' => 'Amount is required for each sale item.',
            'saleDetails.*.amount.numeric' => 'Amount must be a number.',
            'saleDetails.*.discount_type.in' => 'Discount type must be either 1 (fixed) or 2 (percentage).',
            'saleDetails.*.discount_amount.required_with' => 'Discount amount is required when discount type is selected.',
            'saleDetails.*.discount_amount.numeric' => 'Discount amount must be a number.',
            'saleDetails.*.net.required' => 'Net amount is required for each sale item.',
            'saleDetails.*.net.numeric' => 'Net amount must be a number.',
        ];
    }
}
