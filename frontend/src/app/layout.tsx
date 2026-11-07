import type { Metadata } from "next";

import { CartProvider } from "@/components/cart/cart-provider";
import CartShortcut from "@/components/cart/cart-shortcut";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "PCForge | Build Your Own PC",
    template: "%s | PCForge",
  },
  description:
    "Tienda de componentes tecnológicos para construir tu PC ideal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        <CartProvider>
          {children}
          <CartShortcut />
        </CartProvider>
      </body>
    </html>
  );
}