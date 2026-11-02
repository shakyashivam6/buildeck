<?php

namespace App\Http\Controllers\Admin\Catalog;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\SubCategory;
use App\Models\UnitOfMeasure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
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
            ->withCount('subCategories')
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
     * Update an existing category.
     */
    public function updateCategory(Request $request, Category $category): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'code' => ['required', 'string', 'max:50', Rule::unique('categories')->ignore($category->id)],
            'display_order' => ['nullable', 'integer'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $category->update([
            'name' => $validated['name'],
            'code' => strtoupper($validated['code']),
            'slug' => Str::slug($validated['name']),
            'display_order' => $validated['display_order'] ?? $category->display_order,
            'is_active' => $request->has('is_active') ? $request->boolean('is_active') : $category->is_active,
        ]);

        return back()->with('success', 'Category updated successfully!');
    }

    /**
     * Toggle active/inactive status of a category.
     */
    public function toggleCategoryStatus(Category $category): RedirectResponse
    {
        $category->update([
            'is_active' => ! $category->is_active,
        ]);

        $statusText = $category->is_active ? 'Activated' : 'Deactivated';

        return back()->with('success', "Category '{$category->name}' has been {$statusText}!");
    }

    /**
     * Delete a category.
     */
    public function destroyCategory(Category $category): RedirectResponse
    {
        $hasProducts = Product::whereIn('sub_category_id', $category->subCategories()->pluck('id'))->exists();

        if ($hasProducts) {
            return back()->with('error', "Cannot delete category '{$category->name}' because it contains sub-categories with active products.");
        }

        $category->delete();

        return back()->with('success', "Category '{$category->name}' and its sub-categories deleted successfully!");
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

    /**
     * Update an existing sub-category.
     */
    public function updateSubCategory(Request $request, SubCategory $subCategory): RedirectResponse
    {
        $validated = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'default_base_uom_id' => ['required', 'exists:units_of_measure,id'],
            'name' => ['required', 'string', 'max:150'],
            'code' => ['required', 'string', 'max:50', Rule::unique('sub_categories')->ignore($subCategory->id)],
            'packing_rule_desc' => ['nullable', 'string'],
            'allows_loose_by_default' => ['boolean'],
            'display_order' => ['nullable', 'integer'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $subCategory->update([
            'category_id' => $validated['category_id'],
            'default_base_uom_id' => $validated['default_base_uom_id'],
            'name' => $validated['name'],
            'code' => strtoupper($validated['code']),
            'slug' => Str::slug($validated['name']),
            'packing_rule_desc' => $validated['packing_rule_desc'] ?? null,
            'allows_loose_by_default' => $validated['allows_loose_by_default'] ?? false,
            'display_order' => $validated['display_order'] ?? $subCategory->display_order,
            'is_active' => $request->has('is_active') ? $request->boolean('is_active') : $subCategory->is_active,
        ]);

        return back()->with('success', 'Sub-Category updated successfully!');
    }

    /**
     * Toggle active/inactive status of a sub-category.
     */
    public function toggleSubCategoryStatus(SubCategory $subCategory): RedirectResponse
    {
        $subCategory->update([
            'is_active' => ! $subCategory->is_active,
        ]);

        $statusText = $subCategory->is_active ? 'Activated' : 'Deactivated';

        return back()->with('success', "Sub-Category '{$subCategory->name}' has been {$statusText}!");
    }

    /**
     * Delete a sub-category.
     */
    public function destroySubCategory(SubCategory $subCategory): RedirectResponse
    {
        if ($subCategory->products()->exists()) {
            return back()->with('error', "Cannot delete sub-category '{$subCategory->name}' because it has existing products assigned.");
        }

        $subCategory->delete();

        return back()->with('success', "Sub-Category '{$subCategory->name}' deleted successfully!");
    }
}
