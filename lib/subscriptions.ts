import type { PrototypeOrder } from "@/lib/orders";

export type SubscriptionDuration = "Weekly" | "Monthly";
export type SubscriptionStatus = "Active";

export type PrototypeSubscription = {
  id: string;
  status: SubscriptionStatus;
  orderId: string;
  chef: PrototypeOrder["chef"];
  items: PrototypeOrder["items"];
  duration: SubscriptionDuration;
  days: number;
  startDate: string;
  endDate: string;
  totalAmount: number;
  createdAt: string;
};

const subscriptionDays: Record<SubscriptionDuration, number> = {
  Weekly: 7,
  Monthly: 30,
};

function addDays(date: string, days: number) {
  const result = new Date(`${date}T12:00:00`);
  result.setDate(result.getDate() + days);
  return result.toISOString().slice(0, 10);
}

export function getTodayDate() {
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60_000;
  return new Date(today.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

export function createPrototypeSubscription(
  order: PrototypeOrder,
  duration: SubscriptionDuration,
  startDate = getTodayDate()
): PrototypeSubscription {
  const days = subscriptionDays[duration];

  return {
    id: `SUB-${Date.now().toString(36).toUpperCase()}`,
    status: "Active",
    orderId: order.id,
    chef: order.chef,
    items: order.items,
    duration,
    days,
    startDate,
    endDate: addDays(startDate, days - 1),
    totalAmount: order.totalAmount * days,
    createdAt: new Date().toISOString(),
  };
}
