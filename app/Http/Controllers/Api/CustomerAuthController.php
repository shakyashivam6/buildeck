<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CustomerProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class CustomerAuthController extends Controller
{
    /**
     * Customer registration API.
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'mobile' => ['required', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'password' => ['required', 'string', 'min:6'],
            'address' => ['nullable', 'string'],
            'state_id' => ['nullable', 'exists:locations,id'],
            'city_id' => ['nullable', 'exists:locations,id'],
            'zip' => ['nullable', 'string', 'max:10'],
            'lat' => ['nullable', 'numeric'],
            'long' => ['nullable', 'numeric'],
            'aadhaar' => ['nullable', 'string', 'max:20'],
            'pan' => ['nullable', 'string', 'max:15'],
            'profile_pic' => ['nullable', 'file', 'mimes:jpg,jpeg,png', 'max:5120'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'auth_status' => false,
                'res' => 'error',
                'msg' => $validator->errors()->first(),
                'data' => $validator->errors(),
                'token_type' => 'Bearer',
            ], 422);
        }

        // Check if user already exists with this mobile
        $existingUser = User::where('mobile', $request->mobile)->first();

        if ($existingUser) {
            return response()->json([
                'auth_status' => false,
                'res' => 'error',
                'msg' => 'A user account already exists with this mobile number. Please login.',
                'data' => [],
                'token_type' => 'Bearer',
            ], 409);
        }

        if ($request->filled('email')) {
            $existingEmail = User::where('email', $request->email)->first();
            if ($existingEmail) {
                return response()->json([
                    'auth_status' => false,
                    'res' => 'error',
                    'msg' => 'A user account already exists with this email address.',
                    'data' => [],
                    'token_type' => 'Bearer',
                ], 409);
            }
        }

        $data = $validator->validated();

        if ($request->hasFile('profile_pic')) {
            $data['profile_pic'] = $request->file('profile_pic')->store('customer_documents', 'public');
        }

        $data['role'] = 'customer';
        $data['status'] = 'approved';
        $data['password'] = Hash::make($data['password']);

        $user = User::create($data);

        CustomerProfile::firstOrCreate(['user_id' => $user->id]);

        if (method_exists($user, 'assignRole')) {
            $user->assignRole('customer');
        }

        $token = $user->createToken('customer-mobile-token')->plainTextToken;

        return response()->json([
            'auth_status' => true,
            'res' => 'success',
            'msg' => 'Customer registered successfully.',
            'token_type' => 'Bearer',
            'data' => [
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'mobile' => $user->mobile,
                    'role' => $user->role,
                    'status' => $user->status,
                    'address' => $user->address,
                    'city_id' => $user->city_id,
                    'state_id' => $user->state_id,
                    'zip' => $user->zip,
                    'profile_pic' => $user->profile_pic ? asset('storage/' . $user->profile_pic) : null,
                ],
            ],
        ], 201);
    }

    /**
     * Customer login using mobile/email and password via Laravel Sanctum.
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'login' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'auth_status' => false,
                'res' => 'error',
                'msg' => $validator->errors()->first(),
                'data' => $validator->errors(),
                'token_type' => 'Bearer',
            ], 422);
        }

        $user = User::where('mobile', $request->login)
            ->orWhere('email', $request->login)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'auth_status' => false,
                'res' => 'error',
                'msg' => 'Invalid login credentials.',
                'data' => [],
                'token_type' => 'Bearer',
            ], 401);
        }

        if ($user->role !== 'customer') {
            return response()->json([
                'auth_status' => false,
                'res' => 'error',
                'msg' => 'Access denied. Only registered customers can login here.',
                'data' => [],
                'token_type' => 'Bearer',
            ], 403);
        }

        if ($user->status !== 'approved') {
            return response()->json([
                'auth_status' => false,
                'res' => 'error',
                'msg' => 'Your customer account is currently inactive or pending approval.',
                'data' => [],
                'token_type' => 'Bearer',
            ], 403);
        }

        $token = $user->createToken('customer-mobile-token')->plainTextToken;

        return response()->json([
            'auth_status' => true,
            'res' => 'success',
            'msg' => 'Login successful.',
            'token_type' => 'Bearer',
            'data' => [
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'mobile' => $user->mobile,
                    'role' => $user->role,
                    'status' => $user->status,
                    'address' => $user->address,
                    'city' => $user->city?->name,
                    'state' => $user->state?->name,
                    'zip' => $user->zip,
                    'profile_pic' => $user->profile_pic ? asset('storage/' . $user->profile_pic) : null,
                ],
            ],
        ], 200);
    }

    /**
     * Get authenticated customer profile details.
     */
    public function profile(Request $request): JsonResponse
    {
        $user = $request->user()->load(['state', 'city', 'customerProfile']);

        return response()->json([
            'auth_status' => true,
            'res' => 'success',
            'msg' => 'Customer profile fetched successfully.',
            'token_type' => 'Bearer',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'mobile' => $user->mobile,
                    'role' => $user->role,
                    'status' => $user->status,
                    'address' => $user->address,
                    'city' => $user->city?->name,
                    'city_id' => $user->city_id,
                    'state' => $user->state?->name,
                    'state_id' => $user->state_id,
                    'zip' => $user->zip,
                    'lat' => $user->lat,
                    'long' => $user->long,
                    'aadhaar' => $user->aadhaar,
                    'pan' => $user->pan,
                    'profile_pic' => $user->profile_pic ? asset('storage/' . $user->profile_pic) : null,
                    'created_at' => $user->created_at,
                ],
            ],
        ], 200);
    }

    /**
     * Update customer profile details.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'address' => ['nullable', 'string'],
            'state_id' => ['nullable', 'exists:locations,id'],
            'city_id' => ['nullable', 'exists:locations,id'],
            'zip' => ['nullable', 'string', 'max:10'],
            'lat' => ['nullable', 'numeric'],
            'long' => ['nullable', 'numeric'],
            'profile_pic' => ['nullable', 'file', 'mimes:jpg,jpeg,png', 'max:5120'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'auth_status' => false,
                'res' => 'error',
                'msg' => $validator->errors()->first(),
                'data' => $validator->errors(),
                'token_type' => 'Bearer',
            ], 422);
        }

        $validated = $validator->validated();

        if ($request->hasFile('profile_pic')) {
            if ($user->profile_pic) {
                Storage::disk('public')->delete($user->profile_pic);
            }
            $validated['profile_pic'] = $request->file('profile_pic')->store('customer_documents', 'public');
        }

        $user->update($validated);

        return response()->json([
            'auth_status' => true,
            'res' => 'success',
            'msg' => 'Profile updated successfully.',
            'token_type' => 'Bearer',
            'data' => [
                'user' => $user->fresh()->load(['state', 'city']),
            ],
        ], 200);
    }

    /**
     * Logout and revoke Sanctum token.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'auth_status' => false,
            'res' => 'success',
            'msg' => 'Logged out successfully.',
            'data' => [],
            'token_type' => 'Bearer',
        ], 200);
    }
}

