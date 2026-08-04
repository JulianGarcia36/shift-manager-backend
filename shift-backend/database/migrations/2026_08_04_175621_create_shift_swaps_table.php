<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('shift_swaps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shift_id')->constrained()->onDelete('cascade');
            $table->foreignId('requesting_employee_id')->constrained('employees')->onDelete('cascade');
            // suggested_employee_id puede quedar vacío hasta que el sistema o el admin recomiende a alguien
            $table->foreignId('suggested_employee_id')->nullable()->constrained('employees')->onDelete('set null');
            $table->string('reason')->nullable(); // Por qué no puede asistir
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('shift_swaps');
    }
};