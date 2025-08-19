<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdatePurchaseRequest extends FormRequest
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
            'party_id' => ['nullable', 'exists:parties,id'],
            'mobile' => ['required_without:contact_id', 'string', 'max:20', 'regex:/^\+[0-9\s\-\(\)\.]{7,20}$/'],
            'name' => ['required_without:contact_id', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0'],
            'discount_type' => ['nullable', 'in:1,2'], // 1 = fixed, 2 = percentage
            'discount_amount' => ['nullable', 'required_with:discount_type', 'numeric', 'min:0'],
            'net_total' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:500'],
            'status' => ['required', 'in:1,2'], // 1 = active, 2 = inactive

            'payment_method' => ['required', 'integer', 'in:1,2,3'], // 1 = Cash, 2 = Online, 3 = Split Payment
            'cash_amount' => ['nullable', 'required_if:payment_method,1,3', 'numeric', 'min:0'],
            'online_amount' => ['nullable', 'required_if:payment_method,2,3', 'numeric', 'min:0'],
            'transaction_id' => ['nullable', 'string', 'max:255'],
            'return_amount' => ['nullable', 'numeric', 'min:0'],
            'due_amount' => ['nullable', 'numeric', 'min:0'],

            'purchaseDetails' => ['required', 'array', 'min:1'],
            'purchaseDetails.*.product_id' => ['nullable', 'exists:products,id'],
            'purchaseDetails.*.product_name' => ['required_without:purchaseDetails.*.product_id', 'string', 'max:255'],
            'purchaseDetails.*.unit_id' => ['required_with:purchaseDetails.*.product_id', 'exists:units,id'],
            'purchaseDetails.*.quantity' => ['required', 'numeric', 'min:1'],
            'purchaseDetails.*.rate' => ['required', 'numeric', 'min:0'],
            'purchaseDetails.*.discount_type' => ['nullable', 'in:1,2'],
            'purchaseDetails.*.discount_amount' => ['nullable', 'required_with:purchaseDetails.*.discount_type', 'numeric', 'min:0'],
            'purchaseDetails.*.tax_amount' => ['nullable'],
            'purchaseDetails.*.tax_rate' => ['nullable'],
            'purchaseDetails.*.net' => ['required', 'numeric', 'min:0'],
            'purchaseDetails.*.with_tax' => ['required', 'boolean']
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function (Validator $validator) {
            $data = $this->all();

            if ($data['payment_method'] == 1 && (($data['cash_amount'] - $data['return_amount']) + $data['due_amount']) != $data['net_total']) {
                $validator->errors()->add('cash_amount', 'For Cash payment, Cash Amount minus Return Amount must equal Net Total.');
            }

            if ($data['payment_method'] == 2 && (($data['online_amount'] - $data['return_amount']) + $data['due_amount']) != $data['net_total']) {
                $validator->errors()->add('online_amount', 'Online amount must equal the net total for Online payment method.');
            }

            if ($data['payment_method'] == 3 && ((($data['cash_amount'] + $data['online_amount']) - $data['return_amount']) + $data['due_amount']) != $data['net_total']) {
                $validator->errors()->add('payment_method', 'Total of Cash and Online amounts must equal the net total for Split Payment.');
            }

            $purchaseDetails = $data['purchaseDetails'] ?? [];

            $totalSaleAmount = 0;

            foreach ($purchaseDetails as $index => $detail) {
                $totalSaleAmount += $detail['net'] ?? 0;
            }

            if (isset($data['amount']) && $data['amount'] < $totalSaleAmount) {
                $validator->errors()->add('amount', 'The overall amount should not be greater than the total of sale item amounts.');
            }

            if (isset($data['discount_amount']) && $data['discount_amount'] > $data['amount']) {
                $validator->errors()->add('discount_amount', 'The discount amount cannot be greater than the amount.');
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

            'purchaseDetails.required' => 'At least one sale item must be added.',
            'purchaseDetails.*.product_id.required' => 'Product is required for each sale item.',
            'purchaseDetails.*.product_id.exists' => 'Selected product does not exist.',
            'purchaseDetails.*.unit_id.required' => 'Unit is required for each sale item.',
            'purchaseDetails.*.unit_id.exists' => 'Selected unit does not exist.',
            'purchaseDetails.*.quantity.required' => 'Quantity is required for each sale item.',
            'purchaseDetails.*.quantity.numeric' => 'Quantity must be a number.',
            'purchaseDetails.*.amount.required' => 'Amount is required for each sale item.',
            'purchaseDetails.*.amount.numeric' => 'Amount must be a number.',
            'purchaseDetails.*.discount_type.in' => 'Discount type must be either 1 (fixed) or 2 (percentage).',
            'purchaseDetails.*.discount_amount.required_with' => 'Discount amount is required when discount type is selected.',
            'purchaseDetails.*.discount_amount.numeric' => 'Discount amount must be a number.',
            'purchaseDetails.*.net.required' => 'Net amount is required for each sale item.',
            'purchaseDetails.*.net.numeric' => 'Net amount must be a number.',
        ];
    }
}
