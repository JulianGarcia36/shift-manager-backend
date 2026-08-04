<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('company_name')->default('Mi Negocio S.A.S');
            $table->string('industry')->default('Restaurante');
            $table->string('start_day')->default('1'); // 1 = Lunes, 0 = Domingo
            $table->string('open_time')->default('08:00');
            $table->string('close_time')->default('22:00');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};