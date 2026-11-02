<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Unit of Measure (UOM) Model
 *
 * @property int $id
 * @property string $name
 * @property string $code
 * @property string $symbol
 * @property string $unit_category
 * @property bool $is_discrete
 */
class UnitOfMeasure extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'units_of_measure';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'code',
        'symbol',
        'unit_category',
        'is_discrete',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_discrete' => 'boolean',
        ];
    }

    /**
     * Subcategories using this unit as default base UOM.
     */
    public function subCategories(): HasMany
    {
        return $this->hasMany(SubCategory::class, 'default_base_uom_id');
    }

    /**
     * Products using this unit as base UOM.
     */
    public function baseProducts(): HasMany
    {
        return $this->hasMany(Product::class, 'base_uom_id');
    }

    /**
     * Pricing matrix records mapped to this UOM.
     */
    public function productPrices(): HasMany
    {
        return $this->hasMany(ProductUomPrice::class, 'uom_id');
    }
}

