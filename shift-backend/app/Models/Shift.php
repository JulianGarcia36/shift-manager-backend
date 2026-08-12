<?php
 
namespace App\Models;
 
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
 
class Shift extends Model
{
    use HasFactory;
 
    protected $fillable = ['employee_id', 'date', 'start_time', 'end_time', 'type', 'color'];
 
    // Relación: Un turno pertenece a un empleado
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}