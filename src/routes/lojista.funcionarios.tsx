import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Plus, Search, Pencil, Trash2, UserCog } from "lucide-react";
import { useMockData } from "@/hooks/use-mock-data";
import { mockDb, type Funcionario } from "@/lib/mock-data";
import { getSession } from "@/lib/mock-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/lojista/funcionarios")({
  head: () => ({ meta: [{ title: "Funcionários — Lojista" }] }),
  component: LojistaFuncionarios,
});

type FormState = {
  nome: string;
  email: string;
  cargo: string;
  telefone: string;
  ativo: boolean;
};

const empty: FormState = {
  nome: "",
  email: "",
  cargo: "Atendente",
  telefone: "",
  ativo: true,
};

function LojistaFuncionarios() {
  const session = typeof window !== "undefined" ? getSession() : null;
  const lojistaId = session?.lojistaId ?? "";

  const funcionarios = useMockData((db) => db.funcionariosPorLojista(lojistaId));
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Funcionario | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return funcionarios;
    return funcionarios.filter(
      (f) =>
        f.nome.toLowerCase().includes(q) ||
        f.email.toLowerCase().includes(q) ||
        f.cargo.toLowerCase().includes(q),
    );
  }, [funcionarios, search]);

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (f: Funcionario) => {
    setEditing(f);
    setForm({
      nome: f.nome,
      email: f.email,
      cargo: f.cargo,
      telefone: f.telefone ?? "",
      ativo: f.ativo,
    });
    setOpen(true);
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form.nome.trim()) {
      toast.error("Informe o nome.");
      return;
    }
    if (!form.email.trim()) {
      toast.error("Informe um e-mail.");
      return;
    }
    if (!form.cargo.trim()) {
      toast.error("Informe o cargo.");
      return;
    }

    const payload = {
      lojistaId,
      nome: form.nome.trim(),
      email: form.email.trim().toLowerCase(),
      cargo: form.cargo.trim(),
      telefone: form.telefone.trim() || undefined,
      ativo: form.ativo,
    };

    if (editing) {
      mockDb.updateFuncionario(editing.id, payload);
      toast.success("Funcionário atualizado!");
    } else {
      mockDb.createFuncionario(payload);
      toast.success("Funcionário cadastrado!");
    }
    setOpen(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    mockDb.deleteFuncionario(deleteId);
    toast.success("Funcionário removido.");
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Funcionários</h1>
          <p className="mt-1 text-muted-foreground">
            Gerencie a equipe que opera o sistema na sua loja.
          </p>
        </div>
        <Button variant="hero" onClick={openNew}>
          <Plus className="h-4 w-4" />
          Novo funcionário
        </Button>
      </header>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, e-mail ou cargo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {filtered.length} de {funcionarios.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <UserCog className="mx-auto mb-3 h-10 w-10 opacity-40" />
          {funcionarios.length === 0
            ? "Você ainda não cadastrou funcionários."
            : "Nenhum funcionário encontrado."}
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Nome</th>
                  <th className="px-5 py-3 font-medium">E-mail</th>
                  <th className="px-5 py-3 font-medium">Cargo</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((f) => (
                  <tr key={f.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-5 py-3 font-medium">{f.nome}</td>
                    <td className="px-5 py-3 text-muted-foreground">{f.email}</td>
                    <td className="px-5 py-3">{f.cargo}</td>
                    <td className="px-5 py-3">
                      {f.ativo ? (
                        <Badge className="bg-success/15 text-success hover:bg-success/15 border-0">
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="outline">Inativo</Badge>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEdit(f)}
                          aria-label="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeleteId(f.id)}
                          aria-label="Excluir"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar funcionário" : "Novo funcionário"}
            </DialogTitle>
            <DialogDescription>
              Cadastre membros da equipe que terão acesso ao sistema.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                required
              />
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo *</Label>
                <Input
                  id="cargo"
                  value={form.cargo}
                  onChange={(e) => setForm({ ...form, cargo: e.target.value })}
                  placeholder="Atendente, Gerente..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <Label htmlFor="ativo" className="cursor-pointer">
                  Acesso ativo
                </Label>
                <p className="text-xs text-muted-foreground">
                  Funcionários inativos não conseguem operar o sistema.
                </p>
              </div>
              <Switch
                id="ativo"
                checked={form.ativo}
                onCheckedChange={(v) => setForm({ ...form, ativo: v })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="hero">
                {editing ? "Salvar alterações" : "Cadastrar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover funcionário?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
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
