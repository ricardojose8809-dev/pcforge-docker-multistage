"use client";

import {
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { createOrderAction } from "@/actions/checkout";
import { useCart } from "@/components/cart/cart-provider";

import {
  cartSignature,
  PENDING_ORDER_KEY,
} from "@/lib/checkout-session";

import type { PendingOrder } from "@/lib/checkout-session";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const PENDING_ORDER_EVENT = "pcforge-pending-order-change";

type Props = {
  authenticated: boolean;
};

// Suscripción a los cambios de sessionStorage.
function subscribePendingOrder(
  callback: () => void,
): () => void {
  window.addEventListener(
    PENDING_ORDER_EVENT,
    callback,
  );

  window.addEventListener(
    "storage",
    callback,
  );

  return () => {
    window.removeEventListener(
      PENDING_ORDER_EVENT,
      callback,
    );

    window.removeEventListener(
      "storage",
      callback,
    );
  };
}

// Obtener el valor actual del almacenamiento.
function getPendingOrderSnapshot(): string {
  return (
    window.sessionStorage.getItem(
      PENDING_ORDER_KEY,
    ) ?? ""
  );
}

// Valor estable durante el renderizado del servidor.
function getServerPendingOrderSnapshot(): string {
  return "";
}

// Validar los datos almacenados.
function parsePendingOrder(
  raw: string,
): PendingOrder | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("orderId" in parsed) ||
      !("signature" in parsed)
    ) {
      return null;
    }

    if (
      typeof parsed.orderId !== "number" ||
      !Number.isSafeInteger(parsed.orderId) ||
      parsed.orderId <= 0 ||
      typeof parsed.signature !== "string"
    ) {
      return null;
    }

    return {
      orderId: parsed.orderId,
      signature: parsed.signature,
    };
  } catch {
    return null;
  }
}

export default function CheckoutView({
  authenticated,
}: Props) {
  const router = useRouter();

  const {
    items,
    subtotal,
    itemCount,
  } = useCart();

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  // Leer sessionStorage sin usar setState en useEffect.
  const pendingSnapshot = useSyncExternalStore(
    subscribePendingOrder,
    getPendingOrderSnapshot,
    getServerPendingOrderSnapshot,
  );

  const pendingOrder = useMemo(
    () => parsePendingOrder(pendingSnapshot),
    [pendingSnapshot],
  );

  // Identificar la composición actual del carrito.
  const signature = useMemo(
    () => cartSignature(items),
    [items],
  );

  // Reutilizar la orden si corresponde al carrito actual.
  const reusableOrder =
    pendingOrder?.signature === signature
      ? pendingOrder
      : null;

  // Validaciones del contrato de Laravel.
  const invalidQuantity = items.some(
    (item) =>
      item.quantity < 1 ||
      item.quantity > 10 ||
      item.quantity > item.product.stock,
  );

  async function handleCreateOrder() {
    if (submitting) {
      return;
    }

    // Si ya existe una orden para este carrito,
    // continuar sin generar otra.
    if (reusableOrder) {
      router.push(
        `/checkout/${reusableOrder.orderId}`,
      );
      return;
    }

    if (!authenticated) {
      setError(
        "Debes iniciar sesión antes de crear una orden.",
      );
      return;
    }

    if (items.length === 0) {
      setError(
        "Agrega productos al carrito antes de continuar.",
      );
      return;
    }

    if (invalidQuantity) {
      setError(
        "Revisa las cantidades. Laravel permite entre 1 y 10 unidades por producto.",
      );
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const orderItems = items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      }));

      const result = await createOrderAction(
        orderItems,
      );

      if (!result.ok) {
        setError(result.error);
        return;
      }

      const saved: PendingOrder = {
        orderId: result.orderId,
        signature,
      };

      // Guardar referencia para recuperar la orden.
      window.sessionStorage.setItem(
        PENDING_ORDER_KEY,
        JSON.stringify(saved),
      );

      // Notificar al store que los datos cambiaron.
      window.dispatchEvent(
        new Event(PENDING_ORDER_EVENT),
      );

      // Navegar a la orden recién creada.
      router.push(
        `/checkout/${result.orderId}`,
      );
    } catch {
      setError(
        "No se pudo confirmar el resultado. Consulta tu historial antes de crear otra orden.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/cart"
          className="text-sm text-cyan-400 hover:underline"
        >
          ← Volver al carrito
        </Link>

        <h1 className="mt-8 text-4xl font-extrabold">
          Finalizar compra
        </h1>

        <p className="mt-3 text-slate-400">
          Revisa tu selección antes de crear la orden.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          <section className="space-y-5 lg:col-span-2">
            {items.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
                <h2 className="text-xl font-bold">
                  No tienes productos seleccionados
                </h2>

                <Link
                  href="/products"
                  className="mt-5 inline-block text-cyan-400 hover:underline"
                >
                  Explorar catálogo
                </Link>
              </div>
            ) : (
              items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5"
                >
                  <div>
                    <p className="text-xs font-semibold text-cyan-400">
                      {product.category}
                    </p>

                    <h2 className="mt-2 font-semibold">
                      {product.name}
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                      Cantidad: {quantity}
                    </p>
                  </div>

                  <span className="whitespace-nowrap font-bold">
                    {currency.format(
                      product.price * quantity,
                    )}
                  </span>
                </div>
              ))
            )}
          </section>

          <aside className="h-fit rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-bold">
              Resumen de compra
            </h2>

            <div className="mt-6 flex justify-between text-slate-400">
              <span>Artículos</span>
              <span>{itemCount}</span>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-700 pt-5">
              <span>Total estimado</span>

              <span className="text-2xl font-bold text-cyan-400">
                {currency.format(subtotal)}
              </span>
            </div>

            <p className="mt-5 text-xs leading-5 text-slate-400">
              Laravel calculará el importe definitivo
              y verificará el stock al crear la orden.
            </p>

            {!authenticated && (
              <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                <p className="text-sm text-amber-300">
                  Necesitas una cuenta para continuar.
                </p>

                <Link
                  href="/login"
                  className="mt-3 inline-block text-sm font-semibold text-cyan-400 hover:underline"
                >
                  Iniciar sesión
                </Link>
              </div>
            )}

            {invalidQuantity && (
              <p className="mt-5 text-sm text-amber-400">
                Ajusta las cantidades en el carrito.
                Máximo 10 unidades por producto.
              </p>
            )}

            {pendingOrder && !reusableOrder && (
              <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                <p className="text-sm text-amber-300">
                  Existe una orden anterior con productos
                  diferentes. Revisa esa orden antes de
                  generar una nueva para evitar duplicados.
                </p>

                <Link
                  href={`/checkout/${pendingOrder.orderId}`}
                  className="mt-3 inline-block text-sm font-semibold text-cyan-400 hover:underline"
                >
                  Ver orden anterior
                </Link>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400"
              >
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleCreateOrder}
              disabled={
                submitting ||
                items.length === 0 ||
                invalidQuantity ||
                !authenticated
              }
              className="mt-8 w-full rounded-xl bg-cyan-500 px-5 py-4 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              {submitting
                ? "Creando orden..."
                : reusableOrder
                  ? "Continuar orden existente"
                  : "Confirmar y crear orden"}
            </button>

            <Link
              href="/orders"
              className="mt-5 block text-center text-sm text-slate-400 hover:text-cyan-400"
            >
              Consultar mis órdenes
            </Link>

            <p className="mt-5 text-xs leading-5 text-slate-500">
              Confirmar la orden reserva los artículos
              mediante el descuento de stock en Laravel.
              Todavía no constituye un pago.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}