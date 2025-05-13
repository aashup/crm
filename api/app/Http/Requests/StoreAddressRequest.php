<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAddressRequest extends FormRequest
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
            'address' => 'required|string|max:255',
            'pin' => 'required|string|max:10',
            'mob1' => 'required|string|max:15',
            'mob2' => 'nullable|string|max:15',
            'type' => 'required|integer',
            'city_id' => 'required|integer|exists:cities,id',
            'status' => 'required|boolean',
            'created_by' => 'required|integer|exists:users,id',
        ];
    }
}
