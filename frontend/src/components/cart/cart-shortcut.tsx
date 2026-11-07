"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/cart-provider";

export default function CartShortcut() {
  const { itemCount } = useCart();

  return (
    <Link
      href="/cart"
      aria-label={`Ver carrito, ${itemCount} artículos`}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-cyan-400/30 bg-cyan-500 px-5 py-4 font-bold text-slate-950 shadow-xl shadow-cyan-950/40 transition hover:bg-cyan-400"
    >
      <span aria-hidden="true">🛒</span>

      <span>Carrito</span>

      <span className="rounded-full bg-slate-950 px-2 py-1 text-xs text-white">
        {itemCount}
      </span>
    </Link>
  );
}