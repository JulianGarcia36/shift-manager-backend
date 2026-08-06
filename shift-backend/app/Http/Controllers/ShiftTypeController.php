<?php
namespace App\Http\Controllers;

use App\Models\ShiftType;
use Illuminate\Http\Request;

class ShiftTypeController extends Controller
{
    // Mostrar todas las plantillas
    public function index()
    {
        return response()->json(ShiftType::all());
    }

    // Guardar una nueva plantilla
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'       => 'required|string',
            'start_time' => 'required|string',
            'end_time'   => 'required|string',
            'color'      => 'required|string',
        ]);

        $shiftType = ShiftType::create($validated);
        return response()->json($shiftType, 201);
    }

    // Eliminar una plantilla
    public function destroy($id)
    {
        ShiftType::findOrFail($id)->delete();
        return response()->json(['message' => 'Eliminado correctamente']);
    }
}
