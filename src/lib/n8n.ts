export const N8N_TACTOS_WEBHOOK_URL =
  "https://auto02.academia.ar/webhook/cargatactosv2";

export const N8N_PARICIONES_WEBHOOK_URL =
  "https://auto02.academia.ar/webhook/cargaparicionesv2";

export async function submitToN8N(
  url: string,
  payload: Record<string, unknown>
): Promise<void> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Webhook respondió con status ${res.status}`);
  }
}
