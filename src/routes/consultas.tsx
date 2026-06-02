import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api, type Tacto, type Paricion } from "@/lib/api";
import { Spinner } from "@/components/Spinner";

export const Route = createFileRoute("/consultas")({
  head: () => ({
    meta: [
      { title: "Consultas — Gestión Reproductiva" },
      { name: "description", content: "Consultar tactos y pariciones del rodeo." },
    ],
  }),
  component: Consultas,
});

function Consultas() {
  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <h1 className="text-2xl font-bold text-foreground">Consultas</h1>
      <TactosTable />
      <ParicionesTable />
    </div>
  );
}

function TactosTable() {
  const [resultado, setResultado] = useState("");
  const [data, setData] = useState<Tacto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const d = await api.listarTactos(resultado || undefined);
      setData(Array.isArray(d) ? d : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-end gap-3">
        <h2 className="text-lg font-semibold text-foreground">Tactos</h2>
        <div className="ml-auto flex flex-wrap items-end gap-2">
          <label className="text-sm">
            <span className="mb-1 block text-muted-foreground">Filtrar por resultado</span>
            <select
              value={resultado}
              onChange={(e) => setResultado(e.target.value)}
              className="input"
            >
              <option value="">Todos</option>
              <option value="positivo">Positivo</option>
              <option value="negativo">Negativo</option>
              <option value="dudoso">Dudoso</option>
            </select>
          </label>
          <button
            onClick={load}
            className="rounded-md border bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground hover:opacity-90"
          >
            Aplicar
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner /> Cargando…
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {!loading && !error && (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-muted-foreground">
              <tr>
                <Th>Caravana</Th>
                <Th>Fecha tacto</Th>
                <Th>Resultado</Th>
                <Th>Días gest.</Th>
                <Th>Fecha prob. parto</Th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                    Sin resultados
                  </td>
                </tr>
              ) : (
                data.map((t, i) => (
                  <tr key={t.id_tacto ?? i} className="border-t">
                    <Td>{t.caravana}</Td>
                    <Td>{t.fecha_tacto}</Td>
                    <Td className="capitalize">{t.resultado}</Td>
                    <Td>{t.dias_gestacion_estim}</Td>
                    <Td>{t.fecha_probable_parto ?? "—"}</Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function ParicionesTable() {
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [data, setData] = useState<Paricion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const d = await api.listarPariciones(desde || undefined, hasta || undefined);
      setData(Array.isArray(d) ? d : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-end gap-3">
        <h2 className="text-lg font-semibold text-foreground">Pariciones</h2>
        <div className="ml-auto flex flex-wrap items-end gap-2">
          <label className="text-sm">
            <span className="mb-1 block text-muted-foreground">Desde</span>
            <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="input" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-muted-foreground">Hasta</span>
            <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="input" />
          </label>
          <button
            onClick={load}
            className="rounded-md border bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground hover:opacity-90"
          >
            Aplicar
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner /> Cargando…
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {!loading && !error && (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-muted-foreground">
              <tr>
                <Th>Caravana</Th>
                <Th>Fecha parición</Th>
                <Th>Sexo</Th>
                <Th>Peso (kg)</Th>
                <Th>Observaciones</Th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                    Sin resultados
                  </td>
                </tr>
              ) : (
                data.map((p, i) => (
                  <tr key={p.id_paricion ?? i} className="border-t">
                    <Td>{p.caravana}</Td>
                    <Td>{p.fecha_paricion}</Td>
                    <Td className="capitalize">{p.sexo_cria}</Td>
                    <Td>{p.peso_nacer_kg}</Td>
                    <Td>{p.observaciones || "—"}</Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 font-medium">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 ${className}`}>{children}</td>;
}
