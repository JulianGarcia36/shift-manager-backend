<?php
namespace App\Http\Controllers;

use App\Models\Shift;
use Illuminate\Http\Request;

class ShiftController extends Controller
{
    // Cargar los turnos del calendario
    public function index()
    {
        return response()->json(Shift::all());
    }

    // Crear un turno nuevo en el calendario
    public function store(Request $request)
    {
        $shift = Shift::create($request->all());
        return response()->json($shift);
    }

    // Actualizar un turno (cuando lo arrastras de un día a otro)
    public function update(Request $request, $id)
    {
        $shift = Shift::findOrFail($id);
        $shift->update($request->all());
        return response()->json($shift);
    }

    // Eliminar un turno del calendario
    public function destroy($id)
    {
        Shift::destroy($id);
        return response()->json(['message' => 'Turno eliminado correctamente']);
    }
}