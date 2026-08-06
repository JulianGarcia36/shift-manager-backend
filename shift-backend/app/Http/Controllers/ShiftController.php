<?php
namespace App\Http\Controllers;

use App\Models\Shift;
use Illuminate\Http\Request;

class ShiftController extends Controller
{
    // Cargar los turnos del calendario
    public function index()
    {
        return response()->json(Shift::with('employee')->get());
    }

    // Crear un turno nuevo en el calendario
    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'nullable|exists:employees,id',
            'date'        => 'required|date',
            'start_time'  => 'required|string',
            'end_time'    => 'required|string',
            'type'        => 'nullable|string',
            'color'       => 'nullable|string',
        ]);

        $shift = Shift::create($validated);
        return response()->json($shift, 201);
    }

    // Actualizar un turno (cuando lo arrastras de un día a otro)
    public function update(Request $request, $id)
    {
        $shift = Shift::findOrFail($id);

        $validated = $request->validate([
            'employee_id' => 'nullable|exists:employees,id',
            'date'        => 'sometimes|required|date',
            'start_time'  => 'sometimes|required|string',
            'end_time'    => 'sometimes|required|string',
            'type'        => 'nullable|string',
            'color'       => 'nullable|string',
        ]);

        $shift->update($validated);
        return response()->json($shift);
    }

    // Eliminar un turno del calendario
    public function destroy($id)
    {
        Shift::findOrFail($id)->delete();
        return response()->json(['message' => 'Turno eliminado correctamente']);
    }
}
