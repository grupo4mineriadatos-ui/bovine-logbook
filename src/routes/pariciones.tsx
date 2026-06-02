import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Spinner } from "@/components/Spinner";
import { Field } from "./index";

export const Route = createFileRoute("/pariciones")({
  head: () => ({
    meta: [
      { title: "Cargar Parición — Gestión Reproductiva" },
      { name: "description", content: "Registrar pariciones en el rodeo bovino." },
    ],
  }),
  component: CargarParicion,
});

function CargarParicion() {
  const [caravana, setCaravana] = useState("");
  const [fecha, setFecha] = useState("");
  const [sexo, setSexo] = useState<"macho" | "hembra">("macho");
  const [peso, setPeso] = useState<number | "">("");
  const [obs, setObs] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
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
    <div className="mx-auto max-w-xl">
      <h1 className="mb-1 text-2xl font-bold text-foreground">Cargar Parición</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Registrá el nacimiento de una cría.
      </p>

      <form onSubmit={onSubmit} className="space-y-4 rounded-lg border bg-card p-4 shadow-sm">
        <Field label="Caravana" required>
          <input
            type="text"
            required
            value={caravana}
            onChange={(e) => setCaravana(e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Fecha de parición" required>
          <input
            type="date"
            required
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Sexo de la cría" required>
          <select
            value={sexo}
            onChange={(e) => setSexo(e.target.value as typeof sexo)}
            className="input"
          >
            <option value="macho">Macho</option>
            <option value="hembra">Hembra</option>
          </select>
        </Field>

        <Field label="Peso al nacer (kg)" required>
          <input
            type="number"
            step="0.1"
            min={0}
            required
            value={peso}
            onChange={(e) => setPeso(e.target.value === "" ? "" : Number(e.target.value))}
            className="input"
          />
        </Field>

        <Field label="Observaciones">
          <textarea
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            rows={3}
            className="input"
          />
        </Field>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading && <Spinner />}
          {loading ? "Enviando…" : "Guardar parición"}
        </button>

        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm text-foreground">
            Parición registrada correctamente.
          </div>
        )}
      </form>
    </div>
  );
}
