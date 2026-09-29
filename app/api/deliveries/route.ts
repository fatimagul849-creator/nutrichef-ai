import type { PrototypeDelivery } from "@/lib/delivery";
import { savePrototypeDelivery } from "@/lib/prototype-persistence";

export const runtime = "nodejs";

function isDelivery(value: unknown): value is PrototypeDelivery {
  if (!value || typeof value !== "object") return false;
  const delivery = value as PrototypeDelivery;
  return typeof delivery.id === "string" && typeof delivery.orderId === "string" && typeof delivery.status === "string" && Array.isArray(delivery.items);
}

export async function POST(request: Request) {
  try {
    const delivery: unknown = await request.json();
    if (!isDelivery(delivery)) return Response.json({ error: "Invalid delivery update." }, { status: 400 });

    await savePrototypeDelivery(delivery);
    return Response.json({ saved: true });
  } catch (error) {
    console.error("Delivery persistence failed:", error instanceof Error ? error.name : "Unknown error");
    return Response.json({ error: "Delivery status could not be saved right now." }, { status: 503 });
  }
}
