<?php

namespace App\Console\Commands;

use App\Models\Order;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Stripe\StripeClient;
use Throwable;

class ReconcileStripePayments extends Command
{
    protected $signature = 'stripe:reconcile-payments
        {--order=* : ID de la orden}
        {--apply : Confirmar pagos verificados}';

    protected $description = 'Verificar y reconciliar pagos de Stripe con Laravel';

    public function handle(): int
    {
        $secret = (string) config('services.stripe.secret');

        if (!str_starts_with($secret, 'sk_test_')) {
            $this->error('Solo se permiten claves Stripe de prueba.');

            return self::FAILURE;
        }

        $ids = $this->option('order');

        if (empty($ids)) {
            $this->error('Debes indicar --order=ID');

            return self::FAILURE;
        }

        $stripe = new StripeClient($secret);

        foreach ($ids as $id) {
            if (!ctype_digit((string) $id) || (int) $id <= 0) {
                $this->error("ID invalido: {$id}");
                continue;
            }

            $order = Order::find((int) $id);

            if (!$order) {
                $this->error("Orden #{$id} no encontrada.");
                continue;
            }

            if (!$order->stripe_session_id) {
                $this->warn("Orden #{$id} sin sesion Stripe.");
                continue;
            }

            try {
                $session = $stripe->checkout->sessions->retrieve(
                    $order->stripe_session_id,
                    []
                );
            } catch (Throwable $e) {
                $this->error(
                    "No fue posible consultar Stripe para la orden #{$id}."
                );

                continue;
            }

            $this->info("ORDEN #{$order->id}");

            $this->line("Estado Laravel: {$order->status}");

            $this->line(
                "Estado Stripe: " . ($session->status ?? 'desconocido')
            );

            $this->line(
                "Estado pago: " . ($session->payment_status ?? 'desconocido')
            );

            $this->line(
                "Metadata order_id: " .
                ($session->metadata->order_id ?? 'NO DEFINIDO')
            );

            $expectedAmount = (int) round(
                (float) $order->total * 100
            );

            $valid =
                $session->livemode === false &&
                $session->id === $order->stripe_session_id &&
                (string) $session->client_reference_id ===
                    (string) $order->id &&
                (string) ($session->metadata->order_id ?? '') ===
                    (string) $order->id &&
                $session->mode === 'payment' &&
                $session->status === 'complete' &&
                $session->payment_status === 'paid' &&
                strtolower((string) $session->currency) === 'usd' &&
                $session->amount_total === $expectedAmount;

            if (!$valid) {
                $this->warn(
                    'La sesion no supera todas las verificaciones.'
                );

                continue;
            }

            $this->info('Pago verificado correctamente en Stripe.');

            if (!$this->option('apply')) {
                $this->comment(
                    'Modo diagnostico: no se modifico Laravel.'
                );

                continue;
            }

            $updated = DB::transaction(
                function () use ($order, $session, $expectedAmount): bool {
                    $locked = Order::query()
                        ->whereKey($order->id)
                        ->lockForUpdate()
                        ->first();

                    if (!$locked || $locked->status !== 'pending') {
                        return false;
                    }

                    if (
                        $locked->stripe_session_id !== $session->id ||
                        (int) round((float) $locked->total * 100) !==
                            $expectedAmount
                    ) {
                        return false;
                    }

                    $locked->update([
                        'status' => 'paid',
                    ]);

                    return true;
                }
            );

            if ($updated) {
                $this->info(
                    "Orden #{$order->id} actualizada a PAID."
                );
            } else {
                $this->warn(
                    'No se modifico la orden por su estado actual.'
                );
            }
        }

        return self::SUCCESS;
    }
}