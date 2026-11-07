<?php

declare(strict_types=1);

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

require dirname(__DIR__) . '/vendor/autoload.php';
$app = require dirname(__DIR__) . '/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

// Nunca se ejecuta DatabaseSeeder: evita crear demo@pcforge.test/password123.
// No resetea stock ni duplica productos al reiniciar contenedores.
if (DB::table('products')->exists()) {
    echo "[PCForge] Catalogo existente; no se modifica.\n";
    exit(0);
}

$exitCode = Artisan::call('db:seed', [
    '--class' => 'Database\\Seeders\\ProductSeeder',
    '--force' => true,
]);
echo Artisan::output();
if ($exitCode !== 0) {
    exit($exitCode);
}
echo "[PCForge] Productos iniciales creados.\n";
