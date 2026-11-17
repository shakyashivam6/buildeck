<?php

namespace App\Http\Requests\Api\Vendor;

use App\Http\Requests\Api\BaseApiRequest;

class AddToInventoryRequest extends BaseApiRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'stock' => ['required', 'numeric', 'min:0', 'max:9999999.99'],
            'amount' => ['required', 'numeric', 'min:0.01', 'max:9999999.99'],
            'mrp' => ['nullable', 'numeric', 'min:0', 'max:9999999.99'],
            'min_order_qty' => ['nullable', 'numeric', 'min:0.01', 'max:999999.99'],
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
            'product_id.required' => 'Please select a product to add.',
            'product_id.exists' => 'The selected product does not exist in master catalog.',
            'stock.required' => 'Initial stock quantity is required.',
            'stock.min' => 'Stock quantity cannot be negative.',
            'amount.required' => 'Selling amount / price is required.',
            'amount.min' => 'Selling amount must be at least 0.01.',
        ];
    }
}
