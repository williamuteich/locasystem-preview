import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMockData } from "@/hooks/use-mock-data";
import { formatCurrency } from "@/lib/format";
import { TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react";

export const Route = createFileRoute("/admin/relatorios")({
  head: () => ({
    meta: [{ title: "Relatórios — RentalPro Admin" }],
  }),
  component: RelatoriosPage,
});

function RelatoriosPage() {
  const lojistas = useMockData((db) => db.listLojistas());
  const locacoes = useMockData((db) => db.listLocacoes());
  const [lojistaFilter, setLojistaFilter] = useState("all");

  const filtered = useMemo(() => {
    if (lojistaFilter === "all") return locacoes;
    return locacoes.filter((l) => l.lojistaId === lojistaFilter);
  }, [locacoes, lojistaFilter]);

  // Agregação por dia (saídas e devoluções)
  const porDia = useMemo(() => {
    const map = new Map<string, { saidas: number; devolucoes: number; valor: number }>();
    filtered.forEach((loc) => {
      const ds = loc.dataSaida.slice(0, 10);
      const cur = map.get(ds) ?? { saidas: 0, devolucoes: 0, valor: 0 };
      cur.saidas += 1;
      cur.valor += loc.valorTotal;
      map.set(ds, cur);
      if (loc.dataDevolucao) {
        const dd = loc.dataDevolucao.slice(0, 10);
        const cur2 = map.get(dd) ?? { saidas: 0, devolucoes: 0, valor: 0 };
        cur2.devolucoes += 1;
        map.set(dd, cur2);
      }
    });
    return Array.from(map.entries())
      .map(([dia, v]) => ({ dia, ...v }))
      .sort((a, b) => a.dia.localeCompare(b.dia));
  }, [filtered]);

  // Por mês
  const porMes = useMemo(() => {
    const map = new Map<string, { saidas: number; devolucoes: number; valor: number }>();
    filtered.forEach((loc) => {
      const ms = loc.dataSaida.slice(0, 7);
      const cur = map.get(ms) ?? { saidas: 0, devolucoes: 0, valor: 0 };
      cur.saidas += 1;
      cur.valor += loc.valorTotal;
      map.set(ms, cur);
      if (loc.dataDevolucao) {
        const md = loc.dataDevolucao.slice(0, 7);
        const cur2 = map.get(md) ?? { saidas: 0, devolucoes: 0, valor: 0 };
        cur2.devolucoes += 1;
        map.set(md, cur2);
      }
    });
    return Array.from(map.entries())
      .map(([mes, v]) => ({ mes, ...v }))
      .sort((a, b) => a.mes.localeCompare(b.mes));
  }, [filtered]);

  // Por lojista
  const porLojista = useMemo(() => {
    return lojistas
      .map((l) => {
        const locs = locacoes.filter((loc) => loc.lojistaId === l.id);
        const valor = locs.reduce((s, x) => s + x.valorTotal, 0);
        return { lojista: l, qtd: locs.length, valor };
      })
      .sort((a, b) => b.valor - a.valor);
  }, [lojistas, locacoes]);

  const totalSaidas = filtered.length;
  const totalDevolucoes = filtered.filter((l) => !!l.dataDevolucao).length;
  const totalValor = filtered.reduce((s, l) => s + l.valorTotal, 0);
  const ticketMedio = filtered.length ? totalValor / filtered.length : 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="mt-1 text-muted-foreground">
            Fluxo de entradas/saídas e valores gerados por período.
          </p>
        </div>
        <Select value={lojistaFilter} onValueChange={setLojistaFilter}>
          <SelectTrigger className="sm:w-64">
            <SelectValue placeholder="Filtrar por lojista" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os lojistas</SelectItem>
            {lojistas.map((l) => (
              <SelectItem key={l.id} value={l.id}>
                {l.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={TrendingUp} label="Saídas" value={totalSaidas.toString()} tone="primary" />
        <KpiCard icon={TrendingDown} label="Devoluções" value={totalDevolucoes.toString()} tone="success" />
        <KpiCard icon={DollarSign} label="Valor total" value={formatCurrency(totalValor)} tone="neutral" />
        <KpiCard icon={Calendar} label="Ticket médio" value={formatCurrency(ticketMedio)} tone="neutral" />
      </section>

      <Tabs defaultValue="diario" className="space-y-4">
        <TabsList>
          <TabsTrigger value="diario">Por dia</TabsTrigger>
          <TabsTrigger value="mensal">Por mês</TabsTrigger>
          <TabsTrigger value="lojista">Por lojista</TabsTrigger>
        </TabsList>

        <TabsContent value="diario">
          <FluxoTable
            rows={porDia.map((r) => ({
              periodo: new Date(r.dia).toLocaleDateString("pt-BR"),
              saidas: r.saidas,
              devolucoes: r.devolucoes,
              valor: r.valor,
            }))}
            colLabel="Data"
          />
        </TabsContent>

        <TabsContent value="mensal">
          <FluxoTable
            rows={porMes.map((r) => ({
              periodo: new Date(r.mes + "-01").toLocaleDateString("pt-BR", {
                month: "long",
                year: "numeric",
              }),
              saidas: r.saidas,
              devolucoes: r.devolucoes,
              valor: r.valor,
            }))}
            colLabel="Mês"
          />
        </TabsContent>

        <TabsContent value="lojista">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Lojista</th>
                    <th className="px-5 py-3 font-medium">Cidade</th>
                    <th className="px-5 py-3 font-medium text-right">Locações</th>
                    <th className="px-5 py-3 font-medium text-right">Receita total</th>
                  </tr>
                </thead>
                <tbody>
                  {porLojista.map(({ lojista, qtd, valor }) => (
                    <tr key={lojista.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-5 py-3 font-medium">{lojista.nome}</td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {lojista.cidade}/{lojista.estado}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">{qtd}</td>
                      <td className="px-5 py-3 text-right font-semibold tabular-nums">
                        {formatCurrency(valor)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted/50 font-semibold">
                  <tr>
                    <td className="px-5 py-3" colSpan={2}>
                      Total geral
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {porLojista.reduce((s, x) => s + x.qtd, 0)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {formatCurrency(porLojista.reduce((s, x) => s + x.valor, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: "primary" | "success" | "neutral";
}) {
  const tint =
    tone === "primary"
      ? "bg-primary/10 text-primary"
      : tone === "success"
        ? "bg-success/10 text-success"
        : "bg-muted text-foreground";
  return (
    <Card className="p-5">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tint}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </Card>
  );
}

function FluxoTable({
  rows,
  colLabel,
}: {
  rows: { periodo: string; saidas: number; devolucoes: number; valor: number }[];
  colLabel: string;
}) {
  if (rows.length === 0) {
    return (
      <Card className="p-12 text-center text-muted-foreground">
        Sem dados para o período selecionado.
      </Card>
    );
  }
  const totalValor = rows.reduce((s, r) => s + r.valor, 0);
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3 font-medium">{colLabel}</th>
              <th className="px-5 py-3 font-medium text-right">Saídas</th>
              <th className="px-5 py-3 font-medium text-right">Devoluções</th>
              <th className="px-5 py-3 font-medium text-right">Valor gerado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.periodo} className="border-t border-border hover:bg-muted/30">
                <td className="px-5 py-3 font-medium capitalize">{r.periodo}</td>
                <td className="px-5 py-3 text-right tabular-nums text-primary">
                  {r.saidas > 0 ? `+${r.saidas}` : "—"}
                </td>
                <td className="px-5 py-3 text-right tabular-nums text-success">
                  {r.devolucoes > 0 ? `-${r.devolucoes}` : "—"}
                </td>
                <td className="px-5 py-3 text-right font-semibold tabular-nums">
                  {formatCurrency(r.valor)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-muted/50 font-semibold">
            <tr>
              <td className="px-5 py-3">Total</td>
              <td className="px-5 py-3 text-right tabular-nums">
                {rows.reduce((s, r) => s + r.saidas, 0)}
              </td>
              <td className="px-5 py-3 text-right tabular-nums">
                {rows.reduce((s, r) => s + r.devolucoes, 0)}
              </td>
              <td className="px-5 py-3 text-right tabular-nums">
                {formatCurrency(totalValor)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  );
}
