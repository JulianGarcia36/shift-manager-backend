<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * FIX DE SEGURIDAD: hasta ahora los enlaces del "Portal de Empleado"
 * (/empleado/{id}) usaban el id autoincremental de la tabla employees.
 * Eso permitía a cualquiera probar /empleado/1, /empleado/2, /empleado/3...
 * y ver los datos de cualquier empleado, además de que las rutas
 * GET /employees y GET /shifts eran públicas y devolvían TODOS los
 * empleados y TODOS los turnos sin filtrar en el servidor.
 *
 * Esta migración agrega un token aleatorio e impredecible por empleado,
 * que reemplaza al id en los enlaces públicos. Los endpoints públicos
 * nuevos filtran los datos en el servidor usando ese token, así que ya
 * no se puede enumerar ni ver información de otros empleados.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('employees', 'public_token')) {
            Schema::table('employees', function (Blueprint $table) {
                $table->string('public_token', 40)->nullable()->unique()->after('id');
            });
        }

        // Genera un token para los empleados que ya existen
        $employees = DB::table('employees')->whereNull('public_token')->get(['id']);
        foreach ($employees as $employee) {
            DB::table('employees')->where('id', $employee->id)->update([
                'public_token' => Str::random(32),
            ]);
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('employees', 'public_token')) {
            Schema::table('employees', function (Blueprint $table) {
                $table->dropColumn('public_token');
            });
        }
    }
};
