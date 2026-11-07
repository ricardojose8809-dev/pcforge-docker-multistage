import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";

import ProductCard from "@/components/product-card";
import { getProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Catálogo de componentes",
  description:
    "Compra procesadores, tarjetas gráficas, memorias RAM y otros componentes para construir tu PC.",
};

type ProductsPageProps = {
  searchParams: Promise<{
    page?: string | string[];
  }>;
};

function parsePage(
  value: string | string[] | undefined,
): number {
  const rawValue = Array.isArray(value)
    ? value[0]
    : value;

  if (!rawValue || !/^\d+$/.test(rawValue)) {
    return 1;
  }

  const page = Number(rawValue);

  return Number.isSafeInteger(page) && page > 0
    ? page
    : 1;
}

function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Paginación del catálogo"
      className="mt-12 flex flex-wrap items-center justify-center gap-2"
    >
      {currentPage > 1 && (
        <Link
          href={`/products?page=${currentPage - 1}`}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400"
        >
          Anterior
        </Link>
      )}

      {Array.from(
        { length: totalPages },
        (_, index) => index + 1,
      ).map((page) => (
        <Link
          key={page}
          href={`/products?page=${page}`}
          aria-current={
            currentPage === page ? "page" : undefined
          }
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            currentPage === page
              ? "bg-cyan-500 text-slate-950"
              : "border border-slate-700 text-slate-300 hover:border-cyan-500 hover:text-cyan-400"
          }`}
        >
          {page}
        </Link>
      ))}

      {currentPage < totalPages && (
        <Link
          href={`/products?page=${currentPage + 1}`}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400"
        >
          Siguiente
        </Link>
      )}
    </nav>
  );
}

async function ProductsContent({
  page,
}: {
  page: number;
}) {
  const response = await getProducts(page);

  const { data: products, meta } = response;

  if (
    meta.total > 0 &&
    page > meta.last_page
  ) {
    notFound();
  }

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-400">
          Mostrando {meta.from ?? 0}–
          {meta.to ?? 0} de {meta.total} productos
        </p>

        <p className="text-sm text-slate-400">
          Página {meta.current_page} de {meta.last_page}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center">
          <h2 className="text-xl font-semibold">
            No hay productos disponibles
          </h2>

          <p className="mt-3 text-slate-400">
            Nuestro catálogo está vacío por el momento.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              preload={index === 0}
            />
          ))}
        </div>
      )}

      <Pagination
        currentPage={meta.current_page}
        totalPages={meta.last_page}
      />
    </>
  );
}

function ProductsSkeleton() {
  return (
    <div className="grid animate-pulse gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }, (_, index) => (
        <div
          key={index}
          className="h-96 rounded-2xl bg-slate-800"
        />
      ))}
    </div>
  );
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const query = await searchParams;
  const page = parsePage(query.page);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-cyan-400"
          >
            PCFORGE
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/products"
              className="text-sm font-medium text-cyan-400"
            >
              Catálogo
            </Link>

            <Link
              href="/account"
              className="text-sm text-slate-300 hover:text-cyan-400"
            >
              Mi cuenta
            </Link>

            <Link
              href="/cart"
              className="text-sm text-slate-300 hover:text-cyan-400"
            >
              Carrito
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-12">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Hardware & Performance
          </p>

          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
            Componentes para tu próxima PC
          </h1>

          <p className="mt-4 max-w-2xl text-slate-400">
            Encuentra procesadores, tarjetas gráficas,
            memorias y otros componentes para construir
            el equipo que necesitas.
          </p>
        </div>

        <Suspense
          key={page}
          fallback={<ProductsSkeleton />}
        >
          <ProductsContent page={page} />
        </Suspense>
      </div>
    </main>
  );
}