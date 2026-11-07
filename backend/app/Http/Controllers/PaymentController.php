<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\StripeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use OpenApi\Attributes as OA;
use Stripe\Exception\ApiErrorException;

class PaymentController extends Controller
{
    #[OA\Post(
        path: '/orders/{order}/pay',
        summary: 'Crear sesión de pago en Stripe Checkout',
        security: [['bearerAuth' => []]],
        tags: ['Payments'],
        parameters: [
            new OA\Parameter(name: 'order', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 1),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'URL de Stripe Checkout',
                content: new OA\JsonContent(ref: '#/components/schemas/PaymentUrl')
            ),
            new OA\Response(
                response: 401,
                description: 'No autenticado',
                content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')
            ),
            new OA\Response(
                response: 403,
                description: 'La orden es ajena o ya no está pendiente',
                content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')
            ),
            new OA\Response(
                response: 404,
                description: 'Orden no encontrada',
                content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')
            ),
            new OA\Response(
                response: 502,
                description: 'Stripe no respondió',
                content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')
            ),
        ]
    )]
    public function pay(Order $order, StripeService $stripe): JsonResponse
    {
        Gate::authorize('pay', $order);

        try {
            $url = $stripe->createCheckoutSession($order->load('items.product'));
        } catch (ApiErrorException $e) {
            report($e);

            return response()->json(['message' => 'No se pudo iniciar el pago'], 502);
        }

        return response()->json(['url' => $url]);
    }
}