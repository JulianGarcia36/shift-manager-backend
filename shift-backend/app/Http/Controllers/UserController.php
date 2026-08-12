<?php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // Mostrar solo a los sub-administradores
    public function index()
    {
        return response()->json(User::where('role', 'subadmin')->get());
    }

    // Crear un nuevo sub-administrador
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'subadmin'
        ]);

        return response()->json($user);
    }

    // Eliminar un sub-administrador
    public function destroy(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Nunca permitir borrarse a uno mismo (te dejaría sin acceso)
        if ($user->id === $request->user()->id) {
            abort(422, 'No puedes eliminar tu propia cuenta.');
        }

        // Esta pantalla es solo para sub-admins; nunca borrar otro admin
        // por aquí, aunque alguien mande su id directamente a la API.
        if ($user->role !== 'subadmin') {
            abort(422, 'Solo se pueden eliminar cuentas de sub-administrador.');
        }

        $user->delete();
        return response()->json(['message' => 'Eliminado correctamente']);
    }
}
