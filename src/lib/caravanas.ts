import { useCallback, useEffect, useSyncExternalStore } from "react";
import { api } from "./api";
import { VACAS_MAESTRA } from "./vacasMaestra";

const KEY = "caravanas:v2";

export type Animal = {
  caravana: string;
  categoria: string;
  sexo?: "macho" | "hembra";
  estado?: string;
  rodeo?: string;
  fecha_nacimiento?: string;
};

type State = Animal[];

let state: State = load();
const listeners = new Set<() => void>();

function load(): State {
  if (typeof window === "undefined") return seedDefaults();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as State;
  } catch {
    // ignore
  }
  const seeded = seedDefaults();
  persistValue(seeded);
  return seeded;
}

function seedDefaults(): State {
  return VACAS_MAESTRA.map((v) => ({
    caravana: v.caravana,
    categoria: v.categoria,
    estado: v.estado,
    rodeo: v.rodeo,
    fecha_nacimiento: v.fecha_nacimiento,
  }));
}

function persistValue(value: State) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function persist() {
  persistValue(state);
}

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return state;
}
function getServerSnapshot(): State {
  return seedDefaults();
}

export function addCaravana(animal: Animal) {
  if (!animal.caravana) return;
  if (state.some((a) => a.caravana === animal.caravana)) return;
  state = [...state, animal];
  persist();
  emit();
}

export function addCaravanasBulk(caravanas: string[]) {
  const known = new Set(state.map((a) => a.caravana));
  const toAdd = caravanas
    .filter((c) => c && !known.has(c))
    .map((c) => ({ caravana: c, categoria: "vaca" }));
  if (toAdd.length === 0) return;
  state = [...state, ...toAdd];
  persist();
  emit();
}

let seeded = false;
async function seedFromApi() {
  if (seeded) return;
  seeded = true;
  try {
    const [tactos, pariciones] = await Promise.allSettled([
      api.listarTactos(),
      api.listarPariciones(),
    ]);
    const all: string[] = [];
    if (tactos.status === "fulfilled" && Array.isArray(tactos.value)) {
      all.push(...tactos.value.map((t) => t.caravana));
    }
    if (pariciones.status === "fulfilled" && Array.isArray(pariciones.value)) {
      all.push(...pariciones.value.map((p) => p.caravana));
    }
    addCaravanasBulk(all);
  } catch {
    // ignore
  }
}

export function useCaravanas() {
  const list = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  useEffect(() => {
    seedFromApi();
  }, []);
  const add = useCallback((a: Animal) => addCaravana(a), []);
  return { list, add };
}
