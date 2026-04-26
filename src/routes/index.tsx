import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Wrench, ShieldCheck, BarChart3, Boxes, Store, UserCog } from "lucide-react";
import { login, getSession, getDemoCredentials, type Role } from "@/lib/mock-auth";
import loginHero from "@/assets/login-hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RentalPro — Sistema de Locação de Equipamentos" },
      {
        name: "description",
        content:
          "Gestão completa de locação de equipamentos: lojistas, clientes, equipamentos, locações, devoluções e relatórios em tempo real.",
      },
      { property: "og:title", content: "RentalPro — Locação de Equipamentos" },
      {
        property: "og:description",
        content:
          "Plataforma profissional de gestão de locações para o segmento de equipamentos e ferramentas.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("admin");
  const [email, setEmail] = useState(getDemoCredentials("admin").email);
  const [password, setPassword] = useState(getDemoCredentials("admin").password);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (s) {
      navigate({ to: s.role === "admin" ? "/admin" : "/lojista" });
    }
  }, [navigate]);

  const handleRoleChange = (next: Role) => {
    setRole(next);
    const c = getDemoCredentials(next);
    setEmail(c.email);
    setPassword(c.password);
    setError(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const session = login(email, password);
    if (!session) {
      setError("E-mail ou senha inválidos.");
      setLoading(false);
      return;
    }
    navigate({ to: session.role === "admin" ? "/admin" : "/lojista" });
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      {/* Hero side */}
      <section
        className="relative hidden lg:flex flex-col justify-between p-12 text-white overflow-hidden"
        style={{ background: "var(--gradient-hero)" }}
      >
        <img
          src={loginHero}
          alt=""
          aria-hidden="true"
          width={1280}
          height={1600}
          className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-overlay"
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 80% 20%, oklch(0.68 0.19 45 / 0.35), transparent 60%)",
          }}
        />

        <header className="relative flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-lg"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Wrench className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold tracking-tight">RentalPro</span>
        </header>

        <div className="relative space-y-8 max-w-lg">
          <div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight">
              Gestão completa para sua{" "}
              <span className="text-primary-glow">locadora de equipamentos</span>
            </h1>
            <p className="mt-4 text-lg text-white/80">
              Controle lojistas, equipamentos, locações e relatórios em uma única
              plataforma robusta e segura.
            </p>
          </div>

          <ul className="space-y-4">
            {[
              { icon: Boxes, title: "Cadastro multi-lojista", desc: "Cada lojista no seu próprio ambiente isolado" },
              { icon: ShieldCheck, title: "Controle de devoluções", desc: "Detecção automática de atrasos e multas" },
              { icon: BarChart3, title: "Relatórios em tempo real", desc: "Fluxo financeiro diário e mensal consolidado" },
            ].map(({ icon: Icon, title, desc }) => (
              <li key={title} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/10 backdrop-blur">
                  <Icon className="h-5 w-5 text-primary-glow" />
                </div>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-sm text-white/70">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/50">
          © {new Date().getFullYear()} RentalPro · Todos os direitos reservados
        </p>
      </section>

      {/* Form side */}
      <section className="flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Wrench className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">RentalPro</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold tracking-tight">Acesse sua conta</h2>
            <p className="mt-2 text-muted-foreground">
              Escolha o tipo de acesso e entre com suas credenciais.
            </p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleRoleChange("admin")}
              className={`group rounded-lg border-2 p-4 text-left transition-all ${
                role === "admin"
                  ? "border-primary bg-primary/5 shadow-[var(--shadow-md)]"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <UserCog
                  className={`h-5 w-5 ${role === "admin" ? "text-primary" : "text-muted-foreground"}`}
                />
                <span className="font-semibold">Administrador</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Gerencia lojistas e visão geral da plataforma
              </p>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange("lojista")}
              className={`group rounded-lg border-2 p-4 text-left transition-all ${
                role === "lojista"
                  ? "border-primary bg-primary/5 shadow-[var(--shadow-md)]"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <Store
                  className={`h-5 w-5 ${role === "lojista" ? "text-primary" : "text-muted-foreground"}`}
                />
                <span className="font-semibold">Lojista</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Opera equipamentos, locações e devoluções
              </p>
            </button>
          </div>

          <Card className="p-6 shadow-[var(--shadow-elegant)]">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Entrando..." : `Entrar como ${role === "admin" ? "Admin" : "Lojista"}`}
              </Button>
            </form>

            <div className="mt-5 rounded-md bg-muted px-3 py-2.5 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Acesso de demonstração</p>
              <p className="mt-1">
                <span className="font-mono">{getDemoCredentials(role).email}</span>{" "}
                · <span className="font-mono">{getDemoCredentials(role).password}</span>
              </p>
            </div>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            Sistema em ambiente de demonstração — autenticação será integrada ao banco de
            dados quando o backend for ativado.
          </p>
        </div>
      </section>
    </main>
  );
}
