<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddDetailsToShiftsTable extends Migration
{
    public function up()
    {
        Schema::table('shifts', function (Blueprint $table) {
            // Agregamos de un solo golpe todas las columnas que Laravel necesita
            if (!Schema::hasColumn('shifts', 'date')) {
                $table->date('date')->nullable();
            }
            if (!Schema::hasColumn('shifts', 'start_time')) {
                $table->string('start_time')->nullable();
            }
            if (!Schema::hasColumn('shifts', 'end_time')) {
                $table->string('end_time')->nullable();
            }
            if (!Schema::hasColumn('shifts', 'type')) {
                $table->string('type')->nullable();
            }
            if (!Schema::hasColumn('shifts', 'color')) {
                $table->string('color')->nullable();
            }
        });
    }

    public function down()
    {
        Schema::table('shifts', function (Blueprint $table) {
            $table->dropColumn(['date', 'start_time', 'end_time', 'type', 'color']);
        });
    }
}