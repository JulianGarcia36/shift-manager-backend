<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Shift;
use App\Models\ShiftSwap;
use Illuminate\Http\Request;

class ShiftSwapController extends Controller
{
    // 1. El Admin ve todas las peticiones
    public function index()
    {
        return response()->json(ShiftSwap::all());
    }

    // Buzón PÚBLICO (sin login): el empleado usa su token, no un id.
    // Así el servidor verifica que el turno realmente sea suyo, en vez de
    // confiar en un employee_id que cualquiera podría inventar.
    public function publicStore(Request $request)
    {
        $validated = $request->validate([
            'shift_id' => 'required|exists:shifts,id',
            'token'    => 'required|string',
            'reason'   => 'nullable|string',
        ]);

        $employee = Employee::where('public_token', $validated['token'])->firstOrFail();
        $shift = Shift::findOrFail($validated['shift_id']);

        if ((int) $shift->employee_id !== (int) $employee->id) {
            abort(403, 'No puedes solicitar un cambio para un turno que no es tuyo.');
        }

        $swap = ShiftSwap::create([
            'shift_id' => $shift->id,
            'requesting_employee_id' => $employee->id,
            'reason' => $validated['reason'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json($swap, 201);
    }

    // Crear una solicitud desde el panel de administración (usuario ya
    // autenticado, así que aquí sí confiamos en el employee_id explícito).
    public function store(Request $request)
    {
        $validated = $request->validate([
            'shift_id' => 'required|exists:shifts,id',
            'requesting_employee_id' => 'required|exists:employees,id',
            'reason' => 'nullable|string',
        ]);

        $swap = ShiftSwap::create([
            ...$validated,
            'status' => 'pending',
        ]);

        return response()->json($swap, 201);
    }

    // 3. El Admin aprueba o rechaza el cambio, y decide qué pasa con el turno
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,rejected',
            // Qué hacer con el turno SOLO si status = approved:
            // 'reassign'  -> se lo pasa a otro empleado (suggested_employee_id)
            // 'unassign'  -> el turno queda sin nadie asignado (abierto)
            // 'none'      -> no tocar el turno, solo marcar la solicitud como resuelta
            'resolution_action' => 'nullable|in:reassign,unassign,none',
            'suggested_employee_id' => 'nullable|exists:employees,id',
        ]);

        $swap = ShiftSwap::findOrFail($id);
        $swap->status = $validated['status'];

        if (array_key_exists('suggested_employee_id', $validated)) {
            $swap->suggested_employee_id = $validated['suggested_employee_id'];
        }
        $swap->save();

        if ($swap->status === 'approved') {
            $action = $validated['resolution_action'] ?? 'none';
            $shift = Shift::find($swap->shift_id);

            if ($shift && $action === 'reassign' && $swap->suggested_employee_id) {
                $shift->employee_id = $swap->suggested_employee_id;
                $shift->save();
            } elseif ($shift && $action === 'unassign') {
                $shift->employee_id = null;
                $shift->save();
            }
            // 'none': no tocamos el turno, el admin ya lo resolvió de otra forma.
        }

        return response()->json($swap);
    }
}
