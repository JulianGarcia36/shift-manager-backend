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
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'industry' => 'nullable|string|max:255',
            'start_day' => 'required|string',
            'open_time' => 'required|string',
            'close_time' => 'required|string',
            'logo' => 'nullable|string', // base64; el tamaño ya lo limita la columna LONGTEXT
        ]);

        $setting = Setting::first();
        
        if (!$setting) {
            $setting = new Setting();
        }

        $setting->company_name = $validated['company_name'];
        $setting->industry = $validated['industry'] ?? null;
        $setting->start_day = $validated['start_day'];
        $setting->open_time = $validated['open_time'];
        $setting->close_time = $validated['close_time'];

        if (array_key_exists('logo', $validated)) {
            $setting->logo = $validated['logo'];
        }

        $setting->save();

        return response()->json($setting);
    }
}