<?php

namespace App\Http\Controllers\Admin\Catalog;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Product;
use App\Models\ProductUomPrice;
use App\Models\SubCategory;
use App\Models\UnitOfMeasure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Display a listing of products with their UOM prices and images.
     */
    public function index(Request $request): Response
    {
        $query = Product::with([
            'subCategory.category',
            'brand',
            'baseUom',
            'uomPrices.uom',
        ]);

        if ($request->filled('sub_category_id')) {
            $query->where('sub_category_id', $request->integer('sub_category_id'));
        }

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        $products = $query->latest()->paginate(15)->withQueryString();

        $subCategories = SubCategory::with('defaultBaseUom')
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'category_id', 'default_base_uom_id', 'spec_template', 'packing_rule_desc', 'allows_loose_by_default']);

        $brands = Brand::orderBy('name')->get(['id', 'name']);
        $uoms = UnitOfMeasure::orderBy('name')->get(['id', 'name', 'code', 'symbol', 'unit_category']);

        return Inertia::render('Admin/Catalog/Products/index', [
            'products' => $products,
            'subCategories' => $subCategories,
            'brands' => $brands,
            'uoms' => $uoms,
            'filters' => $request->only(['sub_category_id', 'search']),
        ]);
    }

    /**
     * Store a newly created product with cover image, gallery, and Multi-UOM Entry Matrix.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['required', 'string', 'max:100', 'unique:products,sku'],
            'sub_category_id' => ['required', 'exists:sub_categories,id'],
            'brand_id' => ['nullable', 'exists:brands,id'],
            'base_uom_id' => ['required', 'exists:units_of_measure,id'],
            'description' => ['nullable', 'string'],
            'packing_rule_desc' => ['nullable', 'string'],
            'specifications' => ['nullable', 'array'],

            // Image Upload validations
            'cover_image' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'gallery_images' => ['nullable', 'array'],
            'gallery_images.*' => ['file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],

            // Multi-UOM Matrix validation
            'pricing_matrix' => ['required', 'array', 'min:1'],
            'pricing_matrix.*.uom_id' => ['required', 'exists:units_of_measure,id'],
            'pricing_matrix.*.conversion_factor' => ['required', 'numeric', 'min:0.0001'],
            'pricing_matrix.*.selling_price' => ['required', 'numeric', 'min:0'],
            'pricing_matrix.*.mrp' => ['nullable', 'numeric', 'min:0'],
            'pricing_matrix.*.bulk_discount_price' => ['nullable', 'numeric', 'min:0'],
            'pricing_matrix.*.allow_loose_sale' => ['boolean'],
            'pricing_matrix.*.min_order_qty' => ['required', 'numeric', 'min:0.01'],
            'pricing_matrix.*.step_qty' => ['required', 'numeric', 'min:0.01'],
            'pricing_matrix.*.pack_contain_qty' => ['nullable', 'numeric'],
            'pricing_matrix.*.is_default_selling_unit' => ['boolean'],
        ]);

        // Upload Cover Image
        $coverPath = null;
        if ($request->hasFile('cover_image')) {
            $coverPath = $request->file('cover_image')->store('products/covers', 'public');
        }

        // Upload Gallery Images
        $galleryPaths = [];
        if ($request->hasFile('gallery_images')) {
            foreach ($request->file('gallery_images') as $file) {
                $galleryPaths[] = $file->store('products/gallery', 'public');
            }
        }

        DB::transaction(function () use ($validated, $coverPath, $galleryPaths) {
            $product = Product::create([
                'name' => $validated['name'],
                'slug' => Str::slug($validated['name']),
                'sku' => $validated['sku'],
                'sub_category_id' => $validated['sub_category_id'],
                'brand_id' => $validated['brand_id'] ?? null,
                'base_uom_id' => $validated['base_uom_id'],
                'description' => $validated['description'] ?? null,
                'packing_rule_desc' => $validated['packing_rule_desc'] ?? null,
                'cover_image' => $coverPath,
                'gallery_images' => ! empty($galleryPaths) ? $galleryPaths : null,
                'specifications' => $validated['specifications'] ?? [],
                'is_active' => true,
            ]);

            foreach ($validated['pricing_matrix'] as $priceRow) {
                ProductUomPrice::create([
                    'product_id' => $product->id,
                    'uom_id' => $priceRow['uom_id'],
                    'conversion_factor' => $priceRow['conversion_factor'],
                    'selling_price' => $priceRow['selling_price'],
                    'mrp' => $priceRow['mrp'] ?? null,
                    'bulk_discount_price' => $priceRow['bulk_discount_price'] ?? null,
                    'allow_loose_sale' => $priceRow['allow_loose_sale'] ?? false,
                    'min_order_qty' => $priceRow['min_order_qty'] ?? 1.00,
                    'step_qty' => $priceRow['step_qty'] ?? 1.00,
                    'pack_contain_qty' => $priceRow['pack_contain_qty'] ?? null,
                    'is_default_selling_unit' => $priceRow['is_default_selling_unit'] ?? false,
                ]);
            }
        });

        return back()->with('success', 'Product with images & Multi-UOM Matrix created successfully!');
    }

    /**
     * Update an existing product and its Multi-UOM Entry Matrix.
     */
    public function update(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['required', 'string', 'max:100', 'unique:products,sku,' . $product->id],
            'sub_category_id' => ['required', 'exists:sub_categories,id'],
            'brand_id' => ['nullable', 'exists:brands,id'],
            'base_uom_id' => ['required', 'exists:units_of_measure,id'],
            'description' => ['nullable', 'string'],
            'packing_rule_desc' => ['nullable', 'string'],
            'specifications' => ['nullable', 'array'],

            // Image validations
            'cover_image' => ['nullable'],
            'gallery_images' => ['nullable', 'array'],
            'remove_cover' => ['nullable', 'boolean'],
            'remove_gallery_images' => ['nullable', 'array'],

            'pricing_matrix' => ['required', 'array', 'min:1'],
            'pricing_matrix.*.uom_id' => ['required', 'exists:units_of_measure,id'],
            'pricing_matrix.*.conversion_factor' => ['required', 'numeric', 'min:0.0001'],
            'pricing_matrix.*.selling_price' => ['required', 'numeric', 'min:0'],
            'pricing_matrix.*.mrp' => ['nullable', 'numeric', 'min:0'],
            'pricing_matrix.*.bulk_discount_price' => ['nullable', 'numeric', 'min:0'],
            'pricing_matrix.*.allow_loose_sale' => ['boolean'],
            'pricing_matrix.*.min_order_qty' => ['required', 'numeric', 'min:0.01'],
            'pricing_matrix.*.step_qty' => ['required', 'numeric', 'min:0.01'],
            'pricing_matrix.*.pack_contain_qty' => ['nullable', 'numeric'],
            'pricing_matrix.*.is_default_selling_unit' => ['boolean'],
        ]);

        $coverPath = $product->cover_image;

        // Handle cover removal
        if ($request->boolean('remove_cover')) {
            if ($coverPath) {
                Storage::disk('public')->delete($coverPath);
            }
            $coverPath = null;
        }

        // Handle new cover upload
        if ($request->hasFile('cover_image')) {
            if ($coverPath) {
                Storage::disk('public')->delete($coverPath);
            }
            $coverPath = $request->file('cover_image')->store('products/covers', 'public');
        }

        // Handle gallery images
        $existingGallery = is_array($product->gallery_images) ? $product->gallery_images : [];

        // Remove selected gallery images
        if ($request->has('remove_gallery_images') && is_array($request->input('remove_gallery_images'))) {
            $toRemove = $request->input('remove_gallery_images');
            foreach ($toRemove as $path) {
                Storage::disk('public')->delete($path);
            }
            $existingGallery = array_values(array_diff($existingGallery, $toRemove));
        }

        // Append new gallery uploads
        if ($request->hasFile('gallery_images')) {
            foreach ($request->file('gallery_images') as $file) {
                $existingGallery[] = $file->store('products/gallery', 'public');
            }
        }

        DB::transaction(function () use ($product, $validated, $coverPath, $existingGallery) {
            $product->update([
                'name' => $validated['name'],
                'slug' => Str::slug($validated['name']),
                'sku' => $validated['sku'],
                'sub_category_id' => $validated['sub_category_id'],
                'brand_id' => $validated['brand_id'] ?? null,
                'base_uom_id' => $validated['base_uom_id'],
                'description' => $validated['description'] ?? null,
                'packing_rule_desc' => $validated['packing_rule_desc'] ?? null,
                'cover_image' => $coverPath,
                'gallery_images' => ! empty($existingGallery) ? array_values($existingGallery) : null,
                'specifications' => $validated['specifications'] ?? [],
            ]);

            // Sync UOM prices
            $product->uomPrices()->delete();

            foreach ($validated['pricing_matrix'] as $priceRow) {
                ProductUomPrice::create([
                    'product_id' => $product->id,
                    'uom_id' => $priceRow['uom_id'],
                    'conversion_factor' => $priceRow['conversion_factor'],
                    'selling_price' => $priceRow['selling_price'],
                    'mrp' => $priceRow['mrp'] ?? null,
                    'bulk_discount_price' => $priceRow['bulk_discount_price'] ?? null,
                    'allow_loose_sale' => $priceRow['allow_loose_sale'] ?? false,
                    'min_order_qty' => $priceRow['min_order_qty'] ?? 1.00,
                    'step_qty' => $priceRow['step_qty'] ?? 1.00,
                    'pack_contain_qty' => $priceRow['pack_contain_qty'] ?? null,
                    'is_default_selling_unit' => $priceRow['is_default_selling_unit'] ?? false,
                ]);
            }
        });

        return back()->with('success', 'Product, images and Multi-UOM Matrix updated successfully!');
    }

    /**
     * Remove the specified product and its media.
     */
    public function destroy(Product $product): RedirectResponse
    {
        if ($product->cover_image) {
            Storage::disk('public')->delete($product->cover_image);
        }

        if (is_array($product->gallery_images)) {
            foreach ($product->gallery_images as $img) {
                Storage::disk('public')->delete($img);
            }
        }

        $product->delete();

        return back()->with('success', 'Product deleted successfully!');
    }
}
