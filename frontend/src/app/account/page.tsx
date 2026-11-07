
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { logoutAction } from "@/actions/auth";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Mi cuenta",
  description: "Administra tu cuenta y consulta tus compras en PCForge.",
};

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-black text-cyan-400"
          >
            PCFORGE
          </Link>

          <Link
            href="/products"
            className="text-sm text-slate-300 hover:text-cyan-400"
          >
            Catálogo
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
            Mi cuenta
          </p>

          <h1 className="mt-4 text-4xl font-bold">
            Hola, {user.name}
          </h1>

          <p className="mt-3 text-slate-400">
            Administra tu información y consulta tus compras en PCForge.
          </p>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
            <h2 className="text-xl font-semibold">
              Información personal
            </h2>

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-sm text-slate-400">
                  Nombre
                </p>
                <p className="mt-1 font-medium">
                  {user.name}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">
                  Correo electrónico
                </p>
                <p className="mt-1 font-medium">
                  {user.email}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-cyan-500/20 bg-slate-900 p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Mis pedidos
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Consulta tus órdenes anteriores, revisa sus
                  productos y verifica el estado de tus pagos.
                </p>
              </div>

              <Link
                href="/orders"
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
              >
                Ver historial de compras
              </Link>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
            <h2 className="text-xl font-semibold">
              Acciones de cuenta
            </h2>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="rounded-xl border border-cyan-500 px-6 py-3 text-sm font-semibold text-cyan-400 transition hover:bg-cyan-500/10"
              >
                Explorar catálogo
              </Link>

              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:border-red-400 hover:text-red-400"
                >
                  Cerrar sesión
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
