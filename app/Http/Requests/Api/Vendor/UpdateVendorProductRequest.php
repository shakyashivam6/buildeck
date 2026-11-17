<?php

namespace App\Http\Requests\Api\Vendor;

use App\Http\Requests\Api\BaseApiRequest;

class UpdateVendorProductRequest extends BaseApiRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric', 'min:0.01', 'max:9999999.99'],
            'mrp' => ['nullable', 'numeric', 'min:0', 'max:9999999.99'],
            'stock' => ['nullable', 'numeric', 'min:0', 'max:9999999.99'],
            'min_order_qty' => ['nullable', 'numeric', 'min:0.01', 'max:999999.99'],
            'reason' => ['nullable', 'string', 'max:255'],
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
            'amount.required' => 'Selling amount / price is required.',
            'amount.min' => 'Selling amount must be at least 0.01.',
            'stock.min' => 'Stock quantity cannot be negative.',
        ];
    }
}
