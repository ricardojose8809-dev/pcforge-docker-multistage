"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useCart } from "@/components/cart/cart-provider";

import {
  cartSignature,
  PENDING_ORDER_KEY,
  readPendingOrder,
} from "@/lib/checkout-session";

import type {
  OrderItem,
  OrderStatus,
} from "@/types/order";

type Props = {
  orderId: number;
  status: OrderStatus;
  returnedFromStripe: boolean;
  orderItems: OrderItem[];
};

export default function PaymentStatus({
  orderId,
  status,
  returnedFromStripe,
  orderItems,
}: Props) {
  const router = useRouter();
  const { items, clearCart } = useCart();

  const finalized = useRef(false);
  const attempts = useRef(0);

  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (
      status !== "pending" ||
      !returnedFromStripe
    ) {
      return;
    }

    const interval = window.setInterval(() => {
      if (attempts.current >= 15) {
        window.clearInterval(interval);
        return;
      }

      attempts.current += 1;
      router.refresh();
    }, 4000);

    return () => window.clearInterval(interval);
  }, [status, returnedFromStripe, router]);

  useEffect(() => {
    if (
      finalized.current ||
      (status !== "paid" && status !== "cancelled")
    ) {
      return;
    }

    const saved = readPendingOrder();

    if (!saved || saved.orderId !== orderId) {
      return;
    }

    if (status === "paid") {
      const expectedItems = orderItems.map((item) => ({
        product: { id: item.product_id },
        quantity: item.quantity,
      }));

      const expectedSignature =
        cartSignature(expectedItems);

      if (
        saved.signature === expectedSignature &&
        cartSignature(items) === saved.signature
      ) {
        clearCart();
      }
    }

    sessionStorage.removeItem(PENDING_ORDER_KEY);
    finalized.current = true;
  }, [status, orderId, orderItems, items, clearCart]);

  if (status === "paid") {
    return (
      <p className="text-center text-sm text-emerald-400">
        El pago está confirmado y registrado en Laravel.
      </p>
    );
  }

  if (status === "cancelled") {
    return (
      <p className="text-center text-sm text-red-400">
        Consulta el catálogo para realizar una nueva compra.
      </p>
    );
  }

  if (!returnedFromStripe) {
    return (
      <p className="mt-4 text-center text-xs text-slate-400">
        Esta orden continuará pendiente hasta recibir
        la confirmación del pago.
      </p>
    );
  }

  function refreshStatus() {
    setChecking(true);
    router.refresh();
    window.setTimeout(() => setChecking(false), 1000);
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-amber-300">
        Estamos esperando la confirmación del pago
        desde Laravel.
      </p>

      <p className="text-center text-xs text-slate-400">
        La página comprobará el estado periódicamente.
        No vuelvas a pagar mientras se verifica.
      </p>

      <button
        type="button"
        onClick={refreshStatus}
        disabled={checking}
        className="w-full rounded-xl border border-slate-700 px-6 py-3 font-semibold text-white hover:border-cyan-400 disabled:opacity-50"
      >
        {checking
          ? "Actualizando..."
          : "Comprobar estado del pago"}
      </button>
    </div>
  );
}