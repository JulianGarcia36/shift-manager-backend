<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureIsAdmin
{
    /**
     * Antes no existía ningún control de roles: cualquier usuario logueado
     * (incluido un sub-admin) podía crear o eliminar otros sub-admins,
     * porque las rutas solo pedían "estar logueado" (auth:sanctum), sin
     * revisar el rol. Este middleware corrige eso.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            abort(403, 'Esta acción requiere permisos de administrador.');
        }

        return $next($request);
    }
}
