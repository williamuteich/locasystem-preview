import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMockData } from "@/hooks/use-mock-data";
import { formatCurrency } from "@/lib/format";
import { Store, Boxes, ClipboardList, AlertTriangle, TrendingUp, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Dashboard — RentalPro Admin" }],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const lojistas = useMockData((db) => db.listLojistas());
  const equipamentos = useMockData((db) => db.listEquipamentos());
  const locacoes = useMockData((db) => db.listLocacoes());

  const lojistasAtivos = lojistas.filter((l) => l.ativo).length;
  const ativas = locacoes.filter((l) => l.status === "ativa").length;
  const atrasadas = locacoes.filter((l) => l.status === "atrasada").length;
  const receitaTotal = locacoes.reduce((sum, l) => sum + l.valorTotal, 0);

  const kpis = [
    {
      label: "Lojistas cadastrados",
      value: lojistas.length.toString(),
      sub: `${lojistasAtivos} ativos`,
      icon: Store,
      tint: "bg-primary/10 text-primary",
    },
    {
      label: "Equipamentos no sistema",
      value: equipamentos.length.toString(),
      sub: `em ${lojistas.length} lojistas`,
      icon: Boxes,
      tint: "bg-chart-2/10 text-chart-2",
    },
    {
      label: "Locações ativas",
      value: ativas.toString(),
      sub: `${locacoes.length} no total`,
      icon: ClipboardList,
      tint: "bg-success/10 text-success",
    },
    {
      label: "Locações em atraso",
      value: atrasadas.toString(),
      sub: "requer atenção",
      icon: AlertTriangle,
      tint: "bg-destructive/10 text-destructive",
    },
  ];

  // Top lojistas por receita
  const receitaPorLojista = lojistas
    .map((l) => {
      const total = locacoes
        .filter((loc) => loc.lojistaId === l.id)
        .reduce((s, loc) => s + loc.valorTotal, 0);
      const equipCount = equipamentos.filter((e) => e.lojistaId === l.id).length;
      return { lojista: l, total, equipCount };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const maxReceita = Math.max(...receitaPorLojista.map((r) => r.total), 1);

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visão geral</h1>
          <p className="mt-1 text-muted-foreground">
            Painel de supervisão consolidando todos os lojistas da plataforma.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 shadow-sm">
          <TrendingUp className="h-4 w-4 text-success" />
          <span className="text-sm text-muted-foreground">Receita total:</span>
          <span className="text-sm font-semibold">{formatCurrency(receitaTotal)}</span>
        </div>
      </header>

      <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
        <p className="font-medium text-foreground">Como funciona o painel Admin?</p>
        <p className="mt-1 text-muted-foreground">
          Como administrador, você <strong>cadastra os lojistas</strong> (locadoras parceiras) e
          <strong> supervisiona</strong> a operação consolidada — equipamentos, locações e
          relatórios. Cada lojista opera o próprio ambiente isolado em <em>/lojista</em>.
        </p>
      </div>


      {/* KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(({ label, value, sub, icon: Icon, tint }) => (
          <Card key={label} className="p-5 shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-shadow">
            <div className="flex items-start justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tint}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight">{value}</p>
            <p className="mt-1 text-sm font-medium text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">{sub}</p>
          </Card>
        ))}
      </section>

      {/* Two columns */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top lojistas */}
        <Card className="lg:col-span-2 p-6">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Top lojistas por receita</h2>
              <p className="text-sm text-muted-foreground">
                Receita acumulada considerando todas as locações.
              </p>
            </div>
            <Link
              to="/admin/lojistas"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Ver todos <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </header>

          <ul className="mt-6 space-y-4">
            {receitaPorLojista.map(({ lojista, total, equipCount }) => (
              <li key={lojista.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{lojista.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {lojista.cidade}/{lojista.estado} · {equipCount} equip.
                    </p>
                  </div>
                  <span className="font-semibold tabular-nums">{formatCurrency(total)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(total / maxReceita) * 100}%`,
                      background: "var(--gradient-primary)",
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>

        {/* Status equipamentos */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold">Status dos equipamentos</h2>
          <p className="text-sm text-muted-foreground">Distribuição atual no parque.</p>

          <div className="mt-6 space-y-4">
            {[
              { label: "Disponíveis", count: equipamentos.filter((e) => e.status === "disponivel").length, color: "var(--success)" },
              { label: "Alugados", count: equipamentos.filter((e) => e.status === "alugado").length, color: "var(--primary)" },
              { label: "Em atraso", count: equipamentos.filter((e) => e.status === "atrasado").length, color: "var(--destructive)" },
            ].map(({ label, count, color }) => {
              const pct = equipamentos.length ? (count / equipamentos.length) * 100 : 0;
              return (
                <div key={label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{label}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {count} ({Math.round(pct)}%)
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      {/* Recent locations */}
      <Card className="p-6">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Locações recentes</h2>
            <p className="text-sm text-muted-foreground">
              Últimas movimentações de todos os lojistas.
            </p>
          </div>
        </header>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Cliente</th>
                <th className="pb-3 pr-4 font-medium">Lojista</th>
                <th className="pb-3 pr-4 font-medium">Saída</th>
                <th className="pb-3 pr-4 font-medium">Devolução prev.</th>
                <th className="pb-3 pr-4 font-medium text-right">Valor</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {locacoes.slice(0, 8).map((loc) => {
                const lojista = lojistas.find((l) => l.id === loc.lojistaId);
                return (
                  <tr key={loc.id} className="border-b border-border/60 last:border-0">
                    <td className="py-3 pr-4 font-medium">{loc.cliente}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{lojista?.nome ?? "—"}</td>
                    <td className="py-3 pr-4 text-muted-foreground tabular-nums">
                      {new Date(loc.dataSaida).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground tabular-nums">
                      {new Date(loc.dataPrevista).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="py-3 pr-4 text-right font-semibold tabular-nums">
                      {formatCurrency(loc.valorTotal)}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={loc.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: "ativa" | "finalizada" | "atrasada" }) {
  if (status === "ativa")
    return <Badge className="bg-primary/15 text-primary hover:bg-primary/15 border-0">Ativa</Badge>;
  if (status === "atrasada")
    return (
      <Badge className="bg-destructive/15 text-destructive hover:bg-destructive/15 border-0">
        Atrasada
      </Badge>
    );
  return (
    <Badge className="bg-success/15 text-success hover:bg-success/15 border-0">Finalizada</Badge>
  );
}
