<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Absence extends Model
{
    use HasFactory;
    protected $fillable = ['employee_id', 'date', 'reason', 'status'];

    // Relación: Una ausencia pertenece a un empleado
    public function employee() {
        return $this->belongsTo(Employee::class);
    }
}