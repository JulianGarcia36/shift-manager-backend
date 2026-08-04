<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\ShiftController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ShiftSwapController;

// ----------------------------------------------------
// RUTAS PÚBLICAS (No requieren estar logueado)
// ----------------------------------------------------
Route::post('/login', [AuthController::class, 'login']);
Route::get('/shifts', [ShiftController::class, 'index']); // Los empleados ven el calendario
Route::get('/employees', [EmployeeController::class, 'index']); // Los empleados ven la lista

// Buzón público para que los empleados envíen alertas sin token (100% libre)
Route::post('/public-shift-swaps', [ShiftSwapController::class, 'publicStore']);


// ----------------------------------------------------
// RUTAS PROTEGIDAS (Solo el Admin logueado puede entrar)
// ----------------------------------------------------
Route::middleware('auth:sanctum')->group(function () {
    
    // Autenticación
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Empleados (Crear, actualizar, eliminar)
    Route::post('/employees', [EmployeeController::class, 'store']);
    Route::put('/employees/{employee}', [EmployeeController::class, 'update']);
    Route::delete('/employees/{employee}', [EmployeeController::class, 'destroy']);
    
    // Turnos del calendario (Crear, actualizar, eliminar)
    Route::post('/shifts', [ShiftController::class, 'store']);
    Route::put('/shifts/{shift}', [ShiftController::class, 'update']);
    Route::delete('/shifts/{shift}', [ShiftController::class, 'destroy']);

    // Tipos de Turnos Predeterminados
    Route::apiResource('shift-types', App\Http\Controllers\ShiftTypeController::class);

    // Ausencias y Permisos
    Route::apiResource('absences', App\Http\Controllers\AbsenceController::class);

    // Configuración General
    Route::get('/settings', [App\Http\Controllers\SettingController::class, 'index']);
    Route::put('/settings', [App\Http\Controllers\SettingController::class, 'update']);

    // Seguridad (Cambiar contraseña)
    Route::put('/user/password', [App\Http\Controllers\SecurityController::class, 'updatePassword']);

    // Gestión de Sub-administradores
    Route::apiResource('users', App\Http\Controllers\UserController::class)->except(['show', 'update']);

    // DIRECCIÓN WEB (Gestión de Intercambios para el Admin)
    Route::apiResource('shift-swaps', ShiftSwapController::class);
});