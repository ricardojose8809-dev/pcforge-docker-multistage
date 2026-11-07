<?php

namespace App\OpenApi\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'OrderSingle',
    properties: [
        new OA\Property(property: 'data', ref: '#/components/schemas/Order'),
    ]
)]
final class OrderSingle
{
}