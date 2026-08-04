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
    public function destroy($id)
    {
        User::findOrFail($id)->delete();
        return response()->json(['message' => 'Eliminado correctamente']);
    }
}
