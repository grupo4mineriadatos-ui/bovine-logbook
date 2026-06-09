import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Calendar, Stethoscope, Activity } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { Spinner } from "@/components/Spinner";
import { CaravanaCombobox } from "@/components/CaravanaCombobox";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cargar Tacto — Gestión Reproductiva" },
      { name: "description", content: "Registrar tactos en el rodeo bovino." },
    ],
  }),
  component: CargarTacto,
});

function toISODate(d: Date) {
  return d.toISOString().split("T")[0];
}

const today = toISODate(new Date());

function CargarTacto() {
  const [caravana, setCaravana] = useState("");
  const [fecha, setFecha] = useState("");
  const [fechaError, setFechaError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<"positivo" | "negativo" | "dudoso">("positivo");
  const [dias, setDias] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ fpp?: string } | null>(null);

  function validateFecha(value: string) {
    if (value && value > today) {
      setFechaError("La fecha no puede ser futura");
      return false;
    }
    setFechaError(null);
    return true;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!validateFecha(fecha)) return;
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
    <div className="mx-auto max-w-lg">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Cargar Tacto</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Registrá un nuevo tacto rectal en el rodeo.
        </p>
      </div>

      <form onSubmit={onSubmit} className="form-card space-y-5">
        <Field label="Caravana" required>
          <CaravanaCombobox value={caravana} onChange={setCaravana} />
        </Field>

        <Field label="Fecha del tacto" required>
          <span className="input-icon">
            <Calendar size={16} />
            <input
              type="date"
              required
              max={today}
              value={fecha}
              onChange={(e) => {
                setFecha(e.target.value);
                validateFecha(e.target.value);
              }}
              className={cn("input", fechaError && "border-destructive focus:border-destructive focus:shadow-destructive/20")}
            />
          </span>
          {fechaError && (
            <p className="mt-1.5 text-sm text-destructive">{fechaError}</p>
          )}
        </Field>

        <Field label="Resultado" required>
          <span className="input-icon">
            <Stethoscope size={16} />
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
          </span>
        </Field>

        {resultado !== "negativo" && (
          <Field label="Días de gestación estimados" required>
            <span className="input-icon">
              <Activity size={16} />
              <input
                type="number"
                min={0}
                required
                value={dias}
                onChange={(e) => setDias(e.target.value === "" ? "" : Number(e.target.value))}
                className="input"
              />
            </span>
          </Field>
        )}

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Enviando…" : "Guardar tacto"}
        </button>

        {error && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm text-foreground">
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
      <span className="mb-1.5 block text-sm font-medium text-foreground">
        {label} {required && <span className="text-primary">*</span>}
      </span>
      {children}
    </label>
  );
}
