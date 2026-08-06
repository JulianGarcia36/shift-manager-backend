<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * FIX: La migración 2026_08_06_182813_add_details_to_shifts_table quedó vacía
 * (nunca se completó su método up()), por eso 'date' y 'type' nunca se crearon
 * en producción, aunque el modelo Shift y el frontend ya las esperaban.
 *
 * IMPORTANTE: no editamos esa migración vieja porque Laravel ya la registró
 * como ejecutada en la tabla `migrations` de Railway; editar un archivo ya
 * corrido no vuelve a ejecutarlo. Por eso creamos esta migración nueva.
 *
 * De paso eliminamos la columna `name`, que quedó de la versión original de
 * la tabla: no está en $fillable del modelo ni la envía el frontend, pero es
 * NOT NULL sin default. Con strict mode activo (config/database.php) eso
 * hace fallar el INSERT igualmente en cuanto se corrija 'date'.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shifts', function (Blueprint $table) {
            if (!Schema::hasColumn('shifts', 'date')) {
                $table->date('date')->nullable()->after('employee_id');
            }
            if (!Schema::hasColumn('shifts', 'type')) {
                $table->string('type')->nullable()->after('end_time');
            }
        });

        if (Schema::hasColumn('shifts', 'name')) {
            Schema::table('shifts', function (Blueprint $table) {
                $table->dropColumn('name');
            });
        }
    }

    public function down(): void
    {
        Schema::table('shifts', function (Blueprint $table) {
            if (Schema::hasColumn('shifts', 'date')) {
                $table->dropColumn('date');
            }
            if (Schema::hasColumn('shifts', 'type')) {
                $table->dropColumn('type');
            }
            if (!Schema::hasColumn('shifts', 'name')) {
                $table->string('name')->default('Turno');
            }
        });
    }
};
