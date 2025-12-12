<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    protected $fillable = [
        'product_id',
        'product_name',
        'quantity',
        'unit_price',
        'total',
        'description',
        'sale_date',
        'status',
        'returned_at',
        'cash_amount',
        'transfer_amount',
        'payment_method'
    ];

    protected $casts = [
        'sale_date' => 'datetime',
        'returned_at' => 'datetime',
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
