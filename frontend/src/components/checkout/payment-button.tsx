"use client";

import { useState } from "react";
import Link from "next/link";

import { startPaymentAction } from "@/actions/checkout";

type Props = {
  orderId: number;
};

export default function PaymentButton({
  orderId,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requiresLogin, setRequiresLogin] =
    useState(false);

  async function handlePayment() {
    if (loading) {
      return;
    }

    setLoading(true);
    setError(null);
    setRequiresLogin(false);

    try {
      const result = await startPaymentAction(orderId);

      if (!result.ok) {
        setError(result.error);
        setRequiresLogin(
          result.requiresLogin === true,
        );
        return;
      }

      window.location.assign(result.url);
    } catch {
      setError(
        "Ocurrió un problema al iniciar Stripe Checkout.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400"
        >
          {error}

          {requiresLogin && (
            <Link
              href="/login"
              className="mt-3 block font-semibold text-cyan-400 hover:underline"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={handlePayment}
        disabled={loading}
        className="w-full rounded-xl bg-cyan-500 px-6 py-4 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Conectando con Stripe..."
          : "Pagar de forma segura con Stripe"}
      </button>

      <p className="text-center text-xs text-slate-400">
        Serás redirigido a Stripe Checkout.
        Utiliza únicamente tarjetas de prueba.
      </p>
    </div>
  );
}