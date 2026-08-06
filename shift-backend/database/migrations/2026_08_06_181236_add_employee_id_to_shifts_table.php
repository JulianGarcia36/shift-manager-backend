public function up()
{
    Schema::table('shifts', function (Blueprint $table) {
        // Agregamos la columna faltante
        $table->unsignedBigInteger('employee_id')->nullable()->after('id');
    });
}

public function down()
{
    Schema::table('shifts', function (Blueprint $table) {
        $table->dropColumn('employee_id');
    });
}
