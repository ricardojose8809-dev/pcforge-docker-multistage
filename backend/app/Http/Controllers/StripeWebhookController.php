<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use OpenApi\Attributes as OA;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;
use UnexpectedValueException;

class StripeWebhookController extends Controller
{
    #[OA\Post(
        path: '/stripe/webhook',
        summary: 'Webhook firmado de Stripe',
        description: 'Verifica Stripe-Signature y confirma un pago solo si coincide con la orden.',
        tags: ['Payments'],
        parameters: [
            new OA\Parameter(
                name: 'Stripe-Signature',
                in: 'header',
                required: true,
                schema: new OA\Schema(type: 'string')
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Evento recibido',
                content: new OA\JsonContent(properties: [
                    new OA\Property(
                        property: 'received',
                        type: 'boolean',
                        example: true
                    ),
                ])
            ),
            new OA\Response(
                response: 400,
                description: 'Firma invalida'
            ),
        ]
    )]
    public function handle(
        Request $request,
        OrderService $orders
    ): JsonResponse {
        try {
            $event = Webhook::constructEvent(
                $request->getContent(),
                (string) $request->header('Stripe-Signature'),
                (string) config('services.stripe.webhook_secret')
            );
        } catch (
            UnexpectedValueException |
            SignatureVerificationException
        ) {
            return response()->json([
                'message' => 'Firma invalida',
            ], 400);
        }

        if (! in_array($event->type, [
            'checkout.session.completed',
            'checkout.session.async_payment_succeeded',
            'checkout.session.expired',
        ], true)) {
            return response()->json(['received' => true]);
        }

        $session = $event->data->object;

        $orderId = data_get($session, 'metadata.order_id');
        $sessionId = data_get($session, 'id');

        if (
            ! is_scalar($orderId) ||
            ! ctype_digit((string) $orderId)
        ) {
            Log::notice(
                'Webhook Stripe sin metadata.order_id',
                [
                    'event_id' => $event->id,
                    'type' => $event->type,
                ]
            );

            return response()->json(['received' => true]);
        }

        $order = Order::query()->find((int) $orderId);

        if (! $order) {
            Log::notice(
                'Webhook Stripe sin orden asociada',
                [
                    'event_id' => $event->id,
                    'order_id' => $orderId,
                ]
            );

            return response()->json(['received' => true]);
        }

        if ($event->type === 'checkout.session.expired') {
            if (is_string($sessionId)) {
                $orders->cancel($order, $sessionId);
            }
        } elseif (! $orders->confirmPaidCheckout($order, $session)) {
            Log::warning(
                'Checkout no confirmado: sesion o pago no coincidente',
                [
                    'event_id' => $event->id,
                    'order_id' => $order->id,
                    'type' => $event->type,
                    'session_id' => $sessionId,
                    'payment_status' => data_get(
                        $session,
                        'payment_status'
                    ),
                ]
            );
        }

        return response()->json(['received' => true]);
    }
}