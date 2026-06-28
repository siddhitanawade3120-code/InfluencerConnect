"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, ListChecks, Search } from "lucide-react";
import { useApp } from "@/lib/context";

export function Header() {
  const pathname = usePathname();
  const { shortlist } = useApp();

  const links = [
    { href: "/", label: "Find Creators", icon: Search },
    { href: "/results", label: "Results", icon: Users },
    {
      href: "/shortlist",
      label: "Shortlist",
      icon: ListChecks,
      badge: shortlist.length,
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-cream-dark bg-cream/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-terracotta text-white">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-bold text-warm-brown">InfluConnect</span>
            <span className="ml-2 hidden text-xs text-warm-gray sm:inline">
              Vasai-Virar
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map(({ href, label, icon: Icon, badge }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors sm:px-4 ${
                  active
                    ? "bg-terracotta text-white"
                    : "text-warm-gray hover:bg-cream-dark hover:text-warm-brown"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
                {badge !== undefined && badge > 0 && (
                  <span
                    className={`absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                      active
                        ? "bg-white text-terracotta"
                        : "bg-terracotta text-white"
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
