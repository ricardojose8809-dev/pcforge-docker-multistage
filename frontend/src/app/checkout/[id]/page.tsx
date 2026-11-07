import type { Metadata } from "next";
import Link from "next/link";

import { notFound, redirect } from "next/navigation";

import PaymentButton from "@/components/checkout/payment-button";
import PaymentStatus from "@/components/checkout/payment-status";

import {
  getOrder,
  OrdersApiError,
} from "@/lib/orders";

import type { Order } from "@/types/order";

export const metadata: Metadata = {
  title: "Estado de compra",
  description: "Consulta y paga tu orden PCForge.",
};

type Props = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    returned?: string;
  }>;
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

async function loadOrder(id: string): Promise<Order> {
  const orderId = Number(id);

  if (
    !Number.isSafeInteger(orderId) ||
    orderId <= 0
  ) {
    notFound();
  }

  try {
    return await getOrder(orderId);
  } catch (error: unknown) {
    if (error instanceof OrdersApiError) {
      if (error.status === 401) {
        redirect("/login");
      }

      if (
        error.status === 403 ||
        error.status === 404
      ) {
        notFound();
      }
    }

    throw error;
  }
}

export default async function OrderCheckoutPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const query = await searchParams;

  const order = await loadOrder(id);
  const returnedFromStripe = query.returned === "1";

  const paid = order.status === "paid";
  const pending = order.status === "pending";

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/orders"
          className="text-sm text-cyan-400 hover:underline"
        >
          ← Mis órdenes
        </Link>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
            PCForge Checkout
          </p>

          <h1 className="mt-4 text-3xl font-bold">
            Orden #{order.id}
          </h1>

          <div className="mt-6">
            {paid ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5">
                <h2 className="text-xl font-bold text-emerald-400">
                  ¡Compra confirmada!
                </h2>

                <p className="mt-2 text-sm text-emerald-200">
                  Laravel confirmó que la orden está pagada.
                </p>
              </div>
            ) : pending ? (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5">
                <h2 className="text-xl font-bold text-amber-400">
                  Pago pendiente
                </h2>

                <p className="mt-2 text-sm text-slate-300">
                  {returnedFromStripe
                    ? "Regresaste de Stripe, pero Laravel todavía no ha confirmado el pago."
                    : "La orden fue creada y todavía no está pagada."}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5">
                <h2 className="text-xl font-bold text-red-400">
                  Orden cancelada
                </h2>

                <p className="mt-2 text-sm text-slate-300">
                  Esta orden ya no admite pagos.
                </p>
              </div>
            )}
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold">
              Productos de la orden
            </h2>

            <div className="mt-5 divide-y divide-slate-800">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between gap-4 py-4"
                >
                  <div>
                    <p className="font-medium">
                      {item.product?.name ??
                        `Producto #${item.product_id}`}
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      {item.quantity} ×{" "}
                      {currency.format(item.price)}
                    </p>
                  </div>

                  <span className="font-semibold">
                    {currency.format(
                      item.price * item.quantity,
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-slate-700 pt-6">
            <span className="font-semibold">
              Total de la orden
            </span>

            <span className="text-3xl font-bold text-cyan-400">
              {currency.format(order.total)}
            </span>
          </div>

          <div className="mt-8">
            {pending && !returnedFromStripe && (
              <PaymentButton orderId={order.id} />
            )}

            <PaymentStatus
              orderId={order.id}
              status={order.status}
              returnedFromStripe={returnedFromStripe}
              orderItems={order.items}
            />
          </div>
        </div>
      </div>
    </main>
  );
}