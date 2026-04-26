// Mock data store for the admin and lojista areas.
// Persists in-memory across navigation within a session.

export type Lojista = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cnpj: string;
  cidade: string;
  estado: string;
  ativo: boolean;
  criadoEm: string;
};

export type Equipamento = {
  id: string;
  lojistaId: string;
  nome: string;
  descricao: string;
  valorDiaria: number;
  /** Valor da multa por dia de atraso */
  valorMulta: number;
  status: "disponivel" | "alugado" | "atrasado";
};

export type Cliente = {
  id: string;
  lojistaId: string;
  nome: string;
  documento: string; // CPF/CNPJ
  telefone: string;
  email?: string;
  endereco?: string;
  observacoes?: string;
  criadoEm: string;
};

export type Funcionario = {
  id: string;
  lojistaId: string;
  nome: string;
  email: string;
  cargo: string;
  telefone?: string;
  ativo: boolean;
  criadoEm: string;
};

export type Locacao = {
  id: string;
  lojistaId: string;
  equipamentoId: string;
  cliente: string;
  clienteTelefone?: string;
  dataSaida: string; // ISO yyyy-mm-dd
  dataPrevista: string; // ISO yyyy-mm-dd
  dataDevolucao?: string; // ISO yyyy-mm-dd
  /** Valor da diária no momento da locação (snapshot) */
  valorDiaria: number;
  /** Valor da multa diária no momento da locação (snapshot) */
  valorMultaDiaria: number;
  /** Valor previsto inicialmente (diárias × valorDiaria) */
  valorPrevisto: number;
  /** Valor final cobrado (após devolução, incluindo multas) */
  valorTotal: number;
  /** Dias de atraso no momento da devolução */
  diasAtraso?: number;
  /** Multa total cobrada na devolução */
  valorMultaTotal?: number;
  status: "ativa" | "finalizada" | "atrasada";
};

const lojistas: Lojista[] = [
  {
    id: "l1",
    nome: "Ferramentas Silva LTDA",
    email: "contato@ferramentassilva.com.br",
    telefone: "(11) 98765-4321",
    cnpj: "12.345.678/0001-90",
    cidade: "São Paulo",
    estado: "SP",
    ativo: true,
    criadoEm: "2024-08-12",
  },
  {
    id: "l2",
    nome: "MegaLoc Equipamentos",
    email: "atendimento@megaloc.com.br",
    telefone: "(21) 99876-1234",
    cnpj: "98.765.432/0001-10",
    cidade: "Rio de Janeiro",
    estado: "RJ",
    ativo: true,
    criadoEm: "2024-09-03",
  },
  {
    id: "l3",
    nome: "Construfácil Locações",
    email: "vendas@construfacil.com.br",
    telefone: "(31) 91234-5678",
    cnpj: "45.678.912/0001-34",
    cidade: "Belo Horizonte",
    estado: "MG",
    ativo: true,
    criadoEm: "2024-10-21",
  },
  {
    id: "l4",
    nome: "TecnoRent Indústria",
    email: "comercial@tecnorent.com.br",
    telefone: "(41) 99988-7766",
    cnpj: "33.222.111/0001-55",
    cidade: "Curitiba",
    estado: "PR",
    ativo: false,
    criadoEm: "2024-11-15",
  },
  {
    id: "l5",
    nome: "ProLocadora Sul",
    email: "contato@prolocadora.com.br",
    telefone: "(51) 98877-6655",
    cnpj: "77.888.999/0001-22",
    cidade: "Porto Alegre",
    estado: "RS",
    ativo: true,
    criadoEm: "2025-01-08",
  },
];

