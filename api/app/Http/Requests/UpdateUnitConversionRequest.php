<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUnitConversionRequest extends FormRequest
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
            'product_id' => 'required|integer|exists:products,id',
            'from_unit_id' => 'required|integer|exists:units,id',
            'to_unit_id' => 'required|integer|exists:units,id',
            'conversion_factor' => 'required|numeric',
            'description' => 'nullable|string|max:255',
            'status' => 'required|boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'product_id.required' => 'The product ID is required.',
            'product_id.exists' => 'The selected product does not exist.',
            'to_unit_id.exists' => 'The selected to unit does not exist.',
            'from_unit_id.exists' => 'The selected from unit does not exist.',
            'to_unit_id.required' => 'The to unit ID is required.',
            'from_unit_id.required' => 'The from unit ID is required.',
            'conversion_factor.required' => 'The conversion factor is required.',
            'status.required' => 'The status is required.',
        ];
    }
}
