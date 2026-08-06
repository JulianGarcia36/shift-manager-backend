<?php

// Este archivo no existía en el proyecto. Sin él, Laravel no agrega las
// cabeceras CORS y el navegador bloquea las peticiones que el frontend en
// Vercel hace hacia la API en Railway (especialmente el preflight OPTIONS
// que dispara cualquier POST/PUT con JSON + header Authorization).
//
// Define FRONTEND_URL en el .env de Railway con el dominio exacto de tu
// frontend en Vercel, por ejemplo: https://mi-app.vercel.app

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter([
        env('FRONTEND_URL'),
        'http://localhost:5173', // Vite en desarrollo local
    ]),

    'allowed_origins_patterns' => [
        // Permite previews de Vercel tipo https://mi-app-git-branch-usuario.vercel.app
        '#^https://.*\.vercel\.app$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Usamos tokens Bearer (Sanctum), no cookies de sesión, así que no
    // necesitamos credenciales de CORS.
    'supports_credentials' => false,
];
