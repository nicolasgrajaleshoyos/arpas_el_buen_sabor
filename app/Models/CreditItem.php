<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CreditItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'credit_id',
        'product_id',
        'product_name',
        'quantity',
        'unit_price',
        'total'
    ];

    public function credit()
    {
        return $this->belongsTo(Credit::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
