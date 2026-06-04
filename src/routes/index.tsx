import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Spinner } from "@/components/Spinner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cargar Tacto — Gestión Reproductiva" },
      { name: "description", content: "Registrar tactos en el rodeo bovino." },
    ],
  }),
  component: CargarTacto,
});

function CargarTacto() {
  const [caravana, setCaravana] = useState("");
  const [fecha, setFecha] = useState("");
  const [resultado, setResultado] = useState<"positivo" | "negativo" | "dudoso">("positivo");
  const [dias, setDias] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ fpp?: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const requiereDias = resultado !== "negativo";
    if (!caravana || !fecha || (requiereDias && dias === "")) {
      setError("Completá todos los campos requeridos.");
      return;
    }
    setLoading(true);
    try {
      const data = await api.crearTacto({
        caravana,
        fecha_tacto: fecha,
        resultado,
        dias_gestacion_estim: requiereDias ? Number(dias) : null,
      });
      setSuccess({ fpp: data?.fecha_probable_parto });
      setCaravana("");
      setFecha("");
      setDias("");
      setResultado("positivo");
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setError("La caravana no existe en la planilla maestra.");
      } else {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-1 text-2xl font-bold text-foreground">Cargar Tacto</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Registrá un nuevo tacto rectal en el rodeo.
      </p>

      <form onSubmit={onSubmit} className="space-y-4 rounded-lg border bg-card p-4 shadow-sm">
        <Field label="Caravana" required>
          <input
            type="text"
            required
            value={caravana}
            onChange={(e) => setCaravana(e.target.value)}
            className="input"
            placeholder="Ej: 1234"
          />
        </Field>

        <Field label="Fecha del tacto" required>
          <input
            type="date"
            required
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Resultado" required>
          <select
            value={resultado}
            onChange={(e) => {
              const nuevo = e.target.value as typeof resultado;
              setResultado(nuevo);
              if (nuevo === "negativo") setDias("");
            }}
            className="input"
          >
            <option value="positivo">Positivo</option>
            <option value="negativo">Negativo</option>
            <option value="dudoso">Dudoso</option>
          </select>
        </Field>

        {resultado !== "negativo" && (
          <Field label="Días de gestación estimados" required>
            <input
              type="number"
              min={0}
              required
              value={dias}
              onChange={(e) => setDias(e.target.value === "" ? "" : Number(e.target.value))}
              className="input"
            />
          </Field>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading && <Spinner />}
          {loading ? "Enviando…" : "Guardar tacto"}
        </button>

        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm text-foreground">
            <p className="font-medium">Tacto registrado correctamente.</p>
            {success.fpp && (
              <p className="mt-1">
                Fecha probable de parto: <strong>{success.fpp}</strong>
              </p>
            )}
            <p className="mt-1 text-muted-foreground">Reporte enviado por correo.</p>
          </div>
        )}
      </form>
    </div>
  );
}

export function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      {children}
    </label>
  );
}
