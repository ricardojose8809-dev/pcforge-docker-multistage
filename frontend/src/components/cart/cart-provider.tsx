"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

import type { ReactNode } from "react";
import type { Product } from "@/types/product";

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addProduct: (product: Product) => void;
  removeProduct: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
};

const STORAGE_KEY = "pcforge_cart_v1";
const CHANGE_EVENT = "pcforge-cart-change";

const CartContext = createContext<CartContextValue | null>(
  null,
);

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function parseCart(raw: string): CartItem[] {
  try {
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    const result: CartItem[] = [];

    for (const entry of parsed) {
      if (!isRecord(entry) || !isRecord(entry.product)) {
        continue;
      }

      const product = entry.product;
      const quantity = entry.quantity;

      if (
        typeof product.id !== "number" ||
        !Number.isSafeInteger(product.id) ||
        typeof product.name !== "string" ||
        typeof product.description !== "string" ||
        typeof product.category !== "string" ||
        typeof product.image_url !== "string" ||
        typeof product.price !== "number" ||
        !Number.isFinite(product.price) ||
        product.price < 0 ||
        typeof product.stock !== "number" ||
        !Number.isSafeInteger(product.stock) ||
        product.stock < 0 ||
        typeof quantity !== "number" ||
        !Number.isSafeInteger(quantity) ||
        quantity < 1
      ) {
        continue;
      }

      const safeQuantity = Math.min(
        quantity,
        product.stock,
      );

      if (safeQuantity < 1) {
        continue;
      }

      result.push({
        product: product as unknown as Product,
        quantity: safeQuantity,
      });
    }

    return result;
  } catch {
    return [];
  }
}

function getSnapshot(): string {
  return window.localStorage.getItem(STORAGE_KEY) ?? "[]";
}

function getServerSnapshot(): string {
  return "[]";
}

function subscribe(callback: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function mutateCart(
  update: (items: CartItem[]) => CartItem[],
): void {
  const current = parseCart(getSnapshot());
  const next = update(current);

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(next),
  );

  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const items = useMemo(
    () => parseCart(snapshot),
    [snapshot],
  );

  const addProduct = useCallback((product: Product) => {
    if (product.stock <= 0) {
      return;
    }

    mutateCart((current) => {
      const existing = current.find(
        (item) => item.product.id === product.id,
      );

      if (!existing) {
        return [...current, { product, quantity: 1 }];
      }

      return current.map((item) =>
        item.product.id === product.id
          ? {
              product,
              quantity: Math.min(
                item.quantity + 1,
                product.stock,
              ),
            }
          : item,
      );
    });
  }, []);

  const removeProduct = useCallback((id: number) => {
    mutateCart((current) =>
      current.filter((item) => item.product.id !== id),
    );
  }, []);

  const updateQuantity = useCallback(
    (id: number, quantity: number) => {
      mutateCart((current) =>
        current
          .map((item) => {
            if (item.product.id !== id) {
              return item;
            }

            return {
              ...item,
              quantity: Math.min(
                Math.max(0, Math.floor(quantity)),
                item.product.stock,
              ),
            };
          })
          .filter((item) => item.quantity > 0),
      );
    },
    [],
  );

  const clearCart = useCallback(() => {
    mutateCart(() => []);
  }, []);

  const value = useMemo<CartContextValue>(() => {
    return {
      items,
      itemCount: items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      ),
      subtotal: items.reduce(
        (sum, item) =>
          sum + item.product.price * item.quantity,
        0,
      ),
      addProduct,
      removeProduct,
      updateQuantity,
      clearCart,
    };
  }, [
    items,
    addProduct,
    removeProduct,
    updateQuantity,
    clearCart,
  ]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart debe ejecutarse dentro de CartProvider.",
    );
  }

  return context;
}