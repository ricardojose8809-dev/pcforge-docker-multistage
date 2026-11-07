<?php

namespace App\OpenApi\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'ProductSingle',
    properties: [
        new OA\Property(property: 'data', ref: '#/components/schemas/Product'),
    ]
)]
final class ProductSingle
{
}