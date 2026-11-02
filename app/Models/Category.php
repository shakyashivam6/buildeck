<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

/**
 * Product Master Category
 *
 * @property int $id
 * @property string $name
 * @property string $code
 * @property string $slug
 * @property string|null $icon
 * @property int $display_order
 * @property bool $is_active
 */
class Category extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'code',
        'slug',
        'icon',
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
            'display_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Subcategories associated with this category.
     */
    public function subCategories(): HasMany
    {
        return $this->hasMany(SubCategory::class)->orderBy('display_order');
    }

    /**
     * Products belonging to this category through subcategories.
     */
    public function products(): HasManyThrough
    {
        return $this->hasManyThrough(Product::class, SubCategory::class);
    }
}

