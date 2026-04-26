import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Boxes } from "lucide-react";
import { useMockData } from "@/hooks/use-mock-data";
import { formatCurrency } from "@/lib/format";

export const Route = createFileRoute("/admin/equipamentos")({
  head: () => ({
    meta: [{ title: "Equipamentos — RentalPro Admin" }],
  }),
  component: EquipamentosPage,
});

function EquipamentosPage() {
  const equipamentos = useMockData((db) => db.listEquipamentos());
  const lojistas = useMockData((db) => db.listLojistas());

  const [search, setSearch] = useState("");
  const [lojistaFilter, setLojistaFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return equipamentos.filter((e) => {
      if (lojistaFilter !== "all" && e.lojistaId !== lojistaFilter) return false;
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (q && !e.nome.toLowerCase().includes(q) && !e.descricao.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [equipamentos, search, lojistaFilter, statusFilter]);

  const totalDisponivel = equipamentos.filter((e) => e.status === "disponivel").length;
  const totalAlugado = equipamentos.filter((e) => e.status === "alugado").length;
  const totalAtrasado = equipamentos.filter((e) => e.status === "atrasado").length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Equipamentos</h1>
        <p className="mt-1 text-muted-foreground">
          Visão consolidada (somente leitura) de todos os equipamentos cadastrados pelos
          lojistas. O cadastro e a edição são feitos por cada lojista no próprio painel.
        </p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Total" value={equipamentos.length} tone="neutral" />
        <SummaryCard label="Disponíveis" value={totalDisponivel} tone="success" />
        <SummaryCard label="Alugados" value={totalAlugado} tone="primary" />
        <SummaryCard label="Em atraso" value={totalAtrasado} tone="destructive" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar equipamento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={lojistaFilter} onValueChange={setLojistaFilter}>
          <SelectTrigger className="sm:w-56">
            <SelectValue placeholder="Lojista" />
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos status</SelectItem>
            <SelectItem value="disponivel">Disponível</SelectItem>
            <SelectItem value="alugado">Alugado</SelectItem>
            <SelectItem value="atrasado">Em atraso</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Boxes className="mx-auto mb-3 h-10 w-10 opacity-40" />
            Nenhum equipamento encontrado com os filtros atuais.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Equipamento</th>
                  <th className="px-5 py-3 font-medium">Lojista</th>
                  <th className="px-5 py-3 font-medium text-right">Diária</th>
                  <th className="px-5 py-3 font-medium text-right">Multa</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => {
                  const lojista = lojistas.find((l) => l.id === e.lojistaId);
                  return (
                    <tr key={e.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-5 py-3">
                        <div className="font-medium">{e.nome}</div>
                        <div className="text-xs text-muted-foreground">{e.descricao}</div>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {lojista?.nome ?? "—"}
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "neutral" | "success" | "primary" | "destructive";
}) {
  const toneMap = {
    neutral: "border-border",
    success: "border-success/40",
    primary: "border-primary/40",
    destructive: "border-destructive/40",
  };
  const valueTone = {
    neutral: "text-foreground",
    success: "text-success",
    primary: "text-primary",
    destructive: "text-destructive",
  };
  return (
    <Card className={`p-4 border-l-4 ${toneMap[tone]}`}>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${valueTone[tone]}`}>{value}</p>
    </Card>
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
      <Badge className="bg-primary/15 text-primary hover:bg-primary/15 border-0">Alugado</Badge>
    );
  return (
    <Badge className="bg-destructive/15 text-destructive hover:bg-destructive/15 border-0">
      Em atraso
    </Badge>
  );
}
