<?php

namespace App\Http\Controllers\Admin\Onboard;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Support\SupportController;
use App\Models\CustomerProfile;
use App\Models\Location;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    /**
     * Display a listing of registered customers and onboarding page.
     */
    public function index(): Response
    {
        $states = SupportController::getStatesList();

        $customers = User::where('role', 'customer')
            ->with(['state', 'city', 'customerProfile'])
            ->latest()
            ->paginate(15);

        return Inertia::render('Admin/Onboard/Customer/index', [
            'states' => $states,
            'customers' => $customers,
        ]);
    }

    /**
     * Store a newly created customer in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'mobile' => ['required', 'string', 'max:20', 'unique:users,mobile'],
            'email' => ['nullable', 'email', 'max:255', 'unique:users,email'],
            'address' => ['nullable', 'string'],
            'state_id' => ['required', 'exists:locations,id'],
            'city_id' => ['required', 'exists:locations,id'],
            'zip' => ['nullable', 'string', 'max:10'],
            'lat' => ['nullable', 'numeric'],
            'long' => ['nullable', 'numeric'],
            'aadhaar' => ['nullable', 'string', 'max:20'],
            'pan' => ['nullable', 'string', 'max:15'],
            'profile_pic' => ['nullable', 'file', 'mimes:jpg,jpeg,png', 'max:5120'],
            'aadhaar_doc' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'pan_doc' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ]);

        if ($request->hasFile('profile_pic')) {
            $validated['profile_pic'] = $request->file('profile_pic')->store('customer_documents', 'public');
        }

        if ($request->hasFile('aadhaar_doc')) {
            $request->file('aadhaar_doc')->store('customer_documents', 'public');
        }
        if ($request->hasFile('pan_doc')) {
            $request->file('pan_doc')->store('customer_documents', 'public');
        }

        $user = User::create([
            'name' => $validated['name'],
            'mobile' => $validated['mobile'],
            'email' => $validated['email'] ?? null,
            'role' => 'customer',
            'status' => 'pending',
            'address' => $validated['address'] ?? null,
            'state_id' => $validated['state_id'],
            'city_id' => $validated['city_id'],
            'zip' => $validated['zip'] ?? null,
            'lat' => $validated['lat'] ?? null,
            'long' => $validated['long'] ?? null,
            'aadhaar' => $validated['aadhaar'] ?? null,
            'pan' => $validated['pan'] ?? null,
            'profile_pic' => $validated['profile_pic'] ?? null,
        ]);

        CustomerProfile::firstOrCreate(['user_id' => $user->id]);

        if (method_exists($user, 'assignRole')) {
            $user->assignRole('customer');
        }

        return back()->with('success', 'Customer onboarded successfully! Status is set to Pending for review.');
    }

    /**
     * Update the specified customer.
     */
    public function update(Request $request, User $customer): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'mobile' => ['required', 'string', 'max:20', Rule::unique('users', 'mobile')->ignore($customer->id)],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('users', 'email')->ignore($customer->id)],
            'address' => ['nullable', 'string'],
            'state_id' => ['required', 'exists:locations,id'],
            'city_id' => ['required', 'exists:locations,id'],
            'zip' => ['nullable', 'string', 'max:10'],
            'lat' => ['nullable', 'numeric'],
            'long' => ['nullable', 'numeric'],
            'aadhaar' => ['nullable', 'string', 'max:20'],
            'pan' => ['nullable', 'string', 'max:15'],
            'profile_pic' => ['nullable', 'file', 'mimes:jpg,jpeg,png', 'max:5120'],
            'aadhaar_doc' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'pan_doc' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ]);

        if ($request->hasFile('profile_pic')) {
            if ($customer->profile_pic) {
                Storage::disk('public')->delete($customer->profile_pic);
            }
            $validated['profile_pic'] = $request->file('profile_pic')->store('customer_documents', 'public');
        }

        if ($request->hasFile('aadhaar_doc')) {
            $request->file('aadhaar_doc')->store('customer_documents', 'public');
        }
        if ($request->hasFile('pan_doc')) {
            $request->file('pan_doc')->store('customer_documents', 'public');
        }

        $customer->update([
            'name' => $validated['name'],
            'mobile' => $validated['mobile'],
            'email' => $validated['email'] ?? null,
            'address' => $validated['address'] ?? null,
            'state_id' => $validated['state_id'],
            'city_id' => $validated['city_id'],
            'zip' => $validated['zip'] ?? null,
            'lat' => $validated['lat'] ?? null,
            'long' => $validated['long'] ?? null,
            'aadhaar' => $validated['aadhaar'] ?? null,
            'pan' => $validated['pan'] ?? null,
            'profile_pic' => $validated['profile_pic'] ?? $customer->profile_pic,
        ]);

        CustomerProfile::firstOrCreate(['user_id' => $customer->id]);

        return back()->with('success', 'Customer details updated successfully!');
    }

    /**
     * Update the status of a customer (approve, deactivate, pending).
     */
    public function updateStatus(Request $request, User $customer): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,approved,rejected,deactivated'],
        ]);

        $newStatus = $validated['status'] === 'approved' ? 'approved' : 'pending';
        $customer->update(['status' => $newStatus]);

        $statusLabel = ucfirst($validated['status']);
        return back()->with('success', "Customer status updated to {$statusLabel} successfully!");
    }

    /**
     * Generate Login Credentials for an approved customer.
     */
    public function generateCredentials(Request $request, User $customer): RedirectResponse
    {
        if ($customer->status !== 'approved') {
            return back()->with('error', 'Login credentials can only be generated for Approved customers. Please approve the customer first.');
        }

        $request->validate([
            'password' => ['nullable', 'string', 'min:6'],
        ]);

        $plainPassword = $request->filled('password')
            ? $request->input('password')
            : Str::password(10, true, true, false);

        $customer->update([
            'password' => Hash::make($plainPassword),
            'status' => 'approved',
            'role' => 'customer',
        ]);

        if (method_exists($customer, 'assignRole')) {
            $customer->assignRole('customer');
        }

        CustomerProfile::firstOrCreate(['user_id' => $customer->id]);

        return back()->with('generated_credentials', [
            'customer_id' => $customer->id,
            'name' => $customer->name,
            'login_id' => $customer->mobile,
            'mobile' => $customer->mobile,
            'email' => $customer->email,
            'password' => $plainPassword,
        ])->with('success', 'Customer login credentials generated successfully!');
    }
}
