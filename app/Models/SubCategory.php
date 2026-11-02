<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Product Sub Category with Specification Templates & Default UOM
 *
 * @property int $id
 * @property int $category_id
 * @property int $default_base_uom_id
 * @property string $name
 * @property string $code
 * @property string $slug
 * @property array<string, mixed>|null $spec_template
 * @property string|null $packing_rule_desc
 * @property bool $allows_loose_by_default
 * @property int $display_order
 * @property bool $is_active
 */
class SubCategory extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'category_id',
        'default_base_uom_id',
        'name',
        'code',
        'slug',
        'spec_template',
        'packing_rule_desc',
        'allows_loose_by_default',
        'display_order',
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
            'spec_template' => 'array',
            'allows_loose_by_default' => 'boolean',
            'display_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Parent Category.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Default Base UOM for this subcategory.
     */
    public function defaultBaseUom(): BelongsTo
    {
        return $this->belongsTo(UnitOfMeasure::class, 'default_base_uom_id');
    }

    /**
     * Approved Master Brands for this subcategory.
     */
    public function approvedBrands(): BelongsToMany
    {
        return $this->belongsToMany(Brand::class, 'sub_category_brand');
    }

    /**
     * Products belonging to this subcategory.
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}

