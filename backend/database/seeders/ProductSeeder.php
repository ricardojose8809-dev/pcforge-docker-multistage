<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            ['AMD Ryzen 5 7600X', 'CPU', 229], ['Intel Core i5-14600K', 'CPU', 319],
            ['AMD Ryzen 7 7800X3D', 'CPU', 399], ['NVIDIA RTX 4060 8GB', 'GPU', 299],
            ['NVIDIA RTX 4070 Super', 'GPU', 599], ['AMD Radeon RX 7800 XT', 'GPU', 489],
            ['Corsair Vengeance 16GB DDR5', 'RAM', 69], ['G.Skill Trident Z5 32GB DDR5', 'RAM', 129],
            ['ASUS TUF B650-PLUS', 'Motherboard', 199], ['MSI MAG Z790 Tomahawk', 'Motherboard', 259],
            ['Samsung 980 Pro 1TB NVMe', 'Storage', 99], ['WD Black SN850X 2TB', 'Storage', 159],
            ['Corsair RM750e 750W', 'PSU', 109], ['Seasonic Focus GX-850', 'PSU', 149],
            ['NZXT H510 Flow', 'Case', 89], ['Lian Li Lancool 216', 'Case', 99],
            ['Noctua NH-D15', 'Cooling', 109], ['Arctic Liquid Freezer III 360', 'Cooling', 119],
            ['Cooler Master Hyper 212', 'Cooling', 39], ['Kingston Fury 16GB DDR4', 'RAM', 45],
        ];

        foreach ($items as $i => [$name, $category, $price]) {
            Product::create([
                'name' => $name,
                'category' => $category,
                'price' => $price,
                'stock' => 25,
                'description' => "$name. Componente de la categoría $category ideal para tu próximo build.",
                'image_url' => 'https://picsum.photos/seed/pc' . ($i + 1) . '/600/600',
            ]);
        }
    }
}