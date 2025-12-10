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
        'sale_date',
        'status',
        'returned_at'
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
