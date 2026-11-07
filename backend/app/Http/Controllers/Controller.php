<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: '1.0.0',
    title: 'PCForge API',
    description: 'API REST de e-commerce de componentes para armar PC. Autenticación JWT y pagos con Stripe.'
)]
#[OA\Server(url: 'http://localhost:8000/api', description: 'Servidor local')]
#[OA\SecurityScheme(
    securityScheme: 'bearerAuth',
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'Pega aquí el access_token obtenido en /auth/login'
)]
abstract class Controller
{
}