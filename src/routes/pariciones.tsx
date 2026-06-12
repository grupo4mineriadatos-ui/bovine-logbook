import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Calendar, Venus, Scale, NotebookPen } from "lucide-react";
import { toast } from "sonner";
import { Field } from "./index";
import { CaravanaCombobox } from "@/components/CaravanaCombobox";
import { submitToN8N, N8N_PARICIONES_WEBHOOK_URL } from "@/lib/n8n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pariciones")({
  head: () => ({
    meta: [
      { title: "Cargar Parición — Gestión Reproductiva" },
      { name: "description", content: "Registrar pariciones en el rodeo bovino." },
    ],
  }),
  component: CargarParicion,
});

function getTodayLocalISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function CargarParicion() {
  const today = getTodayLocalISO();
  const [caravana, setCaravana] = useState("");
  const [fecha, setFecha] = useState("");
  const [fechaError, setFechaError] = useState<string | null>(null);
  const [sexo, setSexo] = useState<"macho" | "hembra">("macho");
  const [peso, setPeso] = useState<number | "">("");
  const [obs, setObs] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
    setSuccess(false);
    if (!validateFecha(fecha)) return;
    if (!caravana || !fecha || peso === "") {
      setError("Completá todos los campos requeridos.");
      return;
    }
    setLoading(true);
    try {
      await api.crearParicion({
        caravana,
        fecha_paricion: fecha,
        sexo_cria: sexo,
        peso_nacer_kg: Number(peso),
        observaciones: obs,
      });
      setSuccess(true);
      setCaravana("");
      setFecha("");
      setPeso("");
      setObs("");
      setSexo("macho");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.payload?.error || err.message);
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
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Cargar Parición</h1>
        <p className="mt-1 text-sm text-muted-foreground">Registrá el nacimiento de una cría.</p>
      </div>

      <form onSubmit={onSubmit} className="form-card space-y-5">
        <Field label="Caravana" required>
          <CaravanaCombobox value={caravana} onChange={setCaravana} />
        </Field>

        <Field label="Fecha de parición" required>
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

        <Field label="Sexo de la cría" required>
          <span className="input-icon">
            <Venus size={16} />
            <select
              value={sexo}
              onChange={(e) => setSexo(e.target.value as typeof sexo)}
              className="input"
            >
              <option value="macho">Macho</option>
              <option value="hembra">Hembra</option>
            </select>
          </span>
        </Field>

        <Field label="Peso al nacer (kg)" required>
          <span className="input-icon">
            <Scale size={16} />
            <input
              type="number"
              step="0.1"
              min={0}
              required
              value={peso}
              onChange={(e) => setPeso(e.target.value === "" ? "" : Number(e.target.value))}
              className="input"
            />
          </span>
        </Field>

        <Field label="Observaciones">
          <span className="input-icon">
            <NotebookPen size={16} className="!top-4 !-translate-y-0" />
            <textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              rows={3}
              className="input"
            />
          </span>
        </Field>

        <button type="submit" disabled={loading || !!fechaError} className="btn-primary">
          {loading ? "Enviando…" : "Guardar parición"}
        </button>

        {error && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm text-foreground">
            Parición registrada correctamente.
          </div>
        )}
      </form>
    </div>
  );
}
