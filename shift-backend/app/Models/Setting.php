<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    // Aquí le damos permiso a Laravel para guardar todos estos campos
    protected $fillable = [
        'company_name', 
        'industry', 
        'start_day', 
        'open_time', 
        'close_time', 
        'logo'
    ];
}
