import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Calendar, Stethoscope, Activity } from "lucide-react";
import { toast } from "sonner";
import { Tag } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CARAVANAS } from "@/lib/caravanas";
import { cn } from "@/lib/utils";
import { submitToN8N, N8N_TACTOS_WEBHOOK_URL } from "@/lib/n8n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cargar Tacto — Gestión Reproductiva" },
      { name: "description", content: "Registrar tactos en el rodeo bovino." },
    ],
  }),
  component: CargarTacto,
});

function getTodayLocalISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function CargarTacto() {
  const today = getTodayLocalISO();
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
      await submitToN8N(N8N_TACTOS_WEBHOOK_URL, {
        action: "tacto",
        caravana,
        fecha_tacto: fecha,
        resultado,
        dias_gestacion: requiereDias ? Number(dias) : null,
      });
      toast.success("Tacto registrado correctamente.");
      setSuccess({});
      setCaravana("");
      setFecha("");
      setDias("");
      setResultado("positivo");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setError(msg);
      toast.error(`No se pudo registrar el tacto: ${msg}`);
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
          <Select value={caravana} onValueChange={setCaravana}>
            <SelectTrigger className="input pl-9 relative">
              <Tag size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <SelectValue placeholder="Seleccioná una caravana" />
            </SelectTrigger>
            <SelectContent>
              {CARAVANAS.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              className={cn("input", fechaError && "border-destructive")}
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

        <button type="submit" disabled={loading || !!fechaError} className="btn-primary">
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
