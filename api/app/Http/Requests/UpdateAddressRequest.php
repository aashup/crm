<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAddressRequest extends FormRequest
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
            'address' => 'sometimes|required|string|max:255',
            'pin' => 'sometimes|required|string|max:10',
            'mob1' => 'sometimes|required|string|max:15',
            'mob2' => 'sometimes|nullable|string|max:15',
            'type' => 'sometimes|required|integer',
            'city_id' => 'sometimes|required|integer|exists:cities,id',
            'status' => 'sometimes|required|boolean',
            'created_by' => 'sometimes|required|integer|exists:users,id',
        ];
    }
}
