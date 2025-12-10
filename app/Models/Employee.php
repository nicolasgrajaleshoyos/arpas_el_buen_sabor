<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'position',
        'salary',
        'hire_date',
        'phone',
        'email'
    ];

    public function advances()
    {
        return $this->hasMany(EmployeeAdvance::class);
    }
}
