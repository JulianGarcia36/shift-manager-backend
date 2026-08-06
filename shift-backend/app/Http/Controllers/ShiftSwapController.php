<?php

namespace App\Http\Controllers;

use App\Models\ShiftSwap;
use App\Models\Shift;
use Illuminate\Http\Request;

class ShiftSwapController extends Controller
{
    // 1. El Admin ve todas las peticiones
    public function index()
    {
        return response()->json(ShiftSwap::all()); 
    }

    // NUEVO: Método exclusivo y garantizado para el buzón público
    public function publicStore(Request $request)
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

    // El Empleado envía la alerta (Versión protegida)
    public function store(Request $request)
    {
        return $this->publicStore($request);
    }

    // 3. El Admin aprueba o rechaza el cambio
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,rejected',
            'suggested_employee_id' => 'nullable|exists:employees,id',
        ]);

        $swap = ShiftSwap::findOrFail($id);
        $swap->status = $validated['status'];

        if (array_key_exists('suggested_employee_id', $validated)) {
            $swap->suggested_employee_id = $validated['suggested_employee_id'];
        }
        $swap->save();

        if ($swap->status === 'approved' && $swap->suggested_employee_id) {
            $shift = Shift::find($swap->shift_id);
            $shift->employee_id = $swap->suggested_employee_id;
            $shift->save();
        }

        return response()->json($swap);
    }
}
