import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMockData } from "@/hooks/use-mock-data";
import { getSession } from "@/lib/mock-auth";
import { formatCurrency, formatDate } from "@/lib/format";
import { CheckCircle2, Clock, AlertTriangle, Boxes } from "lucide-react";
import type { Equipamento, Locacao } from "@/lib/mock-data";

export const Route = createFileRoute("/lojista/painel")({
  head: () => ({ meta: [{ title: "Painel de status — Lojista" }] }),
  component: LojistaPainel,
});

function LojistaPainel() {
  const session = typeof window !== "undefined" ? getSession() : null;
  const lojistaId = session?.lojistaId ?? "";

  const equipamentos = useMockData((db) => db.equipamentosPorLojista(lojistaId));
  const locacoes = useMockData((db) => db.locacoesPorLojista(lojistaId));

  const disponiveis = equipamentos.filter((e) => e.status === "disponivel");
  const alugados = equipamentos.filter((e) => e.status === "alugado");
  const atrasados = equipamentos.filter((e) => e.status === "atrasado");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Painel de status</h1>
        <p className="mt-1 text-muted-foreground">
          Visão rápida do estado atual de cada equipamento — disponíveis, alugados e em
          atraso.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PainelColuna
          titulo="Disponíveis"
          icon={CheckCircle2}
          tone="success"
          equipamentos={disponiveis}
          locacoes={locacoes}
          empty="Nenhum equipamento disponível no momento."
        />
        <PainelColuna
          titulo="Alugados"
          icon={Clock}
          tone="primary"
          equipamentos={alugados}
          locacoes={locacoes}
          empty="Nenhum equipamento alugado."
        />
        <PainelColuna
          titulo="Em atraso"
          icon={AlertTriangle}
          tone="destructive"
          equipamentos={atrasados}
          locacoes={locacoes}
          empty="Tudo em dia. Nenhum atraso."
        />
      </div>
    </div>
  );
}

function PainelColuna({
  titulo,
  icon: Icon,
  tone,
  equipamentos,
  locacoes,
  empty,
}: {
  titulo: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "success" | "primary" | "destructive";
  equipamentos: Equipamento[];
  locacoes: Locacao[];
  empty: string;
}) {
  const tint =
    tone === "success"
      ? "bg-success/10 text-success"
      : tone === "primary"
        ? "bg-primary/10 text-primary"
        : "bg-destructive/10 text-destructive";

  return (
    <Card className="p-5 flex flex-col">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${tint}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold">{titulo}</h2>
            <p className="text-xs text-muted-foreground">
              {equipamentos.length} equipamento(s)
            </p>
          </div>
        </div>
        <Badge variant="outline" className="tabular-nums">
          {equipamentos.length}
        </Badge>
      </header>

      <div className="mt-4 flex-1">
        {equipamentos.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            <Boxes className="mx-auto mb-2 h-6 w-6 opacity-40" />
            {empty}
          </div>
        ) : (
          <ul className="space-y-2">
            {equipamentos.map((e) => {
              const loc = locacoes.find(
                (l) =>
                  l.equipamentoId === e.id &&
                  (l.status === "ativa" || l.status === "atrasada"),
              );
              return (
                <li
                  key={e.id}
                  className="rounded-md border border-border bg-card p-3 text-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{e.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(e.valorDiaria)}/dia
                      </p>
                    </div>
                  </div>
                  {loc && (
                    <div className="mt-2 border-t border-border pt-2 text-xs space-y-0.5">
                      <p>
                        <span className="text-muted-foreground">Cliente:</span>{" "}
                        <span className="font-medium">{loc.cliente}</span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Devolução prevista:</span>{" "}
                        <span
                          className={
                            tone === "destructive"
                              ? "font-semibold text-destructive"
                              : "tabular-nums"
                          }
                        >
                          {formatDate(loc.dataPrevista)}
                        </span>
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}
