<?php

namespace App\Models;

use App\Enums\MovementType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int          $id
 * @property int          $product_id
 * @property int          $user_id
 * @property MovementType $type
 * @property int          $quantity
 * @property string|null  $notes
 */
class Movement extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'user_id',
        'type',
        'quantity',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'type'     => MovementType::class,
            'quantity' => 'integer',
        ];
    }

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
