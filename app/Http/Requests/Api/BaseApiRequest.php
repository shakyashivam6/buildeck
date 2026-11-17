<?php

namespace App\Http\Requests\Api;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

abstract class BaseApiRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Handle a failed validation attempt and throw a standard JSON response.
     *
     * @param Validator $validator
     * @throws HttpResponseException
     */
    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            response()->json([
                'auth_status' => true,
                'res' => 'error',
                'msg' => $validator->errors()->first(),
                'token_type' => 'Bearer',
                'data' => $validator->errors(),
            ], 422)
        );
    }

    /**
     * Handle a failed authorization attempt and throw a standard JSON response.
     *
     * @throws HttpResponseException
     */
    protected function failedAuthorization(): void
    {
        throw new HttpResponseException(
            response()->json([
                'auth_status' => false,
                'res' => 'error',
                'msg' => 'You do not have permission to perform this action.',
                'token_type' => 'Bearer',
                'data' => [],
            ], 403)
        );
    }
}
