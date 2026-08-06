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
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'date'        => 'required|date',
            'reason'      => 'required|string',
            'status'      => 'nullable|in:Pendiente,Aprobado,Rechazado',
        ]);

        $absence = Absence::create($validated);
        return response()->json($absence->load('employee'), 201);
    }

    // Aprobar o rechazar (Actualizar estado)
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:Pendiente,Aprobado,Rechazado',
        ]);

        $absence = Absence::findOrFail($id);
        $absence->update($validated);
        return response()->json($absence->load('employee'));
    }
}
