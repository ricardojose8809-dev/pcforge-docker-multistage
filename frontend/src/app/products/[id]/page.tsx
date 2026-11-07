import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import AddToCartButton from "@/components/cart/add-to-cart-button";
import { ApiError } from "@/lib/api";
import { getProduct } from "@/lib/products";

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

async function loadProduct(id: string) {
  const productId = Number(id);

  if (
    !Number.isSafeInteger(productId) ||
    productId <= 0
  ) {
    notFound();
  }

  try {
    return await getProduct(productId);
  } catch (error: unknown) {
    if (
      error instanceof ApiError &&
      error.status === 404
    ) {
      notFound();
    }

    throw error;
  }
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await loadProduct(id);

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: `${product.name} | PCForge`,
      description: product.description,
      images: [product.image_url],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: ProductPageProps) {
  const { id } = await params;
  const product = await loadProduct(id);

  const available = product.stock > 0;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-black text-cyan-400"
          >
            PCFORGE
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              href="/products"
              className="text-sm text-slate-300 hover:text-cyan-400"
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
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <Link
          href="/products"
          className="text-sm text-cyan-400 hover:underline"
        >
          ← Volver al catálogo
        </Link>

        <div className="mt-10 grid gap-12 lg:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-slate-800 bg-white">
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              preload
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain p-4"
            />
          </div>

          <div className="flex flex-col">
            <span className="w-fit rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-400">
              {product.category}
            </span>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight md:text-5xl">
              {product.name}
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-400">
              {product.description}
            </p>

            <div className="mt-8 border-t border-slate-800 pt-8">
              <p className="text-sm text-slate-400">
                Precio
              </p>

              <p className="mt-2 text-4xl font-bold">
                {currency.format(product.price)}
              </p>
            </div>

            <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-5">
              <h2 className="font-semibold">
                Disponibilidad
              </h2>

              <p
                className={`mt-2 text-sm ${
                  available
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {available
                  ? `${product.stock} unidades disponibles`
                  : "Producto agotado"}
              </p>

              <p className="mt-4 text-xs text-slate-500">
                Código de producto: #{product.id}
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <AddToCartButton product={product} />

              <Link
                href="/cart"
                className="block rounded-xl border border-slate-700 px-6 py-4 text-center font-semibold text-slate-300 transition hover:border-cyan-400 hover:text-cyan-400"
              >
                Ver mi carrito
              </Link>

              <Link
                href="/products"
                className="block text-center text-sm text-slate-400 transition hover:text-cyan-400"
              >
                Continuar explorando productos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}