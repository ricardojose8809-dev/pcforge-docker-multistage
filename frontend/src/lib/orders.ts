import "server-only";

import { getAuthToken } from "@/lib/auth";

import type {
  Order,
  OrderResponse,
  OrdersResponse,
} from "@/types/order";

export class OrdersApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "OrdersApiError";
  }
}

export function getOrdersApiUrl(
  endpoint: string,
): string {
  const baseUrl = process.env.API_BASE_URL;

  if (!baseUrl) {
    throw new Error(
      "API_BASE_URL no está configurada.",
    );
  }

  return `${baseUrl.replace(/\/+$/, "")}/${endpoint.replace(/^\/+/, "")}`;
}

export function getOrdersErrorMessage(
  payload: unknown,
  fallback: string,
): string {
  if (
    typeof payload !== "object" ||
    payload === null
  ) {
    return fallback;
  }

  const data = payload as Record<string, unknown>;

  if (
    typeof data.errors === "object" &&
    data.errors !== null
  ) {
    const errors = Object.values(data.errors);

    for (const error of errors) {
      if (
        Array.isArray(error) &&
        typeof error[0] === "string"
      ) {
        return error[0];
      }
    }
  }

  if (typeof data.message === "string") {
    return data.message;
  }

  return fallback;
}

async function authenticatedGet<T>(
  endpoint: string,
): Promise<T> {
  const token = await getAuthToken();

  if (!token) {
    throw new OrdersApiError(
      "Debes iniciar sesión.",
      401,
    );
  }

  let response: Response;

  try {
    response = await fetch(
      getOrdersApiUrl(endpoint),
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );
  } catch {
    throw new OrdersApiError(
      "No fue posible conectar con Laravel.",
      0,
    );
  }

  const payload: unknown = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new OrdersApiError(
      getOrdersErrorMessage(
        payload,
        `Error HTTP ${response.status}.`,
      ),
      response.status,
    );
  }

  return payload as T;
}

export async function getOrder(
  id: number,
): Promise<Order> {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new OrdersApiError(
      "Identificador de orden inválido.",
      400,
    );
  }

  const response =
    await authenticatedGet<OrderResponse>(
      `/orders/${id}`,
    );

  if (
    !response?.data ||
    typeof response.data.id !== "number" ||
    !Array.isArray(response.data.items)
  ) {
    throw new Error(
      "Laravel devolvió un formato de orden inesperado.",
    );
  }

  return response.data;
}

export async function getOrders(): Promise<Order[]> {
  const response =
    await authenticatedGet<OrdersResponse>(
      "/orders",
    );

  if (!response || !Array.isArray(response.data)) {
    throw new Error(
      "Laravel devolvió un historial inválido.",
    );
  }

  return response.data;
}