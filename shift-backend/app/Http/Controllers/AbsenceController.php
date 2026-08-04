<?php
namespace App\Http\Controllers;

use App\Models\Absence;
use Illuminate\Http\Request;

class AbsenceController extends Controller
{
    // Listar todas las ausencias con los datos del empleado
    public function index()
    {
        return response()->json(Absence::with('employee')->orderBy('created_at', 'desc')->get());
    }

    // Crear una nueva solicitud de ausencia
    public function store(Request $request)
    {
        $absence = Absence::create($request->all());
        return response()->json($absence->load('employee'));
    }

    // Aprobar o rechazar (Actualizar estado)
    public function update(Request $request, $id)
    {
        $absence = Absence::findOrFail($id);
        $absence->update(['status' => $request->status]);
        return response()->json($absence->load('employee'));
    }
}
