<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('settings', function (Blueprint $table) {
            $table->text('logo')->nullable(); // Guardaremos el logo aquí
        });
    }
    public function down(): void {
        Schema::table('settings', function (Blueprint $table) {
            $table->dropColumn('logo');
        });
    }
};
