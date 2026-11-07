import type { Metadata } from "next";

import CartView from "@/components/cart/cart-view";

export const metadata: Metadata = {
  title: "Mi carrito",
  description:
    "Revisa los componentes seleccionados para tu próxima PC.",
};

export default function CartPage() {
  return <CartView />;
}