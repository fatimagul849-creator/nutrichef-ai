import type { PrototypeOrder } from "@/lib/orders";
import { savePrototypeOrder, syncPrototypeChefs } from "@/lib/prototype-persistence";

export const runtime = "nodejs";

function isOrder(value: unknown): value is PrototypeOrder {
  if (!value || typeof value !== "object") return false;
  const order = value as PrototypeOrder;
  return typeof order.id === "string" && typeof order.totalAmount === "number" && Array.isArray(order.items) && typeof order.chef?.id === "string";
}

export async function POST(request: Request) {
  try {
    const order: unknown = await request.json();
    if (!isOrder(order)) return Response.json({ error: "Invalid order." }, { status: 400 });

    await syncPrototypeChefs();
    await savePrototypeOrder(order);
    return Response.json({ saved: true });
  } catch (error) {
    console.error("Order persistence failed:", error instanceof Error ? error.name : "Unknown error");
    return Response.json({ error: "Order could not be saved right now." }, { status: 503 });
  }
}
