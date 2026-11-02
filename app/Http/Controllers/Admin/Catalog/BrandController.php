<?php

namespace App\Http\Controllers\Admin\Catalog;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\SubCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BrandController extends Controller
{
    /**
     * Display a listing of brands.
     */
    public function index(): Response
    {
        $brands = Brand::with(['subCategories'])
            ->withCount('products')
            ->orderBy('name')
            ->paginate(20);

        $subCategories = SubCategory::orderBy('name')->get(['id', 'name', 'code']);

        return Inertia::render('Admin/Catalog/Brands/index', [
            'brands' => $brands,
            'subCategories' => $subCategories,
        ]);
    }

    /**
     * Store a newly created brand.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'is_approved_master' => ['boolean'],
            'sub_category_ids' => ['nullable', 'array'],
            'sub_category_ids.*' => ['exists:sub_categories,id'],
        ]);

        $brand = Brand::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'is_approved_master' => $validated['is_approved_master'] ?? true,
        ]);

        if (! empty($validated['sub_category_ids'])) {
            $brand->subCategories()->sync($validated['sub_category_ids']);
        }

        return back()->with('success', 'Brand created successfully!');
    }

    /**
     * Update an existing brand.
     */
    public function update(Request $request, Brand $brand): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'is_approved_master' => ['boolean'],
            'sub_category_ids' => ['nullable', 'array'],
            'sub_category_ids.*' => ['exists:sub_categories,id'],
        ]);

        $brand->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'is_approved_master' => $validated['is_approved_master'] ?? true,
        ]);

        if (isset($validated['sub_category_ids'])) {
            $brand->subCategories()->sync($validated['sub_category_ids']);
        }

        return back()->with('success', 'Brand updated successfully!');
    }
}

