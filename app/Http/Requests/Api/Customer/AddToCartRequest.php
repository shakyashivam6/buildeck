<?php

namespace App\Http\Requests\Api\Customer;

use App\Http\Requests\Api\BaseApiRequest;

class AddToCartRequest extends BaseApiRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'vendor_id' => ['required', 'integer', 'exists:vendor_profiles,id'],
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'uom_id' => ['required', 'integer', 'exists:units_of_measure,id'],
            'purchase_type' => ['required', 'string', 'in:package,loose'],
            'quantity' => ['required', 'numeric', 'min:0.01', 'max:999999.99'],
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
            'vendor_id.required' => 'Please select a vendor.',
            'vendor_id.exists' => 'The selected vendor profile does not exist.',
            'product_id.required' => 'Please select a product.',
            'product_id.exists' => 'The selected product does not exist.',
            'uom_id.required' => 'Please select a unit of measure.',
            'uom_id.exists' => 'The selected unit of measure does not exist.',
            'purchase_type.in' => 'Purchase type must be either package or loose.',
            'quantity.min' => 'Quantity must be at least 0.01.',
        ];
    }
}
