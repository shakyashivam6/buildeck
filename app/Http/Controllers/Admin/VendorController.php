<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Location;
use App\Models\User;
use App\Models\VendorProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class VendorController extends Controller
{
    /**
     * Display a listing of vendors and the onboarding form.
     */
    public function index(): Response
    {
        $states = Location::where('parent_id', 1)
            ->where('status', '1')
            ->orderBy('name', 'asc')
            ->get(['id', 'name']);

        $vendors = VendorProfile::with(['user', 'state', 'city'])
            ->latest()
            ->paginate(15);

        return Inertia::render('Admin/Onboard/index', [
            'states' => $states,
            'vendors' => $vendors,
        ]);
    }

    /**
     * Store a newly created vendor profile.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'vendor_name' => ['required', 'string', 'max:255'],
            'owner_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'mobile' => ['required', 'string', 'max:20'],
            'supply_radius' => ['nullable', 'numeric'],
            'address' => ['nullable', 'string'],
            'state_id' => ['required', 'exists:locations,id'],
            'city_id' => ['required', 'exists:locations,id'],
            'pincode' => ['nullable', 'string', 'max:10'],
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

        foreach (['aadaar_doc', 'pan_doc', 'bussiness_certificate_doc'] as $docKey) {
            if ($request->hasFile($docKey)) {
                $validated[$docKey] = $request->file($docKey)->store('vendor_documents', 'public');
            }
        }

        $validated['status'] = 'pending';

        VendorProfile::create($validated);

        return back()->with('success', 'Vendor onboarded successfully! Status is set to Pending for review.');
    }

    /**
     * Update an existing vendor's details.
     */
    public function update(Request $request, VendorProfile $vendor): RedirectResponse
    {
        $validated = $request->validate([
            'vendor_name' => ['required', 'string', 'max:255'],
            'owner_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'mobile' => ['required', 'string', 'max:20'],
            'supply_radius' => ['nullable', 'numeric'],
            'address' => ['nullable', 'string'],
            'state_id' => ['required', 'exists:locations,id'],
            'city_id' => ['required', 'exists:locations,id'],
            'pincode' => ['nullable', 'string', 'max:10'],
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

        foreach (['aadaar_doc', 'pan_doc', 'bussiness_certificate_doc'] as $docKey) {
            if ($request->hasFile($docKey)) {
                if ($vendor->$docKey) {
                    Storage::disk('public')->delete($vendor->$docKey);
                }
                $validated[$docKey] = $request->file($docKey)->store('vendor_documents', 'public');
            }
        }

        $vendor->update($validated);

        // Agar user pehle se connected hai, toh uski basic info bhi update karein
        if ($vendor->user_id && $vendor->user) {
            $vendor->user->update([
                'name' => $vendor->owner_name,
                'email' => $vendor->email,
                'mobile' => $vendor->mobile,
                'address' => $vendor->address,
                'state_id' => $vendor->state_id,
                'city_id' => $vendor->city_id,
                'zip' => $vendor->pincode,
            ]);
        }

        return back()->with('success', 'Vendor details updated successfully!');
    }

    /**
     * Update the status of a vendor (approve, deactivate, pending, etc.).
     */
    public function updateStatus(Request $request, VendorProfile $vendor): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,approved,rejected,deactivated'],
        ]);

        $vendor->update(['status' => $validated['status']]);

        // Agar linked user account hai, toh user ka status bhi sync karein
        if ($vendor->user_id && $vendor->user) {
            $userStatus = $validated['status'] === 'approved' ? 'approved' : 'pending';
            $vendor->user->update(['status' => $userStatus]);
        }

        $statusLabel = ucfirst($validated['status']);
        return back()->with('success', "Vendor status updated to {$statusLabel} successfully!");
    }

    /**
     * Generate Login ID and Password for an approved vendor.
     */
    public function generateCredentials(Request $request, VendorProfile $vendor): RedirectResponse
    {
        // Rule: Login credentials can ONLY be generated when vendor is in 'approved' status!
        if ($vendor->status !== 'approved') {
            return back()->with('error', 'Login credentials can only be generated for Approved vendors. Please approve the vendor first.');
        }

        $request->validate([
            'password' => ['nullable', 'string', 'min:6'],
        ]);

        $plainPassword = $request->filled('password')
            ? $request->input('password')
            : Str::password(10, true, true, false);

        // Check if user already exists by mobile or existing vendor user
        $user = $vendor->user ?? User::where('mobile', $vendor->mobile)->first();

        if (!$user) {
            $user = User::create([
                'name' => $vendor->owner_name,
                'email' => $vendor->email,
                'mobile' => $vendor->mobile,
                'role' => 'vendor',
                'status' => 'approved',
                'password' => Hash::make($plainPassword),
                'address' => $vendor->address,
                'state_id' => $vendor->state_id,
                'city_id' => $vendor->city_id,
                'zip' => $vendor->pincode,
                'lat' => $vendor->lat,
                'long' => $vendor->long,
                'aadhaar' => $vendor->aadhaar,
                'pan' => $vendor->pan,
            ]);
        } else {
            $user->update([
                'name' => $vendor->owner_name,
                'email' => $vendor->email,
                'role' => 'vendor',
                'status' => 'approved',
                'password' => Hash::make($plainPassword),
            ]);

            // Ensure vendor role is assigned
            if (method_exists($user, 'assignRole')) {
                $user->assignRole('vendor');
            }
        }

        // Link user to vendor profile
        $vendor->update(['user_id' => $user->id]);

        return back()->with('generated_credentials', [
            'vendor_id' => $vendor->id,
            'vendor_name' => $vendor->vendor_name,
            'owner_name' => $vendor->owner_name,
            'login_id' => $user->mobile,
            'email' => $user->email,
            'password' => $plainPassword,
        ])->with('success', 'Vendor login credentials generated successfully!');
    }

    /**
     * Get cities list by state ID.
     */
    public function getCities(int $stateId): JsonResponse
    {
        $cities = Location::where('parent_id', $stateId)
            ->where('status', '1')
            ->orderBy('name', 'asc')
            ->get(['id', 'name']);

        return response()->json($cities);
    }
}
