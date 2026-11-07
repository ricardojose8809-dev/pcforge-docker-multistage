<?php

namespace App\Services;

use App\Models\Order;
use Stripe\StripeClient;

class StripeService
{
    public function createCheckoutSession(Order $order): string
    {
        $client = new StripeClient(config('services.stripe.secret'));
        $frontend = config('services.frontend_url');

        $session = $client->checkout->sessions->create([
            'mode' => 'payment',
            'client_reference_id' => (string) $order->id,
            'metadata' => ['order_id' => (string) $order->id],
            'line_items' => $order->items->map(fn ($item) => [
                'quantity' => $item->quantity,
                'price_data' => [
                    'currency' => 'usd',
                    'unit_amount' => (int) round((float) $item->unit_price * 100),
                    'product_data' => ['name' => $item->product->name],
                ],
            ])->values()->all(),
            'success_url' => "{$frontend}/checkout/success?order={$order->id}",
            'cancel_url' => "{$frontend}/cart",
        ]);

        $order->update(['stripe_session_id' => $session->id]);

        return $session->url;
    }
}