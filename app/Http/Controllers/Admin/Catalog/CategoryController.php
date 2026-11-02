<?php

namespace App\Http\Controllers\Admin\Catalog;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\SubCategory;
use App\Models\UnitOfMeasure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    /**
     * Display a listing of categories and their sub-categories.
     */
    public function index(): Response
    {
        $categories = Category::with(['subCategories.defaultBaseUom', 'subCategories.approvedBrands'])
            ->orderBy('display_order')
            ->get();

        $uoms = UnitOfMeasure::orderBy('name')->get(['id', 'name', 'symbol', 'code']);

        return Inertia::render('Admin/Catalog/Categories/index', [
            'categories' => $categories,
            'uoms' => $uoms,
        ]);
    }

    /**
     * Store a newly created category.
     */
    public function storeCategory(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'code' => ['required', 'string', 'max:50', 'unique:categories,code'],
            'display_order' => ['nullable', 'integer'],
        ]);

        Category::create([
            'name' => $validated['name'],
            'code' => strtoupper($validated['code']),
            'slug' => Str::slug($validated['name']),
            'display_order' => $validated['display_order'] ?? 0,
            'is_active' => true,
        ]);

        return back()->with('success', 'Category created successfully!');
    }

    /**
     * Store a newly created sub-category.
     */
    public function storeSubCategory(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'default_base_uom_id' => ['required', 'exists:units_of_measure,id'],
            'name' => ['required', 'string', 'max:150'],
            'code' => ['required', 'string', 'max:50', 'unique:sub_categories,code'],
            'packing_rule_desc' => ['nullable', 'string'],
            'allows_loose_by_default' => ['boolean'],
            'display_order' => ['nullable', 'integer'],
        ]);

        SubCategory::create([
            'category_id' => $validated['category_id'],
            'default_base_uom_id' => $validated['default_base_uom_id'],
            'name' => $validated['name'],
            'code' => strtoupper($validated['code']),
            'slug' => Str::slug($validated['name']),
            'packing_rule_desc' => $validated['packing_rule_desc'] ?? null,
            'allows_loose_by_default' => $validated['allows_loose_by_default'] ?? false,
            'display_order' => $validated['display_order'] ?? 0,
            'is_active' => true,
        ]);

        return back()->with('success', 'Sub-Category created successfully!');
    }
}

