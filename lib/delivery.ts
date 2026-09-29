import type { PrototypeOrder } from "@/lib/orders";
import type { PrototypeSubscription } from "@/lib/subscriptions";

export const deliveryStages = ["Order Placed", "Preparing", "Out for Delivery", "Delivered"] as const;

export type DeliveryStatus = (typeof deliveryStages)[number];

export type PrototypeDelivery = {
  id: string;
  orderId: string;
  chef: PrototypeOrder["chef"];
  items: PrototypeOrder["items"];
  subscription?: Pick<PrototypeSubscription, "id" | "duration" | "days" | "startDate" | "endDate">;
  status: DeliveryStatus;
  createdAt: string;
  updatedAt: string;
};

export const deliveryStatusMessages: Record<DeliveryStatus, string> = {
  "Order Placed": "Your order has been received and is waiting to be prepared.",
  Preparing: "Your home chef is preparing your selected meals.",
  "Out for Delivery": "Your meals have left the kitchen and are on their way.",
  Delivered: "Your meals have been delivered. Enjoy your home-cooked food!",
};

export function createPrototypeDelivery(order: PrototypeOrder, subscription?: PrototypeSubscription): PrototypeDelivery {
  const now = new Date().toISOString();

  return {
    id: `DLV-${Date.now().toString(36).toUpperCase()}`,
    orderId: order.id,
    chef: order.chef,
    items: order.items,
    subscription: subscription
      ? {
          id: subscription.id,
          duration: subscription.duration,
          days: subscription.days,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
        }
      : undefined,
    status: "Order Placed",
    createdAt: now,
    updatedAt: now,
  };
}

export function advanceDeliveryStatus(delivery: PrototypeDelivery): PrototypeDelivery {
  const currentIndex = deliveryStages.indexOf(delivery.status);
  const nextStatus = deliveryStages[Math.min(currentIndex + 1, deliveryStages.length - 1)];

  if (nextStatus === delivery.status) return delivery;

  return { ...delivery, status: nextStatus, updatedAt: new Date().toISOString() };
}
