import type { PrototypeSubscription } from "@/lib/subscriptions";
import { savePrototypeSubscription } from "@/lib/prototype-persistence";

export const runtime = "nodejs";

function isSubscription(value: unknown): value is PrototypeSubscription {
  if (!value || typeof value !== "object") return false;
  const subscription = value as PrototypeSubscription;
  return typeof subscription.id === "string" && typeof subscription.orderId === "string" && typeof subscription.totalAmount === "number" && Array.isArray(subscription.items);
}

export async function POST(request: Request) {
  try {
    const subscription: unknown = await request.json();
    if (!isSubscription(subscription)) return Response.json({ error: "Invalid subscription." }, { status: 400 });

    await savePrototypeSubscription(subscription);
    return Response.json({ saved: true });
  } catch (error) {
    console.error("Subscription persistence failed:", error instanceof Error ? error.name : "Unknown error");
    return Response.json({ error: "Subscription could not be saved right now." }, { status: 503 });
  }
}
