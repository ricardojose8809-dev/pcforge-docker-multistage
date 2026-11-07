<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Usuario de prueba para Swagger y el frontend.
        // firstOrCreate evita errores si ejecutas el seeder más de una vez.
        User::firstOrCreate(
            ['email' => 'demo@pcforge.test'],
            [
                'name' => 'Demo',
                'password' => 'password123', // se cifra solo por el cast 'hashed' del modelo
            ],
        );

        $this->call([
            ProductSeeder::class,
        ]);
    }
}