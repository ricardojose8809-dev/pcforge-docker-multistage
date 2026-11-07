"use client";

import { useCart } from "@/components/cart/cart-provider";

import type { Product } from "@/types/product";

type Props = {
  product: Product;
  compact?: boolean;
};

export default function AddToCartButton({
  product,
  compact = false,
}: Props) {
  const { items, addProduct } = useCart();

  const quantity =
    items.find((item) => item.product.id === product.id)
      ?.quantity ?? 0;

  const disabled =
    product.stock <= 0 || quantity >= product.stock;

  return (
    <button
      type="button"
      onClick={() => addProduct(product)}
      disabled={disabled}
      className={`w-full rounded-xl bg-cyan-500 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 ${
        compact
          ? "px-4 py-3 text-sm"
          : "px-6 py-4 text-base"
      }`}
    >
      {product.stock <= 0
        ? "Producto agotado"
        : disabled
          ? "Stock máximo en carrito"
          : quantity > 0
            ? `Agregar otra unidad (${quantity})`
            : "Agregar al carrito"}
    </button>
  );
}