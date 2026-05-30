<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property string $name
 * @property string $barcode
 * @property string|null $description
 * @property string|null $brand
 * @property string|null $size
 * @property float $price_cost
 * @property float $price_sale
 * @property int $quantity
 * @property int $min_stock
 * @property bool $active
 */
class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'barcode',
        'description',
        'brand',
        'size',
        'price_cost',
        'price_sale',
        'quantity',
        'min_stock',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'price_cost' => 'decimal:2',
            'price_sale' => 'decimal:2',
            'quantity' => 'integer',
            'min_stock' => 'integer',
            'active' => 'boolean',
        ];
    }

    /** @return HasMany<Movement, $this> */
    public function movements(): HasMany
    {
        return $this->hasMany(Movement::class);
    }

    /** @return HasMany<SaleItem, $this> */
    public function saleItems(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }
}
