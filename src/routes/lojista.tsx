import { createFileRoute, Outlet, Link, useNavigate, useLocation, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Boxes,
  ClipboardList,
  LogOut,
  Wrench,
  Menu,
  X,
  Users,
  UserCog,
  TrendingUp,
} from "lucide-react";
import { getSession, logout } from "@/lib/mock-auth";
import { mockDb } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/lojista")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const s = getSession();
    if (!s) throw redirect({ to: "/" });
    if (s.role !== "lojista") throw redirect({ to: "/admin" });
  },
  component: LojistaLayout,
});

const navItems = [
  { to: "/lojista", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/lojista/equipamentos", label: "Equipamentos", icon: Boxes, exact: false },
  { to: "/lojista/clientes", label: "Clientes", icon: Users, exact: false },
  { to: "/lojista/funcionarios", label: "Funcionários", icon: UserCog, exact: false },
  { to: "/lojista/locacoes", label: "Locações", icon: ClipboardList, exact: false },
  { to: "/lojista/painel", label: "Painel de status", icon: Boxes, exact: false },
  { to: "/lojista/relatorios", label: "Relatórios", icon: TrendingUp, exact: false },
];

function LojistaLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState(() => getSession());
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setSession(getSession());
    // Atualiza status de locações atrasadas ao entrar na área do lojista.
    mockDb.syncAtrasos();
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  const lojista = session?.lojistaId ? mockDb.getLojista(session.lojistaId) : null;
  const displayName = lojista?.nome ?? session?.name ?? "Lojista";
  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card px-4 py-3 shadow-sm">
        <Link to="/lojista" className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-md"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Wrench className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold">RentalPro</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-md"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Wrench className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">RentalPro</p>
              <p className="text-xs text-sidebar-foreground/60">Painel do Lojista</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-5">
            {navItems.map((item) => {
              const isActive = item.exact
                ? location.pathname === item.to
                : location.pathname === item.to || location.pathname.startsWith(item.to + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-sidebar-border p-3">
            <div className="flex items-center gap-3 rounded-md px-3 py-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{displayName}</p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {session?.email ?? ""}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="mt-2 w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </aside>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Main */}
        <main className="flex-1 min-w-0">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
