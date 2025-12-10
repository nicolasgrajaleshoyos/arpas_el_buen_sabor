<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Payroll extends Model
{
    use HasFactory;

    protected $fillable = [
        'month',
        'year',
        'employees',
        'total',
        'generated_date'
    ];

    protected $casts = [
        'employees' => 'array',
        'generated_date' => 'datetime'
    ];
}
