const BASE = (import.meta.env.VITE_API_BASE as string) || "/api";

export type ApiResponse<T = unknown> = {
  ok: boolean;
  data?: T;
  error?: string;
};

export class ApiError extends Error {
  status: number;
  payload: ApiResponse | null;
  constructor(status: number, message: string, payload: ApiResponse | null) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  let body: ApiResponse<T> | null = null;
  try {
    body = (await res.json()) as ApiResponse<T>;
  } catch {
    body = null;
  }
  if (!res.ok) {
    throw new ApiError(res.status, body?.error || `Error ${res.status}`, body);
  }
  return (body?.data as T) ?? (body as unknown as T);
}

export type Tacto = {
  id_tacto?: string | number;
  caravana: string;
  fecha_tacto: string;
  resultado: "positivo" | "negativo" | "dudoso";
  dias_gestacion_estim: number;
  fecha_probable_parto?: string;
};

export type Paricion = {
  id_paricion?: string | number;
  caravana: string;
  fecha_paricion: string;
  sexo_cria: "macho" | "hembra";
  peso_nacer_kg: number;
  observaciones?: string;
};

export const api = {
  crearTacto: (payload: Omit<Tacto, "id_tacto" | "fecha_probable_parto">) =>
    request<Tacto>("/tactos", { method: "POST", body: JSON.stringify(payload) }),

  listarTactos: (resultado?: string) => {
    const qs = resultado ? `?resultado=${encodeURIComponent(resultado)}` : "";
    return request<Tacto[]>(`/tactos${qs}`);
  },

  crearParicion: (payload: Paricion) =>
    request<Paricion>("/pariciones", { method: "POST", body: JSON.stringify(payload) }),

  listarPariciones: (desde?: string, hasta?: string) => {
    const params = new URLSearchParams();
    if (desde) params.set("desde", desde);
    if (hasta) params.set("hasta", hasta);
    const qs = params.toString();
    return request<Paricion[]>(`/pariciones${qs ? `?${qs}` : ""}`);
  },
};
