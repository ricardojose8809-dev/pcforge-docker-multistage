"use client";

import Image from "next/image";
import Link from "next/link";

import { useCart } from "@/components/cart/cart-provider";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function CartView() {
  const {
    items,
    itemCount,
    subtotal,
    updateQuantity,
    removeProduct,
    clearCart,
  } = useCart();

  const hasInvalidQuantity = items.some(
    (item) =>
      item.quantity > 10 ||
      item.quantity > item.product.stock,
  );

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/products"
          className="text-sm text-cyan-400 hover:underline"
        >
          ← Continuar comprando
        </Link>

        <h1 className="mt-8 text-4xl font-extrabold">
          Mi carrito
        </h1>

        <p className="mt-3 text-slate-400">
          {itemCount} artículos seleccionados
        </p>

        {items.length === 0 ? (
          <section className="mt-12 rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center">
            <h2 className="text-2xl font-bold">
              Tu carrito está vacío
            </h2>

            <Link
              href="/products"
              className="mt-8 inline-block rounded-xl bg-cyan-500 px-6 py-3 font-bold text-slate-950"
            >
              Explorar productos
            </Link>
          </section>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            <section className="space-y-5 lg:col-span-2">
              {items.map(({ product, quantity }) => (
                <article
                  key={product.id}
                  className="flex flex-col gap-5 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:flex-row"
                >
                  <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-xl bg-white sm:w-40">
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 160px"
                      className="object-contain p-2"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between gap-5">
                    <div>
                      <Link
                        href={`/products/${product.id}`}
                        className="text-lg font-bold hover:text-cyan-400"
                      >
                        {product.name}
                      </Link>

                      <p className="mt-2 text-sm text-slate-400">
                        {currency.format(product.price)} por unidad
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center rounded-xl border border-slate-700">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              product.id,
                              quantity - 1,
                            )
                          }
                          aria-label="Reducir cantidad"
                          className="px-4 py-2"
                        >
                          −
                        </button>

                        <span className="min-w-10 text-center font-semibold">
                          {quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              product.id,
                              quantity + 1,
                            )
                          }
                          disabled={quantity >= product.stock}
                          aria-label="Aumentar cantidad"
                          className="px-4 py-2 disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>

                      <p className="font-bold">
                        {currency.format(
                          product.price * quantity,
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeProduct(product.id)}
                      className="w-fit text-sm text-red-400 hover:underline"
                    >
                      Eliminar producto
                    </button>
                  </div>
                </article>
              ))}

              <button
                type="button"
                onClick={clearCart}
                className="text-sm text-slate-400 hover:text-red-400"
              >
                Vaciar carrito
              </button>
            </section>

            <aside className="h-fit rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-bold">
                Resumen de compra
              </h2>

              <div className="mt-8 flex justify-between text-slate-400">
                <span>Artículos</span>
                <span>{itemCount}</span>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-700 pt-5">
                <span>Total estimado</span>

                <span className="text-2xl font-bold text-cyan-400">
                  {currency.format(subtotal)}
                </span>
              </div>

              <p className="mt-4 text-xs text-slate-500">
                Laravel verificará precios y stock al
                crear la orden.
              </p>

              {hasInvalidQuantity && (
                <p className="mt-5 text-sm text-amber-400">
                  Debes reducir las cantidades a un
                  máximo de 10 unidades por producto.
                </p>
              )}

              {hasInvalidQuantity ? (
                <button
                  type="button"
                  disabled
                  className="mt-8 w-full rounded-xl bg-slate-700 px-5 py-4 font-bold text-slate-400"
                >
                  Ajusta las cantidades
                </button>
              ) : (
                <Link
                  href="/checkout"
                  className="mt-8 block rounded-xl bg-cyan-500 px-5 py-4 text-center font-bold text-slate-950 transition hover:bg-cyan-400"
                >
                  Continuar al checkout
                </Link>
              )}

              <Link
                href="/orders"
                className="mt-5 block text-center text-sm text-slate-400 hover:text-cyan-400"
              >
                Ver mis órdenes
              </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}