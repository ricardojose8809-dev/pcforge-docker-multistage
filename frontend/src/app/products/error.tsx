"use client";

import { useEffect } from "react";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ProductsError({
  error,
  reset,
}: ErrorProps) {
  useEffect(() => {
    console.error("Error del catálogo:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="max-w-lg text-center">
        <h1 className="text-3xl font-bold text-red-400">
          No pudimos cargar el catálogo
        </h1>

        <p className="mt-4 text-slate-400">
          Ocurrió un problema al consultar los productos.
          Comprueba que Laravel esté funcionando.
        </p>

        <button
          type="button"
          onClick={reset}
          className="mt-8 rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          Intentar nuevamente
        </button>
      </div>
    </main>
  );
}