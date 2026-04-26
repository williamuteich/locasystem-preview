// Mock auth — frontend-only sessions for admin and lojista areas.

const STORAGE_KEY = "rentalpro.session";

export type Role = "admin" | "lojista";

export type Session = {
  role: Role;
  email: string;
  name: string;
  /** Lojista vinculado (apenas para role=lojista). Aponta para um id em mockDb.listLojistas() */
  lojistaId?: string;
  loggedInAt: number;
};

type Credential = {
  email: string;
  password: string;
  role: Role;
  name: string;
  lojistaId?: string;
};

const CREDENTIALS: Credential[] = [
  {
    email: "teste@teste.com",
    password: "teste123123",
    role: "admin",
    name: "Administrador",
  },
  {
    email: "lojista@teste.com",
    password: "lojista123",
    role: "lojista",
    name: "Ferramentas Silva LTDA",
    lojistaId: "l1",
  },
];

export function login(email: string, password: string): Session | null {
  const cred = CREDENTIALS.find(
    (c) => c.email === email.trim().toLowerCase() && c.password === password,
  );
  if (!cred) return null;
  const session: Session = {
    role: cred.role,
    email: cred.email,
    name: cred.name,
    lojistaId: cred.lojistaId,
    loggedInAt: Date.now(),
  };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }
  return session;
}

export function logout() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

/** Helper para a tela de login: pré-preencher credenciais por papel. */
export function getDemoCredentials(role: Role): { email: string; password: string } {
  const cred = CREDENTIALS.find((c) => c.role === role)!;
  return { email: cred.email, password: cred.password };
}
