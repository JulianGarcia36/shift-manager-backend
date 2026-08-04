<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    public function index()
    {
        return response()->json(Employee::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'role' => 'required|string',
            'color' => 'nullable|string'
        ]);

        $employee = Employee::create($validated);
        return response()->json($employee, 201);
    }

    // NUEVO: Función para actualizar un empleado existente
    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'role' => 'required|string',
            'color' => 'nullable|string'
        ]);

        $employee->update($validated);
        return response()->json($employee);
    }

    // NUEVO: Función para eliminar un empleado
    public function destroy(Employee $employee)
    {
        $employee->delete();
        return response()->json(['message' => 'Empleado eliminado correctamente']);
    }
}