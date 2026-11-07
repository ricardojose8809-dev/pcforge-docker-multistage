<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'Product',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'name', type: 'string', example: 'AMD Ryzen 5 7600X'),
        new OA\Property(property: 'description', type: 'string', example: 'Procesador de 6 núcleos para gaming.'),
        new OA\Property(property: 'price', type: 'number', format: 'float', example: 229.00),
        new OA\Property(property: 'stock', type: 'integer', example: 25),
        new OA\Property(property: 'category', type: 'string', example: 'CPU'),
        new OA\Property(property: 'image_url', type: 'string', nullable: true, example: 'https://picsum.photos/seed/pc1/600/600'),
    ]
)]
class ProductResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'price' => (float) $this->price,
            'stock' => $this->stock,
            'category' => $this->category,
            'image_url' => $this->image_url,
        ];
    }
}