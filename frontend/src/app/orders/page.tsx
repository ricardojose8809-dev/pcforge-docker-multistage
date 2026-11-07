import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";

import {
  getOrders,
  OrdersApiError,
} from "@/lib/orders";

export const metadata: Metadata = {
  title: "Mis órdenes",
  description: "Historial de compras PCForge.",
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const statusLabel = {
  pending: "Pendiente de pago",
  paid: "Pagada",
  cancelled: "Cancelada",
} as const;

export default async function OrdersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  let orders;

  try {
    orders = await getOrders();
  } catch (error: unknown) {
    if (
      error instanceof OrdersApiError &&
      error.status === 401
    ) {
      redirect("/login");
    }

    throw error;
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/account"
          className="text-sm text-cyan-400 hover:underline"
        >
          ← Mi cuenta
        </Link>

        <h1 className="mt-8 text-4xl font-extrabold">
          Historial de compras
        </h1>

        <p className="mt-3 text-slate-400">
          Consulta tus órdenes y el estado de los pagos.
        </p>

        {orders.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
            <h2 className="text-xl font-bold">
              Todavía no tienes órdenes
            </h2>

            <Link
              href="/products"
              className="mt-6 inline-block rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950"
            >
              Explorar catálogo
            </Link>
          </div>
        ) : (
          <div className="mt-10 space-y-5">
            {orders.map((order) => (
              <article
                key={order.id}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div>
                    <h2 className="text-xl font-bold">
                      Orden #{order.id}
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                      {new Date(
                        order.created_at,
                      ).toLocaleDateString("es-SV")}
                    </p>

                    <p
                      className={`mt-3 text-sm font-semibold ${
                        order.status === "paid"
                          ? "text-emerald-400"
                          : order.status === "pending"
                            ? "text-amber-400"
                            : "text-red-400"
                      }`}
                    >
                      {statusLabel[order.status]}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {currency.format(order.total)}
                    </p>

                    <p className="mt-2 text-sm text-slate-400">
                      {order.items.length} productos
                      diferentes
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-800 pt-5">
                  <Link
                    href={`/checkout/${order.id}`}
                    className="text-sm font-semibold text-cyan-400 hover:underline"
                  >
                    {order.status === "pending"
                      ? "Continuar con el pago →"
                      : "Ver detalle de la orden →"}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}