"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Box, MessageSquare, Settings } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/boxes", label: "Boxes", icon: Box },
    { href: "/admin/feedbacks", label: "Feedback", icon: MessageSquare },
    { href: "/admin/settings", label: "Configurações", icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen bg-[#0D0D0D] border-r border-zinc-800 fixed left-0 top-0 flex flex-col">
      <div className="h-16 border-b border-zinc-800 flex items-center px-5">
        <span className="text-xl font-semibold text-white">MeuApp</span>
      </div>

      <nav className="flex-1 mt-4">
        <ul className="flex flex-col gap-1 px-3">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);

            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-md text-sm transition
                    ${
                      isActive
                        ? "bg-zinc-800 text-white"
                        : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    }
                  `}
                >
                  <Icon
                    size={18}
                    className={`${
                      isActive ? "text-emerald-400" : "text-zinc-500"
                    }`}
                  />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <footer className="px-4 py-4 text-xs text-zinc-500">
        © {new Date().getFullYear()} MeuApp
      </footer>
    </aside>
  );
}
