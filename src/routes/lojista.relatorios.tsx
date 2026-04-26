import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMockData } from "@/hooks/use-mock-data";
import { getSession } from "@/lib/mock-auth";
import { formatCurrency } from "@/lib/format";
import { TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react";

export const Route = createFileRoute("/lojista/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios — Lojista" }] }),
  component: LojistaRelatorios,
});

function LojistaRelatorios() {
  const session = typeof window !== "undefined" ? getSession() : null;
  const lojistaId = session?.lojistaId ?? "";

  const locacoes = useMockData((db) => db.locacoesPorLojista(lojistaId));

  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const filtered = useMemo(() => {
    return locacoes.filter((l) => {
      if (dataInicio && l.dataSaida < dataInicio) return false;
      if (dataFim && l.dataSaida > dataFim) return false;
      return true;
    });
  }, [locacoes, dataInicio, dataFim]);

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

  const totalSaidas = filtered.length;
  const totalDevolucoes = filtered.filter((l) => !!l.dataDevolucao).length;
  const totalValor = filtered.reduce((s, l) => s + l.valorTotal, 0);
  const ticketMedio = filtered.length ? totalValor / filtered.length : 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
        <p className="mt-1 text-muted-foreground">
          Fluxo de entradas e saídas e valores gerados pela sua loja.
        </p>
      </header>

      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="dataInicio">De</Label>
            <Input
              id="dataInicio"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dataFim">Até</Label>
            <Input
              id="dataFim"
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-foreground underline"
              onClick={() => {
                setDataInicio("");
                setDataFim("");
              }}
            >
              Limpar filtro
            </button>
          </div>
        </div>
      </Card>

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
