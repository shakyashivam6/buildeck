<?php

namespace App\Http\Requests\Api\Vendor;

use App\Http\Requests\Api\BaseApiRequest;

class AddStockRequest extends BaseApiRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'quantity_to_add' => ['required', 'numeric', 'min:0.01', 'max:9999999.99'],
            'challan_or_invoice_no' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * Custom validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'quantity_to_add.required' => 'Please enter the stock quantity to add.',
            'quantity_to_add.min' => 'Added stock quantity must be at least 0.01.',
        ];
    }
}