const equipamentos: Equipamento[] = [
  { id: "e1", lojistaId: "l1", nome: "Betoneira 400L", descricao: "Motor 2HP, capacidade 400 litros", valorDiaria: 120, valorMulta: 80, status: "alugado" },
  { id: "e2", lojistaId: "l1", nome: "Andaime Tubular 1,5m", descricao: "Módulo galvanizado", valorDiaria: 45, valorMulta: 30, status: "disponivel" },
  { id: "e3", lojistaId: "l1", nome: "Furadeira de Impacto Pro", descricao: "850W, mandril 13mm", valorDiaria: 60, valorMulta: 40, status: "disponivel" },
  { id: "e4", lojistaId: "l2", nome: "Compressor de Ar 50L", descricao: "2HP, 8 bar", valorDiaria: 95, valorMulta: 60, status: "atrasado" },
  { id: "e5", lojistaId: "l2", nome: "Gerador a Diesel 5kVA", descricao: "Partida elétrica", valorDiaria: 280, valorMulta: 180, status: "alugado" },
  { id: "e6", lojistaId: "l2", nome: "Serra Circular 7¼\"", descricao: "1800W profissional", valorDiaria: 70, valorMulta: 45, status: "disponivel" },
  { id: "e7", lojistaId: "l3", nome: "Martelete Demolidor 11kg", descricao: "Hexagonal 30mm", valorDiaria: 150, valorMulta: 100, status: "alugado" },
  { id: "e8", lojistaId: "l3", nome: "Placa Vibratória 90kg", descricao: "Motor 4 tempos", valorDiaria: 220, valorMulta: 140, status: "disponivel" },
  { id: "e9", lojistaId: "l4", nome: "Solda Inversora 200A", descricao: "Bivolt automático", valorDiaria: 110, valorMulta: 70, status: "disponivel" },
  { id: "e10", lojistaId: "l5", nome: "Roçadeira a Gasolina", descricao: "43cc, 2 tempos", valorDiaria: 85, valorMulta: 55, status: "alugado" },
  { id: "e11", lojistaId: "l5", nome: "Lavadora Alta Pressão", descricao: "1800 PSI", valorDiaria: 75, valorMulta: 50, status: "disponivel" },
  { id: "e12", lojistaId: "l5", nome: "Escada Extensiva 13 deg.", descricao: "Alumínio 5,4m", valorDiaria: 40, valorMulta: 25, status: "atrasado" },
];

const locacoes: Locacao[] = [
  { id: "loc1", lojistaId: "l1", equipamentoId: "e1", cliente: "Construtora Boa Obra", clienteTelefone: "(11) 99111-2222", dataSaida: "2025-04-18", dataPrevista: "2025-04-25", valorDiaria: 120, valorMultaDiaria: 80, valorPrevisto: 840, valorTotal: 840, status: "ativa" },
  { id: "loc2", lojistaId: "l2", equipamentoId: "e4", cliente: "João Pereira ME", clienteTelefone: "(21) 99222-3333", dataSaida: "2025-04-10", dataPrevista: "2025-04-17", valorDiaria: 95, valorMultaDiaria: 60, valorPrevisto: 665, valorTotal: 665, status: "atrasada" },
  { id: "loc3", lojistaId: "l2", equipamentoId: "e5", cliente: "Eventos RJ Produções", dataSaida: "2025-04-20", dataPrevista: "2025-04-27", valorDiaria: 280, valorMultaDiaria: 180, valorPrevisto: 1960, valorTotal: 1960, status: "ativa" },
  { id: "loc4", lojistaId: "l3", equipamentoId: "e7", cliente: "Demolidora Central", dataSaida: "2025-04-15", dataPrevista: "2025-04-22", valorDiaria: 150, valorMultaDiaria: 100, valorPrevisto: 1050, valorTotal: 1050, status: "ativa" },
  { id: "loc5", lojistaId: "l5", equipamentoId: "e10", cliente: "Jardim Verde Paisagismo", dataSaida: "2025-04-19", dataPrevista: "2025-04-26", valorDiaria: 85, valorMultaDiaria: 55, valorPrevisto: 595, valorTotal: 595, status: "ativa" },
  { id: "loc6", lojistaId: "l5", equipamentoId: "e12", cliente: "Pintura Express", dataSaida: "2025-04-08", dataPrevista: "2025-04-15", valorDiaria: 40, valorMultaDiaria: 25, valorPrevisto: 280, valorTotal: 280, status: "atrasada" },
  { id: "loc7", lojistaId: "l1", equipamentoId: "e3", cliente: "Reforma Já", dataSaida: "2025-04-01", dataPrevista: "2025-04-08", dataDevolucao: "2025-04-08", valorDiaria: 60, valorMultaDiaria: 40, valorPrevisto: 420, valorTotal: 420, diasAtraso: 0, valorMultaTotal: 0, status: "finalizada" },
  { id: "loc8", lojistaId: "l3", equipamentoId: "e8", cliente: "Pavimentos MG", dataSaida: "2025-03-25", dataPrevista: "2025-04-05", dataDevolucao: "2025-04-04", valorDiaria: 220, valorMultaDiaria: 140, valorPrevisto: 2420, valorTotal: 2420, diasAtraso: 0, valorMultaTotal: 0, status: "finalizada" },
  { id: "loc9", lojistaId: "l1", equipamentoId: "e2", cliente: "Reforma Já", dataSaida: "2025-03-15", dataPrevista: "2025-03-22", dataDevolucao: "2025-03-22", valorDiaria: 45, valorMultaDiaria: 30, valorPrevisto: 315, valorTotal: 315, diasAtraso: 0, valorMultaTotal: 0, status: "finalizada" },
  { id: "loc10", lojistaId: "l2", equipamentoId: "e6", cliente: "Marcenaria Silva", dataSaida: "2025-03-10", dataPrevista: "2025-03-17", dataDevolucao: "2025-03-18", valorDiaria: 70, valorMultaDiaria: 45, valorPrevisto: 490, valorTotal: 535, diasAtraso: 1, valorMultaTotal: 45, status: "finalizada" },
];

