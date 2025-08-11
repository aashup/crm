<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Validator;

class StorePOSRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

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

            'saleDetails' => ['required', 'array', 'min:1'],
            'saleDetails.*.product_id' => ['nullable', 'exists:products,id'],
            'saleDetails.*.product_name' => ['required_without:saleDetails.*.product_id', 'string', 'max:255'],
            'saleDetails.*.unit_id' => ['required_with:saleDetails.*.product_id', 'exists:units,id'],
            'saleDetails.*.quantity' => ['required', 'numeric', 'min:1'],
            'saleDetails.*.rate' => ['required', 'numeric', 'min:0'],
            'saleDetails.*.discount_type' => ['nullable', 'in:1,2'],
            'saleDetails.*.discount_amount' => ['nullable', 'required_with:saleDetails.*.discount_type', 'numeric', 'min:0'],
            'saleDetails.*.tax_amount' => ['nullable'],
            'saleDetails.*.tax_rate' => ['nullable'],
            'saleDetails.*.net' => ['required', 'numeric', 'min:0'],
            'saleDetails.*.with_tax' => ['required', 'boolean']
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

            $saleDetails = $data['saleDetails'] ?? [];

            $totalSaleAmount = 0;

            foreach ($saleDetails as $index => $detail) {
                $totalSaleAmount += $detail['net'] ?? 0;
                
                if (!empty($detail['product_id']) && !empty($detail['unit_id'])) {
                    $availableQty = DB::table('inventories')
                        ->where('product_id', $detail['product_id'])
                        ->where('unit_id', $detail['unit_id'])
                        ->value('rem_qty');

                    if ($availableQty === null) {
                        $validator->errors()->add("saleDetails.$index.product_id", "Inventory record not found for product.");
                    } elseif ($detail['quantity'] > $availableQty) {
                        $validator->errors()->add("saleDetails.$index.quantity", "Only {$availableQty} units available for this product.");
                    }
                }
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
