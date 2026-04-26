import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Search, Pencil, Trash2, Mail, Phone, MapPin } from "lucide-react";
import { useMockData } from "@/hooks/use-mock-data";
import { mockDb, type Lojista } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/lojistas")({
  head: () => ({
    meta: [{ title: "Lojistas — RentalPro Admin" }],
  }),
  component: LojistasPage,
});

type FormState = Omit<Lojista, "id" | "criadoEm">;

const emptyForm: FormState = {
  nome: "",
  email: "",
  telefone: "",
  cnpj: "",
  cidade: "",
  estado: "",
  ativo: true,
};

function LojistasPage() {
  const lojistas = useMockData((db) => db.listLojistas());
  const equipamentos = useMockData((db) => db.listEquipamentos());
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Lojista | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return lojistas;
    return lojistas.filter(
      (l) =>
        l.nome.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.cidade.toLowerCase().includes(q) ||
        l.cnpj.includes(q),
    );
  }, [lojistas, search]);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (l: Lojista) => {
    setEditing(l);
    const { id: _id, criadoEm: _criadoEm, ...rest } = l;
    setForm(rest);
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim() || !form.email.trim()) {
      toast.error("Nome e e-mail são obrigatórios.");
      return;
    }
    if (editing) {
      mockDb.updateLojista(editing.id, form);
      toast.success("Lojista atualizado com sucesso!");
    } else {
      mockDb.createLojista(form);
      toast.success("Lojista cadastrado com sucesso!");
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    mockDb.deleteLojista(deleteId);
    toast.success("Lojista removido.");
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lojistas</h1>
          <p className="mt-1 text-muted-foreground">
            Gerencie todas as locadoras parceiras cadastradas na plataforma.
          </p>
        </div>
        <Button variant="hero" onClick={openNew}>
          <Plus className="h-4 w-4" />
          Novo lojista
        </Button>
      </header>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, e-mail, cidade ou CNPJ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {filtered.length} de {lojistas.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Nenhum lojista encontrado.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((l) => {
            const equipCount = equipamentos.filter((e) => e.lojistaId === l.id).length;
            return (
              <Card key={l.id} className="p-5 shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-shadow flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold truncate">{l.nome}</h3>
                    <p className="text-xs text-muted-foreground font-mono">{l.cnpj}</p>
                  </div>
                  {l.ativo ? (
                    <Badge className="bg-success/15 text-success hover:bg-success/15 border-0">
                      Ativo
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Inativo</Badge>
                  )}
                </div>

                <ul className="mt-4 space-y-2 text-sm text-muted-foreground flex-1">
                  <li className="flex items-center gap-2 truncate">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{l.email}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    {l.telefone}
                  </li>
                  <li className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {l.cidade}/{l.estado}
                  </li>
                </ul>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{equipCount}</span>{" "}
                    equipamentos · desde {formatDate(l.criadoEm)}
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(l)} aria-label="Editar">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDeleteId(l.id)}
                      aria-label="Excluir"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Form dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar lojista" : "Novo lojista"}</DialogTitle>
            <DialogDescription>
              Preencha os dados da locadora parceira.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Razão social *</Label>
              <Input
                id="nome"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  value={form.cnpj}
                  onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
                  placeholder="00.000.000/0000-00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={form.cidade}
                  onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">UF</Label>
                <Input
                  id="estado"
                  value={form.estado}
                  onChange={(e) =>
                    setForm({ ...form, estado: e.target.value.toUpperCase().slice(0, 2) })
                  }
                  maxLength={2}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <p className="text-sm font-medium">Lojista ativo</p>
                <p className="text-xs text-muted-foreground">
                  Quando inativo, o lojista não consegue acessar o sistema.
                </p>
              </div>
              <Switch
                checked={form.ativo}
                onCheckedChange={(v) => setForm({ ...form, ativo: v })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="hero">
                {editing ? "Salvar alterações" : "Cadastrar lojista"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover lojista?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Os dados deste lojista serão removidos do
              ambiente de demonstração.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
