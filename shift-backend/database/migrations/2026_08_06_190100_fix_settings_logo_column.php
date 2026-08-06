<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * FIX: 2026_08_04_165151_change_logo_column_in_settings_table también quedó
 * vacía. La columna `logo` sigue siendo TEXT (~64KB en MySQL), pero
 * SettingsView.jsx guarda el logo como base64 y permite hasta ~500KB,
 * así que cualquier logo subido hará fallar el UPDATE con el mismo tipo
 * de error ("Data too long for column 'logo'").
 *
 * Usamos DB::statement con SQL crudo (ALTER TABLE ... MODIFY) en vez de
 * ->change() porque este proyecto no tiene doctrine/dbal instalado, que
 * Laravel requiere para usar Blueprint::change().
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('settings', 'logo')) {
            DB::statement('ALTER TABLE settings MODIFY logo LONGTEXT NULL');
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('settings', 'logo')) {
            DB::statement('ALTER TABLE settings MODIFY logo TEXT NULL');
        }
    }
};
