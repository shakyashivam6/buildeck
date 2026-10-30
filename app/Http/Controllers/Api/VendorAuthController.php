<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Location;
use App\Models\User;
use App\Models\VendorProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class VendorAuthController extends Controller
{
    /**
     * Submit an onboard request for vendor registration.
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'vendor_name' => ['required', 'string', 'max:255'],
            'owner_name' => ['required', 'string', 'max:255'],
            'mobile' => ['required', 'string', 'max:20'],
            'email' => ['required', 'email', 'max:255'],
            'address' => ['nullable', 'string'],
            'state_id' => ['required', 'exists:locations,id'],
            'city_id' => ['required', 'exists:locations,id'],
            'pincode' => ['nullable', 'string', 'max:10'],
            'supply_radius' => ['nullable', 'numeric'],
            'lat' => ['nullable', 'numeric'],
            'long' => ['nullable', 'numeric'],
            'gst' => ['nullable', 'string', 'max:20'],
            'pan' => ['nullable', 'string', 'max:15'],
            'aadhaar' => ['nullable', 'string', 'max:20'],
            'bussiness_certificate' => ['nullable', 'string', 'max:100'],
            'aadaar_doc' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'pan_doc' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'bussiness_certificate_doc' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
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

        // Check if an onboarding request already exists with this mobile or email
        $existingVendor = VendorProfile::where('mobile', $request->mobile)
            ->orWhere('email', $request->email)
            ->first();

        if ($existingVendor) {
            if ($existingVendor->status === 'approved') {
                return response()->json([
                    'auth_status' => false,
                    'res' => 'error',
                    'msg' => 'An approved vendor account already exists with this mobile or email. Please login.',
                    'data' => [],
                    'token_type' => 'Bearer',
                ], 409);
            }

            if ($existingVendor->status === 'pending') {
                return response()->json([
                    'auth_status' => false,
                    'res' => 'error',
                    'msg' => 'Your onboarding request has already been submitted and is currently pending admin review.',
                    'data' => [],
                    'token_type' => 'Bearer',
                ], 409);
            }
        }

        $data = $validator->validated();

        // Handle document file uploads
        foreach (['aadaar_doc', 'pan_doc', 'bussiness_certificate_doc'] as $docKey) {
            if ($request->hasFile($docKey)) {
                $data[$docKey] = $request->file($docKey)->store('vendor_documents', 'public');
            }
        }

        $data['status'] = 'pending';

        $vendorProfile = VendorProfile::create($data);

        return response()->json([
            'auth_status' => false,
            'res' => 'success',
            'msg' => 'Vendor onboarding request submitted successfully. Admin will review and approve your account.',
            'data' => [
                'id' => $vendorProfile->id,
                'vendor_name' => $vendorProfile->vendor_name,
                'owner_name' => $vendorProfile->owner_name,
                'mobile' => $vendorProfile->mobile,
                'email' => $vendorProfile->email,
                'status' => $vendorProfile->status,
                'created_at' => $vendorProfile->created_at,
            ],
            'token_type' => 'Bearer',
        ], 201);
    }

    /**
     * Vendor login using mobile/email and password via Laravel Sanctum.
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

        // Find user by mobile or email
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

        // Check if user is a vendor
        if ($user->role !== 'vendor') {
            return response()->json([
                'auth_status' => false,
                'res' => 'error',
                'msg' => 'Access denied. Only registered vendors can login.',
                'data' => [],
                'token_type' => 'Bearer',
            ], 403);
        }

        // Check user approval status
        if ($user->status !== 'approved') {
            return response()->json([
                'auth_status' => false,
                'res' => 'error',
                'msg' => 'Your vendor account is pending admin approval. You can login once approved.',
                'data' => [],
                'token_type' => 'Bearer',
            ], 403);
        }

        // Check linked vendor profile status
        $vendorProfile = $user->vendorProfile;
        if ($vendorProfile && $vendorProfile->status === 'deactivated') {
            return response()->json([
                'auth_status' => false,
                'res' => 'error',
                'msg' => 'Your vendor profile has been deactivated. Please contact administrator.',
                'data' => [],
                'token_type' => 'Bearer',
            ], 403);
        }

        // Generate Sanctum token
        $token = $user->createToken('vendor-mobile-token')->plainTextToken;

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
                ],
                'vendor_profile' => $vendorProfile ? [
                    'id' => $vendorProfile->id,
                    'vendor_name' => $vendorProfile->vendor_name,
                    'owner_name' => $vendorProfile->owner_name,
                    'address' => $vendorProfile->address,
                    'city' => $vendorProfile->city?->name,
                    'state' => $vendorProfile->state?->name,
                    'pincode' => $vendorProfile->pincode,
                    'status' => $vendorProfile->status,
                ] : null,
            ],
        ], 200);
    }

    /**
     * Get authenticated vendor profile details.
     */
    public function profile(Request $request): JsonResponse
    {
        $user = $request->user()->load(['vendorProfile.state', 'vendorProfile.city']);

        return response()->json([
            'auth_status' => true,
            'res' => 'success',
            'msg' => 'Vendor profile fetched successfully.',
            'data' => [
                'user' => $user,
                'vendor_profile' => $user->vendorProfile,
            ],
            'token_type' => 'Bearer',
        ], 200);
    }

    /**
     * Logout and revoke the current Sanctum token.
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
