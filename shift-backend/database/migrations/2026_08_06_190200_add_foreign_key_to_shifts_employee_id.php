<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * MEJORA (no crítica): `employee_id` en `shifts` se agregó como
 * unsignedBigInteger suelto, sin relación real con `employees`. Eso permite
 * turnos con employee_id apuntando a empleados eliminados o inexistentes.
 * `absences` y `shift_swaps` sí usan ->constrained(), así que esto lo
 * alinea con el resto del proyecto.
 *
 * Antes de crear la constraint, ponemos en NULL cualquier employee_id
 * huérfano (que ya no exista en `employees`), para que el ALTER TABLE no
 * falle en producción si ya hay datos inconsistentes.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('
            UPDATE shifts
            LEFT JOIN employees ON employees.id = shifts.employee_id
            SET shifts.employee_id = NULL
            WHERE shifts.employee_id IS NOT NULL AND employees.id IS NULL
        ');

        Schema::table('shifts', function (Blueprint $table) {
            $table->foreign('employee_id')
                ->references('id')->on('employees')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('shifts', function (Blueprint $table) {
            $table->dropForeign(['employee_id']);
        });
    }
};
