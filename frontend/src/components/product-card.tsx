import Image from "next/image";
import Link from "next/link";

import AddToCartButton from "@/components/cart/add-to-cart-button";

import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
  preload?: boolean;
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function ProductCard({
  product,
  preload = false,
}: ProductCardProps) {
  const available = product.stock > 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition duration-300 hover:-translate-y-1 hover:border-cyan-500/60">
      <Link
        href={`/products/${product.id}`}
        className="relative block aspect-square overflow-hidden bg-white"
      >
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          preload={preload}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-contain p-4 transition duration-500 group-hover:scale-105"
        />

        <span className="absolute left-3 top-3 rounded-full bg-slate-950/90 px-3 py-1 text-xs font-semibold text-cyan-400">
          {product.category}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link href={`/products/${product.id}`}>
          <h2 className="text-lg font-semibold text-white transition hover:text-cyan-400">
            {product.name}
          </h2>
        </Link>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-400">
          {product.description}
        </p>

        <div className="mt-auto pt-6">
          <div className="flex items-center justify-between gap-2">
            <p className="text-2xl font-bold text-white">
              {currency.format(product.price)}
            </p>

            <span
              className={`text-xs font-medium ${
                available
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {available
                ? `${product.stock} disponibles`
                : "Agotado"}
            </span>
          </div>

          <div className="mt-5 space-y-3">
            <AddToCartButton
              product={product}
              compact
            />

            <Link
              href={`/products/${product.id}`}
              className="block rounded-xl border border-slate-700 px-4 py-3 text-center text-sm font-semibold text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400"
            >
              Ver detalles
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}