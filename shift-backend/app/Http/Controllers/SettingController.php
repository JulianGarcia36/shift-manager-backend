<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    // Cargar la configuración al abrir la página
    public function index()
    {
        $setting = Setting::first();
        
        if (!$setting) {
            $setting = Setting::create([
                'company_name' => 'Mi Negocio',
                'industry' => 'General',
                'start_day' => '1',
                'open_time' => '08:00',
                'close_time' => '22:00',
            ]);
        }
        
        return response()->json($setting);
    }

    // Guardar los cambios (Aquí estaba el bloqueador)
    public function update(Request $request)
    {
        $setting = Setting::first();
        
        if (!$setting) {
            $setting = new Setting();
        }

        // Le ordenamos a Laravel que guarde cada campo sin excepción
        $setting->company_name = $request->company_name;
        $setting->industry = $request->industry;
        $setting->start_day = $request->start_day;
        $setting->open_time = $request->open_time;
        $setting->close_time = $request->close_time;
        
        // El permiso especial para el logo
        if ($request->has('logo')) {
            $setting->logo = $request->logo;
        }

        $setting->save();

        return response()->json($setting);
    }
}