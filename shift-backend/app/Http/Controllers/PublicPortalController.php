<?php

namespace App\Http\Controllers;

use App\Models\Employee;

class PublicPortalController extends Controller
{
    // Datos mínimos del empleado dueño del enlace (nunca la lista completa)
    public function show($token)
    {
        $employee = Employee::where('public_token', $token)->firstOrFail();

        return response()->json([
            'id'   => $employee->id,
            'name' => $employee->name,
            'role' => $employee->role,
            'color' => $employee->color,
        ]);
    }

    // Solo los turnos de ESE empleado, filtrados en el servidor (SQL),
    // no en el navegador como antes.
    public function shifts($token)
    {
        $employee = Employee::where('public_token', $token)->firstOrFail();

        $shifts = $employee->shifts()->orderBy('date')->get();

        return response()->json($shifts);
    }
}
