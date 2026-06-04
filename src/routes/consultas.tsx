import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Filter, Calendar, Inbox } from "lucide-react";
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
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Consultas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Histórico de tactos y pariciones registrados en el rodeo.
        </p>
      </div>
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
    <section className="form-card !p-6">
      <div className="mb-5 flex flex-wrap items-end gap-4">
        <h2 className="text-lg font-semibold text-foreground">Tactos</h2>
        <div className="ml-auto flex flex-wrap items-end gap-4">
          <label className="text-sm">
            <span className="mb-1 block text-muted-foreground">Filtrar por resultado</span>
            <span className="input-icon">
              <Filter size={16} />
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
            </span>
          </label>
          <button onClick={load} className="btn-primary btn-sm self-end">
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
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-muted-foreground">
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
                  <td colSpan={5} className="px-3 py-12">
                    <EmptyState />
                  </td>
                </tr>
              ) : (
                data.map((t, i) => (
                  <tr key={t.id_tacto ?? i} className="border-t hover:bg-muted/30 transition-colors">
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
    <section className="form-card !p-6">
      <div className="mb-5 flex flex-wrap items-end gap-4">
        <h2 className="text-lg font-semibold text-foreground">Pariciones</h2>
        <div className="ml-auto flex flex-wrap items-end gap-4">
          <label className="text-sm">
            <span className="mb-1 block text-muted-foreground">Desde</span>
            <span className="input-icon">
              <Calendar size={16} />
              <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="input" />
            </span>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-muted-foreground">Hasta</span>
            <span className="input-icon">
              <Calendar size={16} />
              <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="input" />
            </span>
          </label>
          <button onClick={load} className="btn-primary btn-sm self-end">
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
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-muted-foreground">
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
                  <td colSpan={5} className="px-3 py-10 text-center text-muted-foreground">
                    Sin resultados
                  </td>
                </tr>
              ) : (
                data.map((p, i) => (
                  <tr key={p.id_paricion ?? i} className="border-t hover:bg-muted/30 transition-colors">
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
  return <th className="px-4 py-2.5 font-medium">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-2.5 ${className}`}>{children}</td>;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <Inbox size={40} className="mb-3 text-gray-300" strokeWidth={1.5} />
      <p className="text-sm text-gray-400">No hay registros para mostrar</p>
    </div>
  );
}
