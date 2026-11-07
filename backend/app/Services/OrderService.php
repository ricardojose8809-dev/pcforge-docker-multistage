<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderService
{
    /**
     * @param array<int, array{product_id: int, quantity: int}> $items
     */
    public function create(User $user, array $items): Order
    {
        return DB::transaction(function () use ($user, $items) {
            $products = Product::whereIn('id', array_column($items, 'product_id'))
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $order = $user->orders()->create([
                'status' => 'pending',
                'total' => 0,
            ]);

            $total = 0.0;

            foreach ($items as $item) {
                $product = $products[$item['product_id']];

                if ($product->stock < $item['quantity']) {
                    throw ValidationException::withMessages([
                        'items' => ["Stock insuficiente de {$product->name}"],
                    ]);
                }

                $product->decrement('stock', $item['quantity']);

                $order->items()->create([
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $product->price,
                ]);

                $total += (float) $product->price * $item['quantity'];
            }

            $order->update([
                'total' => round($total, 2),
            ]);

            return $order->load('items.product');
        });
    }

    /**
     * Comprueba que una sesión de Stripe pertenece
     * exactamente a la orden y tiene un pago confirmado.
     *
     * La sesión debe provenir de un webhook firmado
     * o de una consulta autenticada a Stripe.
     */
    public function checkoutSessionMatches(
        Order $order,
        object $session
    ): bool {
        $sessionId = data_get($session, 'id');
        $reference = data_get($session, 'client_reference_id');
        $metadataOrderId = data_get($session, 'metadata.order_id');
        $amountTotal = data_get($session, 'amount_total');
        $currency = data_get($session, 'currency');

        return is_string($sessionId)
            && is_string($order->stripe_session_id)
            && hash_equals($order->stripe_session_id, $sessionId)
            && (string) $reference === (string) $order->id
            && (string) $metadataOrderId === (string) $order->id
            && data_get($session, 'mode') === 'payment'
            && data_get($session, 'status') === 'complete'
            && data_get($session, 'payment_status') === 'paid'
            && is_int($amountTotal)
            && $amountTotal === (int) round((float) $order->total * 100)
            && is_string($currency)
            && strtolower($currency) === 'usd';
    }

    /**
     * Confirma el pago con bloqueo de fila
     * y procesamiento idempotente.
     */
    public function confirmPaidCheckout(
        Order $order,
        object $session
    ): bool {
        return DB::transaction(function () use ($order, $session): bool {
            $locked = Order::query()
                ->whereKey($order->getKey())
                ->lockForUpdate()
                ->first();

            if (
                ! $locked ||
                ! $this->checkoutSessionMatches($locked, $session)
            ) {
                return false;
            }

            if ($locked->status === 'paid') {
                return true;
            }

            if ($locked->status !== 'pending') {
                return false;
            }

            $locked->update(['status' => 'paid']);

            return true;
        });
    }

    /**
     * Cancela una orden pendiente.
     * La reposición del stock se ejecuta una sola vez.
     */
    public function cancel(
        Order $order,
        ?string $sessionId = null
    ): void {
        DB::transaction(function () use ($order, $sessionId): void {
            $locked = Order::query()
                ->whereKey($order->getKey())
                ->lockForUpdate()
                ->first();

            if (! $locked || $locked->status !== 'pending') {
                return;
            }

            if (
                $sessionId !== null &&
                $locked->stripe_session_id !== $sessionId
            ) {
                return;
            }

            $locked->load('items');

            foreach ($locked->items as $item) {
                Product::whereKey($item->product_id)
                    ->increment('stock', $item->quantity);
            }

            $locked->update(['status' => 'cancelled']);
        });
    }
}