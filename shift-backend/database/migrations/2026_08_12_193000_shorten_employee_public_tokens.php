<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Acorta los public_token existentes (32 caracteres) a la versión corta de
 * 10 caracteres, para que los enlaces sean más fáciles de compartir.
 *
 * IMPORTANTE: esto vuelve a invalidar los enlaces que ya hayas compartido
 * con empleados (los de 32 caracteres). Habrá que reenviarlos una vez más
 * después de este deploy — pero es la última vez que cambia el formato.
 */
return new class extends Migration
{
    public function up(): void
    {
        $employees = DB::table('employees')->get(['id']);

        foreach ($employees as $employee) {
            // Reintenta si por casualidad genera un token duplicado
            do {
                $token = Str::random(10);
            } while (DB::table('employees')->where('public_token', $token)->exists());

            DB::table('employees')->where('id', $employee->id)->update([
                'public_token' => $token,
            ]);
        }
    }

    public function down(): void
    {
        // No es necesario revertir: los tokens son intercambiables,
        // solo cambia su longitud.
    }
};
