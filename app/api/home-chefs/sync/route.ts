import { syncPrototypeChefs } from "@/lib/prototype-persistence";

export const runtime = "nodejs";

export async function POST() {
  try {
    await syncPrototypeChefs();
    return Response.json({ saved: true });
  } catch (error) {
    console.error("Chef sync failed:", error instanceof Error ? error.name : "Unknown error");
    return Response.json({ error: "Chef data could not be saved right now." }, { status: 503 });
  }
}
