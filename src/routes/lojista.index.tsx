import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMockData } from "@/hooks/use-mock-data";
import { getSession } from "@/lib/mock-auth";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  Boxes,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ArrowUpRight,
  CalendarClock,
} from "lucide-react";

export const Route = createFileRoute("/lojista/")({
  head: () => ({
    meta: [{ title: "Painel — RentalPro Lojista" }],
  }),
  component: LojistaDashboard,
});

function LojistaDashboard() {
  const session = typeof window !== "undefined" ? getSession() : null;
  const lojistaId = session?.lojistaId ?? "";

  const equipamentos = useMockData((db) => db.equipamentosPorLojista(lojistaId));
  const locacoes = useMockData((db) => db.locacoesPorLojista(lojistaId));

  const disponivel = equipamentos.filter((e) => e.status === "disponivel").length;
  const alugado = equipamentos.filter((e) => e.status === "alugado").length;
  const atrasado = equipamentos.filter((e) => e.status === "atrasado").length;

  const ativas = locacoes.filter((l) => l.status === "ativa" || l.status === "atrasada");
  const atrasadas = locacoes.filter((l) => l.status === "atrasada");
  const finalizadas = locacoes.filter((l) => l.status === "finalizada");
  const receitaFinalizada = finalizadas.reduce((s, l) => s + l.valorTotal, 0);
  const previstoAtivas = ativas.reduce((s, l) => s + l.valorPrevisto, 0);

  const kpis = [
    {
      label: "Equipamentos",
      value: equipamentos.length.toString(),
      sub: `${disponivel} disponíveis`,
      icon: Boxes,
      tint: "bg-primary/10 text-primary",
    },
    {
      label: "Locações ativas",
      value: ativas.length.toString(),
      sub: `${formatCurrency(previstoAtivas)} previsto`,
      icon: ClipboardList,
      tint: "bg-chart-2/10 text-chart-2",
    },
    {
      label: "Em atraso",
      value: atrasadas.length.toString(),
      sub: atrasadas.length ? "ação necessária" : "tudo em dia",
      icon: AlertTriangle,
      tint: atrasadas.length
        ? "bg-destructive/10 text-destructive"
        : "bg-success/10 text-success",
    },
    {
      label: "Receita realizada",
      value: formatCurrency(receitaFinalizada),
      sub: `${finalizadas.length} locações finalizadas`,
      icon: CheckCircle2,
      tint: "bg-success/10 text-success",
    },
  ];

  const ativasOrdenadas = [...ativas].sort((a, b) =>
    a.dataPrevista.localeCompare(b.dataPrevista),
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Olá, {session?.name?.split(" ")[0] ?? "Lojista"}</h1>
          <p className="mt-1 text-muted-foreground">
            Painel operacional da sua locadora — controle estoque, locações e devoluções.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/lojista/equipamentos">
              <Boxes className="h-4 w-4" /> Equipamentos
            </Link>
          </Button>
          <Button variant="hero" asChild>
            <Link to="/lojista/locacoes">
              <Plus className="h-4 w-4" /> Nova locação
            </Link>
          </Button>
        </div>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(({ label, value, sub, icon: Icon, tint }) => (
          <Card
            key={label}
            className="p-5 shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-shadow"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tint}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight tabular-nums">{value}</p>
            <p className="mt-1 text-sm font-medium text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">{sub}</p>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximas devoluções */}
        <Card className="lg:col-span-2 p-6">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Próximas devoluções</h2>
              <p className="text-sm text-muted-foreground">
                Locações ativas ordenadas pela data prevista de devolução.
              </p>
            </div>
            <Link
              to="/lojista/locacoes"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Ver todas <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </header>

          {ativasOrdenadas.length === 0 ? (
            <div className="mt-6 rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Nenhuma locação ativa no momento.
            </div>
          ) : (
            <ul className="mt-5 divide-y divide-border">
              {ativasOrdenadas.slice(0, 6).map((loc) => {
                const equip = equipamentos.find((e) => e.id === loc.equipamentoId);
                const isAtrasada = loc.status === "atrasada";
                return (
                  <li key={loc.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{equip?.nome ?? "Equipamento removido"}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        Cliente: {loc.cliente}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                          <CalendarClock className="h-3 w-3" />
                          {formatDate(loc.dataPrevista)}
                        </p>
                        <p className="text-sm font-semibold tabular-nums">
                          {formatCurrency(loc.valorPrevisto)}
                        </p>
                      </div>
                      {isAtrasada ? (
                        <Badge className="bg-destructive/15 text-destructive hover:bg-destructive/15 border-0">
                          Atrasada
                        </Badge>
                      ) : (
                        <Badge className="bg-primary/15 text-primary hover:bg-primary/15 border-0">
                          Ativa
                        </Badge>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* Status equipamentos */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold">Status do estoque</h2>
          <p className="text-sm text-muted-foreground">Distribuição dos seus equipamentos.</p>

          <div className="mt-6 space-y-4">
            {[
              { label: "Disponíveis", count: disponivel, color: "var(--success)" },
              { label: "Alugados", count: alugado, color: "var(--primary)" },
              { label: "Em atraso", count: atrasado, color: "var(--destructive)" },
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
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {equipamentos.length === 0 && (
            <div className="mt-6 rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
              Cadastre seu primeiro equipamento para começar.
              <Button variant="link" size="sm" asChild className="px-1">
                <Link to="/lojista/equipamentos">Cadastrar agora</Link>
              </Button>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
