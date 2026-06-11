// Reemplazá esta URL por la de tu webhook de n8n.
export const N8N_WEBHOOK_URL = "https://auto02.academia.ar/webhook-test/lovable-ganaderia";

export async function submitToN8N(payload: Record<string, unknown>): Promise<void> {
  const res = await fetch(N8N_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Webhook respondió con status ${res.status}`);
  }
}
