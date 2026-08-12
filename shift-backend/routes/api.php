<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\ShiftController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ShiftSwapController;
use App\Http\Controllers\PublicPortalController;

// ----------------------------------------------------
// RUTAS PÚBLICAS (No requieren estar logueado)
// ----------------------------------------------------
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:6,1');

// Portal público por empleado: SOLO datos de ESE empleado (filtrado en el
// servidor con su token, no la lista completa de la empresa).
// throttle: límite de intentos, ya que el token es corto y legible.
Route::middleware('throttle:30,1')->group(function () {
    Route::get('/public/employees/{token}', [PublicPortalController::class, 'show']);
    Route::get('/public/employees/{token}/shifts', [PublicPortalController::class, 'shifts']);
    Route::get('/public/employees/{token}/shift-swaps', [PublicPortalController::class, 'shiftSwaps']);
});

// Buzón público para que los empleados soliciten cambios de turno.
// Verifica identidad por token en el controlador (ver ShiftSwapController).
Route::post('/public-shift-swaps', [ShiftSwapController::class, 'publicStore']);


// ----------------------------------------------------
// RUTAS PROTEGIDAS (Solo el Admin/Sub-admin logueado puede entrar)
// ----------------------------------------------------
Route::middleware('auth:sanctum')->group(function () {

    // Autenticación
    Route::post('/logout', [AuthController::class, 'logout']);

    // Empleados: listar (panel admin), crear, actualizar, eliminar.
    // Antes /employees (index) era público; ahora requiere estar logueado.
    Route::get('/employees', [EmployeeController::class, 'index']);
    Route::post('/employees', [EmployeeController::class, 'store']);
    Route::put('/employees/{employee}', [EmployeeController::class, 'update']);
    Route::delete('/employees/{employee}', [EmployeeController::class, 'destroy']);

    // Turnos del calendario: listar (panel admin), crear, actualizar, eliminar.
    // Antes /shifts (index) era público; ahora requiere estar logueado.
    Route::get('/shifts', [ShiftController::class, 'index']);
    Route::post('/shifts', [ShiftController::class, 'store']);
    Route::put('/shifts/{shift}', [ShiftController::class, 'update']);
    Route::delete('/shifts/{shift}', [ShiftController::class, 'destroy']);

    // Tipos de Turnos Predeterminados (el controlador solo implementa index/store/destroy)
    Route::apiResource('shift-types', App\Http\Controllers\ShiftTypeController::class)
        ->only(['index', 'store', 'destroy']);

    // Ausencias y Permisos
    Route::apiResource('absences', App\Http\Controllers\AbsenceController::class);

    // Configuración General
    Route::get('/settings', [App\Http\Controllers\SettingController::class, 'index']);
    Route::put('/settings', [App\Http\Controllers\SettingController::class, 'update']);

    // Seguridad (Cambiar contraseña)
    Route::put('/user/password', [App\Http\Controllers\SecurityController::class, 'updatePassword']);

    // Gestión de Sub-administradores: solo un admin puede crear/eliminar otros.
    // Antes cualquier usuario logueado (incluido un sub-admin) podía hacerlo.
    Route::middleware('admin')->group(function () {
        Route::apiResource('users', App\Http\Controllers\UserController::class)->except(['show', 'update']);
    });

    // Gestión de Intercambios para el Admin
    Route::apiResource('shift-swaps', ShiftSwapController::class);
});
