<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Credit extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_name',
        'total_amount',
        'paid_amount',
        'status'
    ];

    public function items()
    {
        return $this->hasMany(CreditItem::class);
    }

    public function payments()
    {
        return $this->hasMany(CreditPayment::class);
    }
}
