export type OrderStatus =
  | "pending"
  | "paid"
  | "cancelled";

export interface OrderInputItem {
  product_id: number;
  quantity: number;
}

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product?: {
    id: number;
    name: string;
  };
}

export interface Order {
  id: number;
  status: OrderStatus;
  total: number;
  created_at: string;
  items: OrderItem[];
}

export interface OrderResponse {
  data: Order;
}

export interface OrdersResponse {
  data: Order[];
}