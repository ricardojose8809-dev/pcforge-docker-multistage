import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "PCForge | Build Your Own PC",
  description:
    "Encuentra los mejores componentes para construir tu próxima computadora.",
};

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-black text-cyan-400"
          >
            PCFORGE
          </Link>

          <Link
            href="/products"
            className="text-sm font-semibold text-slate-300 hover:text-cyan-400"
          >
            Explorar productos
          </Link>
        </div>
      </header>

      <section className="flex flex-1 items-center justify-center px-6 py-24">
        <div className="max-w-4xl text-center">
          <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-5 py-2 text-sm font-semibold text-cyan-400">
            Build Your Own PC
          </span>

          <h1 className="mt-8 text-5xl font-black tracking-tight md:text-7xl">
            Tu próxima PC
            <span className="block text-cyan-400">
              empieza aquí.
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-slate-400">
            Descubre procesadores, tarjetas gráficas,
            memorias y componentes seleccionados para
            construir una computadora a tu medida.
          </p>

          <Link
            href="/products"
            className="mt-10 inline-flex rounded-xl bg-cyan-500 px-8 py-4 text-base font-bold text-slate-950 transition hover:bg-cyan-400"
          >
            Explorar catálogo →
          </Link>

          <div className="mt-16 grid gap-5 text-left sm:grid-cols-3">
            {[
              {
                title: "Procesadores",
                description: "Potencia para cada tarea.",
              },
              {
                title: "Gráficos",
                description: "Rendimiento para tus juegos.",
              },
              {
                title: "Memoria",
                description: "Velocidad para tu sistema.",
              },
            ].map((category) => (
              <div
                key={category.title}
                className="rounded-xl border border-slate-800 bg-slate-900 p-6"
              >
                <h2 className="font-semibold">
                  {category.title}
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  {category.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}