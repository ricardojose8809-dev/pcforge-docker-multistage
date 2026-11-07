"use server";

import { revalidatePath } from "next/cache";

import { getAuthToken } from "@/lib/auth";

import {
  getOrdersApiUrl,
  getOrdersErrorMessage,
} from "@/lib/orders";

import type { OrderInputItem } from "@/types/order";

export type CreateOrderResult =
  | {
      ok: true;
      orderId: number;
    }
  | {
      ok: false;
      error: string;
      requiresLogin?: boolean;
    };

export type PaymentResult =
  | {
      ok: true;
      url: string;
    }
  | {
      ok: false;
      error: string;
      requiresLogin?: boolean;
    };

function isValidOrderItems(
  items: OrderInputItem[],
): boolean {
  if (
    !Array.isArray(items) ||
    items.length === 0 ||
    items.length > 50
  ) {
    return false;
  }

  const ids = new Set<number>();

  for (const item of items) {
    if (
      !item ||
      !Number.isSafeInteger(item.product_id) ||
      item.product_id <= 0 ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 10 ||
      ids.has(item.product_id)
    ) {
      return false;
    }

    ids.add(item.product_id);
  }

  return true;
}

export async function createOrderAction(
  items: OrderInputItem[],
): Promise<CreateOrderResult> {
  const token = await getAuthToken();

  if (!token) {
    return {
      ok: false,
      requiresLogin: true,
      error: "Debes iniciar sesión para comprar.",
    };
  }

  if (!isValidOrderItems(items)) {
    return {
      ok: false,
      error:
        "El carrito contiene cantidades inválidas. Se permiten entre 1 y 10 unidades por producto.",
    };
  }

  let response: Response;

  try {
    response = await fetch(
      getOrdersApiUrl("/orders"),
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items }),
        cache: "no-store",
      },
    );
  } catch {
    return {
      ok: false,
      error:
        "Se perdió la conexión al crear la orden. Revisa tu historial antes de intentarlo nuevamente, porque Laravel podría haber registrado la compra.",
    };
  }

  const payload: unknown = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    return {
      ok: false,
      requiresLogin: response.status === 401,
      error: getOrdersErrorMessage(
        payload,
        `No se pudo crear la orden (HTTP ${response.status}).`,
      ),
    };
  }

  if (response.status !== 201) {
    return {
      ok: false,
      error:
        "La API respondió de forma inesperada. Revisa tu historial antes de repetir la operación.",
    };
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("data" in payload) ||
    typeof payload.data !== "object" ||
    payload.data === null ||
    !("id" in payload.data) ||
    typeof payload.data.id !== "number" ||
    !Number.isSafeInteger(payload.data.id) ||
    payload.data.id <= 0
  ) {
    return {
      ok: false,
      error:
        "La orden pudo haberse creado, pero no recibimos su identificador. Consulta tu historial antes de reintentar.",
    };
  }

  const orderId = payload.data.id;

  revalidatePath("/orders");
  revalidatePath("/products");
  revalidatePath("/products/[id]", "page");

  return {
    ok: true,
    orderId,
  };
}

export async function startPaymentAction(
  orderId: number,
): Promise<PaymentResult> {
  const token = await getAuthToken();

  if (!token) {
    return {
      ok: false,
      requiresLogin: true,
      error: "Debes iniciar sesión para pagar.",
    };
  }

  if (
    !Number.isSafeInteger(orderId) ||
    orderId <= 0
  ) {
    return {
      ok: false,
      error: "La orden no es válida.",
    };
  }

  let response: Response;

  try {
    response = await fetch(
      getOrdersApiUrl(`/orders/${orderId}/pay`),
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );
  } catch {
    return {
      ok: false,
      error:
        "No fue posible conectar con Laravel para iniciar el pago.",
    };
  }

  const payload: unknown = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    return {
      ok: false,
      requiresLogin: response.status === 401,
      error: getOrdersErrorMessage(
        payload,
        `No se pudo iniciar el pago (HTTP ${response.status}).`,
      ),
    };
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("url" in payload) ||
    typeof payload.url !== "string"
  ) {
    return {
      ok: false,
      error:
        "Laravel no devolvió una URL de pago válida.",
    };
  }

  let paymentUrl: URL;

  try {
    paymentUrl = new URL(payload.url);
  } catch {
    return {
      ok: false,
      error:
        "Stripe devolvió una dirección inválida.",
    };
  }

  if (
    paymentUrl.protocol !== "https:" ||
    paymentUrl.hostname !== "checkout.stripe.com"
  ) {
    return {
      ok: false,
      error:
        "La dirección recibida no corresponde a Stripe Checkout.",
    };
  }

  return {
    ok: true,
    url: paymentUrl.toString(),
  };
}