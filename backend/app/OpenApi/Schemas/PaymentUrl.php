<?php

namespace App\OpenApi\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'PaymentUrl',
    properties: [
        new OA\Property(property: 'url', type: 'string', example: 'https://checkout.stripe.com/c/pay/cs_test_...'),
    ]
)]
final class PaymentUrl
{
}