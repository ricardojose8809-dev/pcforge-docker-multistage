import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Verificar pago",
  description:
    "Comprobando el estado de tu compra PCForge.",
};

type Props = {
  searchParams: Promise<{
    order?: string;
  }>;
};

export default async function PaymentSuccessPage({
  searchParams,
}: Props) {
  const { order } = await searchParams;

  const orderId = Number(order);

  if (
    order &&
    Number.isSafeInteger(orderId) &&
    orderId > 0
  ) {
    redirect(
      `/checkout/${orderId}?returned=1`,
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
        <h1 className="text-2xl font-bold">
          Verificación de compra
        </h1>

        <p className="mt-4 text-slate-400">
          No recibimos un identificador de orden.
          Esto no significa que el pago haya fallado.
          Consulta el historial para comprobarlo.
        </p>

        <Link
          href="/orders"
          className="mt-8 inline-block rounded-xl bg-cyan-500 px-6 py-3 font-bold text-slate-950"
        >
          Consultar mis órdenes
        </Link>
      </div>
    </main>
  );
}