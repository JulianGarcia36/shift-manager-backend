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
        $shiftType = ShiftType::create($request->all());
        return response()->json($shiftType);
    }

    // Eliminar una plantilla
    public function destroy($id)
    {
        ShiftType::destroy($id);
        return response()->json(['message' => 'Eliminado correctamente']);
    }
}