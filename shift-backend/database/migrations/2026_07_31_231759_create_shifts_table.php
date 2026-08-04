<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shift_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');       // Nombre (Ej: Turno Mañana)
            $table->string('start_time'); // Hora inicio (Ej: 08:00 AM)
            $table->string('end_time');   // Hora fin (Ej: 04:00 PM)
            $table->string('color');      // Color (Ej: bg-state-blue)
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shift_types');
    }
};
