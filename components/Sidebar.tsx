"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Box,
  MessageSquare,
  Settings,
  Menu,
  X,
  LogOut,
  BarChart,
  CreditCard,
  LifeBuoy,
  PlayCircle,
  Building2,
  ClipboardList,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useSidebar } from "@/contexts/SidebarContext";
import { useLogout } from "@/hooks/integration/auth/mutations";

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen: open, setIsOpen: setOpen } = useSidebar();
  const logoutMutation = useLogout();

  function handleLogout() {
    logoutMutation.mutate();
  }

  // Não exibe a sidebar em rotas que não são administrativas
  // A sidebar é apenas para usuários logados na área admin
  if (!pathname.startsWith("/admin")) {
    return null;
  }

  const suggestionLinks = [
    { href: "/admin/suggestions/boxes", label: "Caixas", icon: Box },
    { href: "/admin/suggestions/feedbacks", label: "Feedbacks", icon: MessageSquare },
  ];
  const npsLinks = [
    { href: "/admin/nps/analytics", label: "Métricas NPS", icon: TrendingUp },
    { href: "/admin/nps/campaigns", label: "Campanhas", icon: ClipboardList },
    { href: "/admin/nps/branches", label: "Filiais", icon: Building2 },
  ];
  const insightsLinks = [
    { href: "/admin/insights", label: "Insights com IA", icon: Sparkles },
  ];
  const mainLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/reports", label: "Relatórios", icon: BarChart },
    { href: "/admin/tutorials", label: "Tutoriais", icon: PlayCircle },
    { href: "/admin/payments", label: "Assinaturas", icon: CreditCard },
    { href: "/admin/suporte", label: "Suporte", icon: LifeBuoy },
    { href: "/admin/settings", label: "Configurações", icon: Settings },
  ];

  return (
    <>
      {/* BOTÃO MOBILE — ABRIR */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-zinc-900 p-2 rounded-lg border border-zinc-700 shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        aria-label="Abrir menu de navegação"
      >
        <Menu size={22} className="text-white" aria-hidden />
      </button>

      {/* BACKDROP MOBILE */}
      {open && (
        <div
          role="button"
          tabIndex={-1}
          onClick={() => setOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          aria-label="Fechar menu"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-screen w-64 bg-[#0D0D0D] border-r border-zinc-800
          flex flex-col z-50 transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:!translate-x-0
        `}
        role="navigation"
        aria-label="Menu principal"
      >
        {/* HEADER */}
        <div className="h-16 border-b border-zinc-800 flex items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <span className="text-xl font-semibold text-white">MentionOne</span>
          </div>

          {/* Botão fechar mobile */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label="Fechar menu"
          >
            <X size={20} className="text-zinc-300" aria-hidden />
          </button>
        </div>

        {/* NAV LINKS */}
        <nav className="flex-1 mt-4" aria-label="Navegação do painel">
          <ul className="flex flex-col gap-1 px-3">
            <li>
              <span className="px-3 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Sugestões
              </span>
            </li>
            {suggestionLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ml-1
                      ${
                        active
                          ? "bg-zinc-800 text-white"
                          : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                      }
                    `}
                  >
                    <Icon
                      size={18}
                      className={active ? "text-emerald-400" : "text-zinc-500"}
                    />
                    {label}
                  </Link>
                </li>
              );
            })}
            <li className="pt-2 mt-1 border-t border-zinc-800">
              <span className="px-3 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                NPS
              </span>
            </li>
            {npsLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ml-1
                      ${
                        active
                          ? "bg-zinc-800 text-white"
                          : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                      }
                    `}
                  >
                    <Icon
                      size={18}
                      className={active ? "text-emerald-400" : "text-zinc-500"}
                    />
                    {label}
                  </Link>
                </li>
              );
            })}
            <li className="pt-2 mt-1 border-t border-zinc-800">
              <span className="px-3 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Insights
              </span>
            </li>
            {insightsLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ml-1
                      ${
                        active
                          ? "bg-zinc-800 text-white"
                          : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                      }
                    `}
                  >
                    <Icon
                      size={18}
                      className={active ? "text-emerald-400" : "text-zinc-500"}
                    />
                    {label}
                  </Link>
                </li>
              );
            })}
            <li className="pt-2 mt-1 border-t border-zinc-800">
              <span className="px-3 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Painel
              </span>
            </li>
            {mainLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ml-1
                      ${
                        active
                          ? "bg-zinc-800 text-white"
                          : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                      }
                    `}
                  >
                    <Icon
                      size={18}
                      className={active ? "text-emerald-400" : "text-zinc-500"}
                    />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* FOOTER */}
        <footer className="border-t border-zinc-800">
          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="w-full flex items-center gap-3 px-3 py-3 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-red-400 transition disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rounded-md"
            aria-label="Sair da conta"
          >
            <LogOut size={18} className="text-zinc-500" aria-hidden />
            {logoutMutation.isPending ? "Saindo..." : "Sair"}
          </button>
          <div className="px-4 py-3 text-xs text-zinc-500">
            © {new Date().getFullYear()} MeuApp
          </div>
        </footer>
      </aside>
    </>
  );
}
