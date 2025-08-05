<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaxRateRequest extends FormRequest
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
            'rate' => 'required|numeric|min:0|max:100',
            'type' => 'required|integer|in:1,2,3,4,5,6,7', // 1. gst, 2. igst, 3. cgst, 4. sgst, 5. vat, 6. service tax, 7. other
            'is_active' => 'boolean',
        ];
    }
}
