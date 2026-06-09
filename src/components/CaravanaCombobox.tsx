import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Plus, Tag } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useCaravanas, type Animal } from "@/lib/caravanas";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

export function CaravanaCombobox({ value, onChange, placeholder = "Buscar o ingresar caravana…" }: Props) {
  const { list, add } = useCaravanas();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingId, setPendingId] = useState("");
  const [categoria, setCategoria] = useState("vaca");

  const typed = search.trim();
  const matches = useMemo(
    () => list.filter((a) => a.caravana.toLowerCase().includes(typed.toLowerCase())),
    [list, typed],
  );
  const exact = typed && list.some((a) => a.caravana.toLowerCase() === typed.toLowerCase());

  function openAdd(id: string) {
    setPendingId(id);
    setCategoria("vaca");
    setOpen(false);
    setModalOpen(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!pendingId) return;
    const animal: Animal = { caravana: pendingId, categoria };
    add(animal);
    onChange(pendingId);
    setModalOpen(false);
    setSearch("");
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            className="input relative flex w-full items-center justify-between pl-9 pr-3 text-left"
          >
            <Tag
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <span className={cn("truncate", !value && "text-muted-foreground")}>
              {value || placeholder}
            </span>
            <ChevronsUpDown size={16} className="ml-2 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Escribí la caravana…"
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              {matches.length > 0 && (
                <CommandGroup heading="Animales">
                  {matches.slice(0, 50).map((a) => (
                    <CommandItem
                      key={a.caravana}
                      value={a.caravana}
                      onSelect={() => {
                        onChange(a.caravana);
                        setSearch("");
                        setOpen(false);
                      }}
                    >
                      <Check
                        size={14}
                        className={cn(
                          "mr-2",
                          value === a.caravana ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <span className="font-medium">{a.caravana}</span>
                      {a.sexo && (
                        <span className="ml-auto text-xs capitalize text-muted-foreground">
                          {a.sexo}
                        </span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {typed && !exact && (
                <CommandGroup>
                  <CommandItem
                    value={`__add__${typed}`}
                    onSelect={() => openAdd(typed)}
                    className="text-primary"
                  >
                    <Plus size={14} className="mr-2" />
                    Agregar nueva caravana &ldquo;{typed}&rdquo;
                  </CommandItem>
                </CommandGroup>
              )}
              {!typed && matches.length === 0 && (
                <CommandEmpty>Escribí una caravana para buscar.</CommandEmpty>
              )}
              {typed && matches.length === 0 && exact && (
                <CommandEmpty>Sin coincidencias.</CommandEmpty>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Animal</DialogTitle>
            <DialogDescription>
              Agregá rápidamente el animal para poder continuar con el registro.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Caravana</span>
              <input
                type="text"
                value={pendingId}
                onChange={(e) => setPendingId(e.target.value)}
                className="input"
                required
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Categoría</span>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="input"
              >
                <option value="vaca">Vaca</option>
                <option value="vaquillona">Vaquillona</option>
                <option value="ternero">Ternero/a</option>
                <option value="toro">Toro</option>
              </select>
            </label>
            <DialogFooter>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-full px-4 py-2 text-sm text-muted-foreground hover:bg-accent"
              >
                Cancelar
              </button>
              <button type="submit" className="btn-primary btn-sm">
                Guardar y Continuar
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
