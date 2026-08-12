<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'role', 'color'];

    // 'public_token' NO está en $fillable a propósito: así nadie puede
    // fijarlo o sobrescribirlo enviándolo en el body de una petición.
    // Se genera solo, de forma aleatoria, al crear el empleado.
    protected static function boot()
    {
        parent::boot();

        static::creating(function (Employee $employee) {
            if (empty($employee->public_token)) {
                $employee->public_token = Str::random(32);
            }
        });
    }

    public function shifts()
    {
        return $this->hasMany(Shift::class);
    }
}
