<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MaterialTransaction extends Model
{
    protected $guarded = [];

    protected $casts = [
        'transaction_date' => 'datetime',
        'quantity' => 'decimal:2',
    ];
    
    public function rawMaterial()
    {
        return $this->belongsTo(RawMaterial::class);
    }
}
