<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Product Master
 *
 * @property int $id
 * @property int|null $vendor_id
 * @property int $sub_category_id
 * @property int|null $brand_id
 * @property int $base_uom_id
 * @property string $name
 * @property string $slug
 * @property string|null $sku
 * @property string|null $description
 * @property array<string, mixed>|null $specifications
 * @property string|null $packing_rule_desc
 * @property string|null $cover_image
 * @property array<string>|null $gallery_images
 * @property bool $is_active
 */
class Product extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = [
        'cover_image_url',
        'gallery_image_urls',
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'vendor_id',
        'sub_category_id',
        'brand_id',
        'base_uom_id',
        'name',
        'slug',
        'sku',
        'description',
        'specifications',
        'packing_rule_desc',
        'cover_image',
        'gallery_images',
        'is_active',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'specifications' => 'array',
            'gallery_images' => 'array',
            'is_active' => 'boolean',
        ];
    }

    /**
     * URL of the cover image.
     */
    public function getCoverImageUrlAttribute(): ?string
    {
        if (! $this->cover_image) {
            return null;
        }

        if (str_starts_with($this->cover_image, 'http://') || str_starts_with($this->cover_image, 'https://')) {
            return $this->cover_image;
        }

        return asset('storage/' . $this->cover_image);
    }

    /**
     * URLs of gallery images.
     *
     * @return list<string>
     */
    public function getGalleryImageUrlsAttribute(): array
    {
        if (! is_array($this->gallery_images) || empty($this->gallery_images)) {
            return [];
        }

        return array_values(array_map(function ($img) {
            if (str_starts_with($img, 'http://') || str_starts_with($img, 'https://')) {
                return $img;
            }

            return asset('storage/' . $img);
        }, $this->gallery_images));
    }

    /**
     * Sub Category.
     */
    public function subCategory(): BelongsTo
    {
        return $this->belongsTo(SubCategory::class);
    }

    /**
     * Brand.
     */
    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    /**
     * Base UOM for standardized inventory and conversions.
     */
    public function baseUom(): BelongsTo
    {
        return $this->belongsTo(UnitOfMeasure::class, 'base_uom_id');
    }

    /**
     * Vendor Profile (if vendor-specific product).
     */
    public function vendor(): BelongsTo
    {
        return $this->belongsTo(VendorProfile::class, 'vendor_id');
    }

    /**
     * All Unit Pricing configurations for this product.
     */
    public function uomPrices(): HasMany
    {
        return $this->hasMany(ProductUomPrice::class);
    }

    /**
     * Primary / Default e-commerce selling unit price.
     */
    public function defaultUomPrice(): HasOne
    {
        return $this->hasOne(ProductUomPrice::class)->where('is_default_selling_unit', true);
    }
}