const clientes: Cliente[] = [
  { id: "c1", lojistaId: "l1", nome: "Construtora Boa Obra", documento: "11.222.333/0001-44", telefone: "(11) 99111-2222", email: "contato@boaobra.com.br", endereco: "Av. Paulista, 1000 — São Paulo/SP", criadoEm: "2025-01-12" },
  { id: "c2", lojistaId: "l1", nome: "Reforma Já", documento: "22.333.444/0001-55", telefone: "(11) 98222-3333", email: "ola@reformaja.com.br", criadoEm: "2025-02-03" },
  { id: "c3", lojistaId: "l1", nome: "João Carvalho (autônomo)", documento: "123.456.789-00", telefone: "(11) 97333-4444", criadoEm: "2025-03-10" },
  { id: "c4", lojistaId: "l2", nome: "João Pereira ME", documento: "33.444.555/0001-66", telefone: "(21) 99222-3333", email: "joao@pereira.com", criadoEm: "2024-12-05" },
  { id: "c5", lojistaId: "l2", nome: "Eventos RJ Produções", documento: "44.555.666/0001-77", telefone: "(21) 98333-4444", criadoEm: "2025-01-20" },
];

const funcionarios: Funcionario[] = [
  { id: "f1", lojistaId: "l1", nome: "Carlos Souza", email: "carlos@ferramentassilva.com.br", cargo: "Atendente", telefone: "(11) 96111-2222", ativo: true, criadoEm: "2024-09-01" },
  { id: "f2", lojistaId: "l1", nome: "Ana Lima", email: "ana@ferramentassilva.com.br", cargo: "Gerente", telefone: "(11) 96222-3333", ativo: true, criadoEm: "2024-10-15" },
  { id: "f3", lojistaId: "l2", nome: "Roberto Dias", email: "roberto@megaloc.com.br", cargo: "Atendente", ativo: true, criadoEm: "2024-11-02" },
];

// Reactive subscribers
type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

