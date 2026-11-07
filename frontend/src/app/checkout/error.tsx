"use client";

import Link from "next/link";

type CheckoutErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function CheckoutError({
  reset,
}: CheckoutErrorProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
        <h1 className="text-3xl font-bold">
          No pudimos cargar el checkout
        </h1>

        <p className="mt-4 text-slate-400">
          Ocurrió un problema al preparar tu compra.
          Tus productos permanecen en el carrito.
        </p>

        <button
          type="button"
          onClick={reset}
          className="mt-8 w-full rounded-xl bg-cyan-500 px-6 py-3 font-bold text-slate-950 hover:bg-cyan-400"
        >
          Intentar nuevamente
        </button>

        <Link
          href="/cart"
          className="mt-5 block text-sm text-cyan-400 hover:underline"
        >
          Volver al carrito
        </Link>
      </div>
    </main>
  );
}