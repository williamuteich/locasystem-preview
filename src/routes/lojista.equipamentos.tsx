import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Search, Pencil, Trash2, Boxes } from "lucide-react";
import { useMockData } from "@/hooks/use-mock-data";
import { mockDb, type Equipamento } from "@/lib/mock-data";
import { getSession } from "@/lib/mock-auth";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/lojista/equipamentos")({
  head: () => ({
    meta: [{ title: "Equipamentos — Lojista" }],
  }),
  component: LojistaEquipamentos,
});

type FormState = {
  nome: string;
  descricao: string;
  valorDiaria: string;
  valorMulta: string;
};

const emptyForm: FormState = {
  nome: "",
  descricao: "",
  valorDiaria: "",
  valorMulta: "",
};

function LojistaEquipamentos() {
  const session = typeof window !== "undefined" ? getSession() : null;
  const lojistaId = session?.lojistaId ?? "";

  const equipamentos = useMockData((db) => db.equipamentosPorLojista(lojistaId));
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Equipamento | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return equipamentos;
    return equipamentos.filter(
      (e) =>
        e.nome.toLowerCase().includes(q) || e.descricao.toLowerCase().includes(q),
    );
  }, [equipamentos, search]);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (e: Equipamento) => {
    setEditing(e);
    setForm({
      nome: e.nome,
      descricao: e.descricao,
      valorDiaria: String(e.valorDiaria),
      valorMulta: String(e.valorMulta),
    });
    setDialogOpen(true);
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const valorDiaria = Number(form.valorDiaria);
    const valorMulta = Number(form.valorMulta);
    if (!form.nome.trim()) {
      toast.error("Informe o nome do equipamento.");
      return;
    }
    if (!Number.isFinite(valorDiaria) || valorDiaria <= 0) {
      toast.error("Valor da diária deve ser maior que zero.");
      return;
    }
    if (!Number.isFinite(valorMulta) || valorMulta < 0) {
      toast.error("Valor da multa diária inválido.");
      return;
    }

    if (editing) {
      mockDb.updateEquipamento(editing.id, {
        nome: form.nome,
        descricao: form.descricao,
        valorDiaria,
        valorMulta,
      });
      toast.success("Equipamento atualizado!");
    } else {
      mockDb.createEquipamento({
        lojistaId,
        nome: form.nome,
        descricao: form.descricao,
        valorDiaria,
        valorMulta,
      });
      toast.success("Equipamento cadastrado!");
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    const equip = equipamentos.find((e) => e.id === deleteId);
    if (equip && equip.status !== "disponivel") {
      toast.error("Não é possível excluir um equipamento alugado ou em atraso.");
      setDeleteId(null);
      return;
    }
    mockDb.deleteEquipamento(deleteId);
    toast.success("Equipamento removido.");
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus equipamentos</h1>
          <p className="mt-1 text-muted-foreground">
            Cadastre, edite e gerencie o estoque disponível para locação.
          </p>
        </div>
        <Button variant="hero" onClick={openNew}>
          <Plus className="h-4 w-4" />
          Novo equipamento
        </Button>
      </header>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar equipamento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {filtered.length} de {equipamentos.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <Boxes className="mx-auto mb-3 h-10 w-10 opacity-40" />
          {equipamentos.length === 0
            ? "Você ainda não cadastrou equipamentos."
            : "Nenhum equipamento encontrado."}
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Equipamento</th>
                  <th className="px-5 py-3 font-medium text-right">Diária</th>
                  <th className="px-5 py-3 font-medium text-right">Multa/dia</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-5 py-3">
                      <div className="font-medium">{e.nome}</div>
                      <div className="text-xs text-muted-foreground">{e.descricao}</div>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums">
                      {formatCurrency(e.valorDiaria)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                      {formatCurrency(e.valorMulta)}
                    </td>
                    <td className="px-5 py-3">
                      <EquipStatus status={e.status} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEdit(e)}
                          aria-label="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeleteId(e.id)}
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

      {/* Form dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar equipamento" : "Novo equipamento"}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do equipamento disponível para locação.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Ex.: Betoneira 400L"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                placeholder="Detalhes técnicos, capacidade, modelo..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="valorDiaria">Valor da diária (R$) *</Label>
                <Input
                  id="valorDiaria"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.valorDiaria}
                  onChange={(e) => setForm({ ...form, valorDiaria: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valorMulta">Multa por dia de atraso (R$) *</Label>
                <Input
                  id="valorMulta"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.valorMulta}
                  onChange={(e) => setForm({ ...form, valorMulta: e.target.value })}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="hero">
                {editing ? "Salvar alterações" : "Cadastrar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover equipamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O histórico de locações associadas será
              mantido.
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

function EquipStatus({ status }: { status: "disponivel" | "alugado" | "atrasado" }) {
  if (status === "disponivel")
    return (
      <Badge className="bg-success/15 text-success hover:bg-success/15 border-0">
        Disponível
      </Badge>
    );
  if (status === "alugado")
    return (
      <Badge className="bg-primary/15 text-primary hover:bg-primary/15 border-0">
        Alugado
      </Badge>
    );
  return (
    <Badge className="bg-destructive/15 text-destructive hover:bg-destructive/15 border-0">
      Em atraso
    </Badge>
  );
}
