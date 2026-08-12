<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'admin' => \App\Http\Middleware\EnsureIsAdmin::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // FIX: sin esto, cuando un token no es válido en una ruta /api/*,
        // Laravel intenta redirigir a una ruta llamada "login" que no
        // existe en esta API (no es una app con vistas Blade), y eso
        // provoca un error 500 en vez de un simple 401. Con esto, cualquier
        // request a /api/* que no esté autenticado recibe un JSON limpio.
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, \Illuminate\Http\Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['message' => 'No autenticado. Inicia sesión de nuevo.'], 401);
            }
        });
    })->create();
