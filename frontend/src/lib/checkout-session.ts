export const PENDING_ORDER_KEY =
  "pcforge_pending_order_v1";

type CartEntry = {
  product: {
    id: number;
  };
  quantity: number;
};

export interface PendingOrder {
  orderId: number;
  signature: string;
}

export function cartSignature(
  items: readonly CartEntry[],
): string {
  return JSON.stringify(
    items
      .map((item) => ({
        id: item.product.id,
        quantity: item.quantity,
      }))
      .sort((a, b) => a.id - b.id),
  );
}

export function readPendingOrder(): PendingOrder | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(
      PENDING_ORDER_KEY,
    );

    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("orderId" in parsed) ||
      !("signature" in parsed) ||
      typeof parsed.orderId !== "number" ||
      !Number.isSafeInteger(parsed.orderId) ||
      parsed.orderId <= 0 ||
      typeof parsed.signature !== "string"
    ) {
      return null;
    }

    return {
      orderId: parsed.orderId,
      signature: parsed.signature,
    };
  } catch {
    return null;
  }
}