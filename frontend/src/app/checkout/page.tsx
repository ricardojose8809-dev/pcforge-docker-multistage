import type { Metadata } from "next";

import CheckoutView from "@/components/checkout/checkout-view";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Finalizar compra",
  description:
    "Confirma los componentes de tu carrito en PCForge.",
};

export default async function CheckoutPage() {
  const user = await getCurrentUser();

  return (
    <CheckoutView authenticated={user !== null} />
  );
}