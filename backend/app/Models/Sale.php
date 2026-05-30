<?php

namespace App\Models;

use App\Enums\PaymentMethod;
use App\Enums\SaleStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int              $id
 * @property int              $user_id
 * @property string|null      $customer_name
 * @property SaleStatus       $status
 * @property PaymentMethod    $payment_method
 * @property float            $total
 * @property string|null      $notes
 * @property \Carbon\Carbon|null $paid_at
 */
class Sale extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'customer_name',
        'status',
        'payment_method',
        'total',
        'notes',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'status'         => SaleStatus::class,
            'payment_method' => PaymentMethod::class,
            'total'          => 'decimal:2',
            'paid_at'        => 'datetime',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<SaleItem, $this> */
    public function items(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    /** @return HasMany<SaleService, $this> */
    public function services(): HasMany
    {
        return $this->hasMany(SaleService::class);
    }
}
