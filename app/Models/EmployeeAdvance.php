<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class EmployeeAdvance extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'amount',
        'request_date',
        'reason',
        'status'
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