export function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function diffDays(aIso: string, bIso: string): number {
  const a = new Date(aIso + "T00:00:00").getTime();
  const b = new Date(bIso + "T00:00:00").getTime();
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

// API
export const mockDb = {
  // ---------- Lojistas ----------
  listLojistas: () => [...lojistas],
  getLojista: (id: string) => lojistas.find((l) => l.id === id),
  createLojista: (data: Omit<Lojista, "id" | "criadoEm">) => {
    const novo: Lojista = {
      ...data,
      id: `l${Date.now()}`,
      criadoEm: new Date().toISOString().slice(0, 10),
    };
    lojistas.push(novo);
    notify();
    return novo;
  },
  updateLojista: (id: string, data: Partial<Lojista>) => {
    const i = lojistas.findIndex((l) => l.id === id);
    if (i >= 0) {
      lojistas[i] = { ...lojistas[i], ...data };
      notify();
    }
  },
  deleteLojista: (id: string) => {
    const i = lojistas.findIndex((l) => l.id === id);
    if (i >= 0) {
      lojistas.splice(i, 1);
      notify();
    }
  },

  // ---------- Equipamentos ----------
  listEquipamentos: () => [...equipamentos],
  equipamentosPorLojista: (lojistaId: string) =>
    equipamentos.filter((e) => e.lojistaId === lojistaId),
  getEquipamento: (id: string) => equipamentos.find((e) => e.id === id),
  createEquipamento: (data: Omit<Equipamento, "id" | "status">) => {
    const novo: Equipamento = {
      ...data,
      id: `e${Date.now()}`,
      status: "disponivel",
    };
    equipamentos.push(novo);
    notify();
    return novo;
  },
  updateEquipamento: (id: string, data: Partial<Equipamento>) => {
    const i = equipamentos.findIndex((e) => e.id === id);
    if (i >= 0) {
      equipamentos[i] = { ...equipamentos[i], ...data };
      notify();
    }
  },
  deleteEquipamento: (id: string) => {
    const i = equipamentos.findIndex((e) => e.id === id);
    if (i >= 0) {
      equipamentos.splice(i, 1);
      notify();
    }
  },

  // ---------- Locações ----------
  listLocacoes: () => [...locacoes],
  locacoesPorLojista: (lojistaId: string) =>
    locacoes.filter((l) => l.lojistaId === lojistaId),
  getLocacao: (id: string) => locacoes.find((l) => l.id === id),

  /**
   * Cria uma locação (saída de equipamento).
   * Marca o equipamento como "alugado" e calcula valor previsto.
   */
  createLocacao: (data: {
    lojistaId: string;
    equipamentoId: string;
    cliente: string;
    clienteTelefone?: string;
    dataSaida: string;
    dataPrevista: string;
  }): Locacao | { error: string } => {
    const equip = equipamentos.find((e) => e.id === data.equipamentoId);
    if (!equip) return { error: "Equipamento não encontrado." };
    if (equip.lojistaId !== data.lojistaId)
      return { error: "Equipamento não pertence a este lojista." };
    if (equip.status !== "disponivel")
      return { error: "Equipamento não está disponível para locação." };

    const dias = Math.max(1, diffDays(data.dataSaida, data.dataPrevista));
    const valorPrevisto = dias * equip.valorDiaria;

    const nova: Locacao = {
      id: `loc${Date.now()}`,
      lojistaId: data.lojistaId,
      equipamentoId: data.equipamentoId,
      cliente: data.cliente,
      clienteTelefone: data.clienteTelefone,
      dataSaida: data.dataSaida,
      dataPrevista: data.dataPrevista,
      valorDiaria: equip.valorDiaria,
      valorMultaDiaria: equip.valorMulta,
      valorPrevisto,
      valorTotal: valorPrevisto,
      status: "ativa",
    };
    locacoes.push(nova);

    const ei = equipamentos.findIndex((e) => e.id === equip.id);
    equipamentos[ei] = { ...equipamentos[ei], status: "alugado" };

    notify();
    return nova;
  },

  /**
   * Registra a devolução. Calcula multa por dias de atraso,
   * libera o equipamento e finaliza a locação.
   */
  devolverLocacao: (
    id: string,
    dataDevolucao: string = todayIso(),
  ): Locacao | { error: string } => {
    const i = locacoes.findIndex((l) => l.id === id);
    if (i < 0) return { error: "Locação não encontrada." };
    const loc = locacoes[i];
    if (loc.status === "finalizada")
      return { error: "Locação já está finalizada." };

    const diasAtraso = Math.max(0, diffDays(loc.dataPrevista, dataDevolucao));
    const valorMultaTotal = diasAtraso * loc.valorMultaDiaria;
    const valorTotal = loc.valorPrevisto + valorMultaTotal;

    const atualizada: Locacao = {
      ...loc,
      dataDevolucao,
      diasAtraso,
      valorMultaTotal,
      valorTotal,
      status: "finalizada",
    };
    locacoes[i] = atualizada;

    const ei = equipamentos.findIndex((e) => e.id === loc.equipamentoId);
    if (ei >= 0) {
      equipamentos[ei] = { ...equipamentos[ei], status: "disponivel" };
    }

    notify();
    return atualizada;
  },

  /**
   * Atualiza o status das locações ativas para "atrasada" se
   * a data prevista já passou. Também sincroniza o status do equipamento.
   * Idempotente — pode ser chamada a qualquer momento.
   */
  syncAtrasos: () => {
    const hoje = todayIso();
    let changed = false;
    locacoes.forEach((loc, i) => {
      if (loc.status === "ativa" && diffDays(loc.dataPrevista, hoje) > 0) {
        locacoes[i] = { ...loc, status: "atrasada" };
        const ei = equipamentos.findIndex((e) => e.id === loc.equipamentoId);
        if (ei >= 0 && equipamentos[ei].status === "alugado") {
          equipamentos[ei] = { ...equipamentos[ei], status: "atrasado" };
        }
        changed = true;
      }
    });
    if (changed) notify();
  },

  /** Helpers de cálculo */
  calcularMultaPrevista: (locacaoId: string, dataDevolucao: string = todayIso()) => {
    const loc = locacoes.find((l) => l.id === locacaoId);
    if (!loc) return null;
    const diasAtraso = Math.max(0, diffDays(loc.dataPrevista, dataDevolucao));
    const valorMultaTotal = diasAtraso * loc.valorMultaDiaria;
    return { diasAtraso, valorMultaTotal, valorTotal: loc.valorPrevisto + valorMultaTotal };
  },

  // ---------- Clientes ----------
  clientesPorLojista: (lojistaId: string) =>
    clientes.filter((c) => c.lojistaId === lojistaId),
  getCliente: (id: string) => clientes.find((c) => c.id === id),
  createCliente: (data: Omit<Cliente, "id" | "criadoEm">) => {
    const novo: Cliente = {
      ...data,
      id: `c${Date.now()}`,
      criadoEm: new Date().toISOString().slice(0, 10),
    };
    clientes.push(novo);
    notify();
    return novo;
  },
  updateCliente: (id: string, data: Partial<Cliente>) => {
    const i = clientes.findIndex((c) => c.id === id);
    if (i >= 0) {
      clientes[i] = { ...clientes[i], ...data };
      notify();
    }
  },
  deleteCliente: (id: string) => {
    const i = clientes.findIndex((c) => c.id === id);
    if (i >= 0) {
      clientes.splice(i, 1);
      notify();
    }
  },

  // ---------- Funcionários ----------
  funcionariosPorLojista: (lojistaId: string) =>
    funcionarios.filter((f) => f.lojistaId === lojistaId),
  getFuncionario: (id: string) => funcionarios.find((f) => f.id === id),
  createFuncionario: (data: Omit<Funcionario, "id" | "criadoEm">) => {
    const novo: Funcionario = {
      ...data,
      id: `f${Date.now()}`,
      criadoEm: new Date().toISOString().slice(0, 10),
    };
    funcionarios.push(novo);
    notify();
    return novo;
  },
  updateFuncionario: (id: string, data: Partial<Funcionario>) => {
    const i = funcionarios.findIndex((f) => f.id === id);
    if (i >= 0) {
      funcionarios[i] = { ...funcionarios[i], ...data };
      notify();
    }
  },
  deleteFuncionario: (id: string) => {
    const i = funcionarios.findIndex((f) => f.id === id);
    if (i >= 0) {
      funcionarios.splice(i, 1);
      notify();
    }
  },
};
