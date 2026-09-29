export async function persistPrototype(endpoint: string, payload?: unknown) {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: payload === undefined ? undefined : { "Content-Type": "application/json" },
      body: payload === undefined ? undefined : JSON.stringify(payload),
    });

    return response.ok;
  } catch {
    return false;
  }
}
