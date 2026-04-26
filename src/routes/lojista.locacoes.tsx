import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, ArrowDownToLine, ClipboardList, AlertTriangle } from "lucide-react";
import { useMockData } from "@/hooks/use-mock-data";
import { mockDb, type Locacao } from "@/lib/mock-data";
import { getSession } from "@/lib/mock-auth";
import { formatCurrency, formatDate } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/lojista/locacoes")({
  head: () => ({
    meta: [{ title: "Locações — Lojista" }],
  }),
  component: LojistaLocacoes,
});

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysIso(iso: string, days: number) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function diffDays(aIso: string, bIso: string) {
  const a = new Date(aIso + "T00:00:00").getTime();
  const b = new Date(bIso + "T00:00:00").getTime();
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

type NewForm = {
  equipamentoId: string;
  cliente: string;
  clienteTelefone: string;
  dataSaida: string;
  dataPrevista: string;
};

function LojistaLocacoes() {
  const session = typeof window !== "undefined" ? getSession() : null;
  const lojistaId = session?.lojistaId ?? "";

  const equipamentos = useMockData((db) => db.equipamentosPorLojista(lojistaId));
  const locacoes = useMockData((db) => db.locacoesPorLojista(lojistaId));
  const clientes = useMockData((db) => db.clientesPorLojista(lojistaId));

  const [newOpen, setNewOpen] = useState(false);
  const [form, setForm] = useState<NewForm>(() => ({
    equipamentoId: "",
    cliente: "",
    clienteTelefone: "",
    dataSaida: todayIso(),
    dataPrevista: addDaysIso(todayIso(), 7),
  }));

  const [returnLoc, setReturnLoc] = useState<Locacao | null>(null);
  const [returnDate, setReturnDate] = useState<string>(todayIso());

  const disponiveis = equipamentos.filter((e) => e.status === "disponivel");
  const equipSelecionado = equipamentos.find((e) => e.id === form.equipamentoId);

  const dias = useMemo(() => {
    const d = diffDays(form.dataSaida, form.dataPrevista);
    return Math.max(1, d);
  }, [form.dataSaida, form.dataPrevista]);

  const valorPrevisto = equipSelecionado ? equipSelecionado.valorDiaria * dias : 0;

  const ativas = locacoes.filter((l) => l.status === "ativa" || l.status === "atrasada");
  const finalizadas = locacoes.filter((l) => l.status === "finalizada");

  const openNew = () => {
    setForm({
      equipamentoId: "",
      cliente: "",
      clienteTelefone: "",
      dataSaida: todayIso(),
      dataPrevista: addDaysIso(todayIso(), 7),
    });
    setNewOpen(true);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.equipamentoId) {
      toast.error("Selecione um equipamento.");
      return;
    }
    if (!form.cliente.trim()) {
      toast.error("Informe o nome do cliente.");
      return;
    }
    if (diffDays(form.dataSaida, form.dataPrevista) < 1) {
      toast.error("A data prevista deve ser posterior à data de saída.");
      return;
    }

    const result = mockDb.createLocacao({
      lojistaId,
      equipamentoId: form.equipamentoId,
      cliente: form.cliente.trim(),
      clienteTelefone: form.clienteTelefone.trim() || undefined,
      dataSaida: form.dataSaida,
      dataPrevista: form.dataPrevista,
    });

    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success(`Locação criada — ${formatCurrency(result.valorPrevisto)} previsto.`);
    setNewOpen(false);
  };

  const openReturn = (loc: Locacao) => {
    setReturnLoc(loc);
    setReturnDate(todayIso());
  };

  const previewMulta = useMemo(() => {
    if (!returnLoc) return null;
    return mockDb.calcularMultaPrevista(returnLoc.id, returnDate);
  }, [returnLoc, returnDate]);

  const handleReturn = () => {
    if (!returnLoc) return;
    const result = mockDb.devolverLocacao(returnLoc.id, returnDate);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    if ((result.diasAtraso ?? 0) > 0) {
      toast.success(
        `Devolução registrada com ${result.diasAtraso} dia(s) de atraso. Multa: ${formatCurrency(
          result.valorMultaTotal ?? 0,
        )}`,
      );
    } else {
      toast.success("Devolução registrada no prazo.");
    }
    setReturnLoc(null);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Locações</h1>
          <p className="mt-1 text-muted-foreground">
            Registre saídas, acompanhe locações ativas e processe devoluções com cálculo
            automático de multa.
          </p>
        </div>
        <Button variant="hero" onClick={openNew} disabled={disponiveis.length === 0}>
          <Plus className="h-4 w-4" />
          Nova locação
        </Button>
      </header>

      {disponiveis.length === 0 && equipamentos.length > 0 && (
        <Card className="border-warning/40 bg-warning/5 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">Nenhum equipamento disponível</p>
            <p className="text-muted-foreground">
              Todos os seus equipamentos estão alugados ou em atraso. Processe alguma
              devolução para liberar estoque.
            </p>
          </div>
        </Card>
      )}

      <Tabs defaultValue="ativas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ativas">
            Ativas <span className="ml-2 text-xs text-muted-foreground">({ativas.length})</span>
          </TabsTrigger>
          <TabsTrigger value="finalizadas">
            Histórico <span className="ml-2 text-xs text-muted-foreground">({finalizadas.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ativas">
          <LocacoesTable
            rows={ativas}
            equipamentos={equipamentos}
            onReturn={openReturn}
            emptyText="Nenhuma locação ativa. Clique em 'Nova locação' para começar."
          />
        </TabsContent>

        <TabsContent value="finalizadas">
          <LocacoesTable
            rows={finalizadas}
            equipamentos={equipamentos}
            onReturn={openReturn}
            emptyText="Nenhuma locação finalizada ainda."
            historico
          />
        </TabsContent>
      </Tabs>

      {/* Nova locação */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova locação</DialogTitle>
            <DialogDescription>
              Registre a saída de um equipamento para um cliente.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="equipamento">Equipamento *</Label>
              <Select
                value={form.equipamentoId}
                onValueChange={(v) => setForm({ ...form, equipamentoId: v })}
              >
                <SelectTrigger id="equipamento">
                  <SelectValue placeholder="Selecione um equipamento disponível" />
                </SelectTrigger>
                <SelectContent>
                  {disponiveis.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.nome} — {formatCurrency(e.valorDiaria)}/dia
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {clientes.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="clienteSelect">Cliente cadastrado</Label>
                <Select
                  value=""
                  onValueChange={(id) => {
                    const c = clientes.find((x) => x.id === id);
                    if (c) {
                      setForm({
                        ...form,
                        cliente: c.nome,
                        clienteTelefone: c.telefone,
                      });
                    }
                  }}
                >
                  <SelectTrigger id="clienteSelect">
                    <SelectValue placeholder="Selecionar cliente cadastrado (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome} — {c.documento}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente *</Label>
              <Input
                id="cliente"
                value={form.cliente}
                onChange={(e) => setForm({ ...form, cliente: e.target.value })}
                placeholder="Nome ou razão social"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={form.clienteTelefone}
                onChange={(e) => setForm({ ...form, clienteTelefone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="dataSaida">Data de saída *</Label>
                <Input
                  id="dataSaida"
                  type="date"
                  value={form.dataSaida}
                  onChange={(e) => setForm({ ...form, dataSaida: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataPrevista">Devolução prevista *</Label>
                <Input
                  id="dataPrevista"
                  type="date"
                  min={form.dataSaida}
                  value={form.dataPrevista}
                  onChange={(e) => setForm({ ...form, dataPrevista: e.target.value })}
                  required
                />
              </div>
            </div>

            {equipSelecionado && (
              <div className="rounded-md bg-muted px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Diária</span>
                  <span className="font-medium tabular-nums">
                    {formatCurrency(equipSelecionado.valorDiaria)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Período</span>
                  <span className="font-medium tabular-nums">{dias} dia(s)</span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
                  <span className="font-semibold">Valor previsto</span>
                  <span className="font-bold tabular-nums text-primary">
                    {formatCurrency(valorPrevisto)}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Em caso de atraso, multa de{" "}
                  <strong>{formatCurrency(equipSelecionado.valorMulta)}</strong> por dia.
                </p>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setNewOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="hero">
                Registrar saída
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Devolução */}
      <Dialog open={!!returnLoc} onOpenChange={(o) => !o && setReturnLoc(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar devolução</DialogTitle>
            <DialogDescription>
              Confirme a data de devolução. A multa por atraso será calculada
              automaticamente.
            </DialogDescription>
          </DialogHeader>

          {returnLoc && (
            <div className="space-y-4">
              <div className="rounded-md border border-border p-3 text-sm">
                <p className="font-medium">
                  {equipamentos.find((e) => e.id === returnLoc.equipamentoId)?.nome ?? "—"}
                </p>
                <p className="text-muted-foreground">Cliente: {returnLoc.cliente}</p>
                <p className="text-muted-foreground">
                  Saída: {formatDate(returnLoc.dataSaida)} · Previsto:{" "}
                  {formatDate(returnLoc.dataPrevista)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataDevolucao">Data da devolução</Label>
                <Input
                  id="dataDevolucao"
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                />
              </div>

              {previewMulta && (
                <div className="rounded-md bg-muted px-4 py-3 text-sm space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Valor previsto</span>
                    <span className="tabular-nums">
                      {formatCurrency(returnLoc.valorPrevisto)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Dias de atraso</span>
                    <span className="tabular-nums">{previewMulta.diasAtraso}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Multa ({formatCurrency(returnLoc.valorMultaDiaria)}/dia)
                    </span>
                    <span
                      className={`tabular-nums ${
                        previewMulta.valorMultaTotal > 0 ? "text-destructive font-semibold" : ""
                      }`}
                    >
                      {formatCurrency(previewMulta.valorMultaTotal)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
                    <span className="font-semibold">Total a cobrar</span>
                    <span className="font-bold tabular-nums text-primary">
                      {formatCurrency(previewMulta.valorTotal)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnLoc(null)}>
              Cancelar
            </Button>
            <Button variant="success" onClick={handleReturn}>
              <ArrowDownToLine className="h-4 w-4" />
              Confirmar devolução
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LocacoesTable({
  rows,
  equipamentos,
  onReturn,
  emptyText,
  historico = false,
}: {
  rows: Locacao[];
  equipamentos: ReturnType<typeof mockDb.equipamentosPorLojista>;
  onReturn: (loc: Locacao) => void;
  emptyText: string;
  historico?: boolean;
}) {
  if (rows.length === 0) {
    return (
      <Card className="p-12 text-center text-muted-foreground">
        <ClipboardList className="mx-auto mb-3 h-10 w-10 opacity-40" />
        {emptyText}
      </Card>
    );
  }

  const sorted = [...rows].sort((a, b) => {
    if (historico) return b.dataSaida.localeCompare(a.dataSaida);
    return a.dataPrevista.localeCompare(b.dataPrevista);
  });

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3 font-medium">Equipamento</th>
              <th className="px-5 py-3 font-medium">Cliente</th>
              <th className="px-5 py-3 font-medium">Saída</th>
              <th className="px-5 py-3 font-medium">
                {historico ? "Devolução" : "Previsto"}
              </th>
              <th className="px-5 py-3 font-medium text-right">Valor</th>
              <th className="px-5 py-3 font-medium">Status</th>
              {!historico && <th className="px-5 py-3 font-medium text-right">Ação</th>}
            </tr>
          </thead>
          <tbody>
            {sorted.map((loc) => {
              const equip = equipamentos.find((e) => e.id === loc.equipamentoId);
              return (
                <tr key={loc.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-5 py-3 font-medium">{equip?.nome ?? "—"}</td>
                  <td className="px-5 py-3">
                    {loc.cliente}
                    {loc.clienteTelefone && (
                      <div className="text-xs text-muted-foreground">
                        {loc.clienteTelefone}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground tabular-nums">
                    {formatDate(loc.dataSaida)}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground tabular-nums">
                    {historico
                      ? formatDate(loc.dataDevolucao)
                      : formatDate(loc.dataPrevista)}
                    {historico && (loc.diasAtraso ?? 0) > 0 && (
                      <div className="text-xs text-destructive">
                        +{loc.diasAtraso} dia(s) atraso
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums">
                    {formatCurrency(loc.valorTotal)}
                  </td>
                  <td className="px-5 py-3">
                    <LocStatus status={loc.status} />
                  </td>
                  {!historico && (
                    <td className="px-5 py-3 text-right">
                      <Button size="sm" variant="success" onClick={() => onReturn(loc)}>
                        <ArrowDownToLine className="h-3.5 w-3.5" />
                        Devolver
                      </Button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function LocStatus({ status }: { status: Locacao["status"] }) {
  if (status === "ativa")
    return (
      <Badge className="bg-primary/15 text-primary hover:bg-primary/15 border-0">Ativa</Badge>
    );
  if (status === "atrasada")
    return (
      <Badge className="bg-destructive/15 text-destructive hover:bg-destructive/15 border-0">
        Atrasada
      </Badge>
    );
  return (
    <Badge className="bg-success/15 text-success hover:bg-success/15 border-0">
      Finalizada
    </Badge>
  );
}
