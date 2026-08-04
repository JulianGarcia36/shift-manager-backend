<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShiftSwap extends Model
{
    use HasFactory;

    protected $fillable = [
        'shift_id',
        'requesting_employee_id',
        'reason',
        'status',
        'suggested_employee_id'
    ];
}
