<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSupplierRequest extends FormRequest
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
            'name' => 'sometimes|required|string|max:255|unique:suppliers,name,' . $this->route('supplier')->id,
            'contact_id' => 'sometimes|required|exists:contacts,id',
            'billing_address_id' => 'sometimes|nullable|exists:addresses,id',
            'shipping_address_id' => 'sometimes|nullable|exists:addresses,id',
            'gst' => 'sometimes|nullable|string|max:15',
            'notes' => 'sometimes|nullable|string',
            'type' => 'sometimes|nullable|integer',
            'level' => 'sometimes|nullable|integer',
            'status' => 'sometimes|nullable|integer',
        ];
    }
}
