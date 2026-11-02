<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Brand Model
 *
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string|null $logo
 * @property bool $is_approved_master
 */
class Brand extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'slug',
        'logo',
        'is_approved_master',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_approved_master' => 'boolean',
        ];
    }

    /**
     * Subcategories associated with this brand.
     */
    public function subCategories(): BelongsToMany
    {
        return $this->belongsToMany(SubCategory::class, 'sub_category_brand');
    }

    /**
     * Products manufactured under this brand.
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}

