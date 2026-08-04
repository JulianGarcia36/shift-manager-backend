<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShiftType extends Model
{
    use HasFactory;

    // ¡Esta es la línea mágica que soluciona tu error!
    protected $fillable = ['name', 'start_time', 'end_time', 'color'];
}
