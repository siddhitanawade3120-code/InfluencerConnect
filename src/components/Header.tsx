"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Users,
  ListChecks,
  Search,
  LayoutDashboard,
  Handshake,
  LogIn,
  Menu,
  X,
  LogOut,
  User,
  type LucideIcon,
} from "lucide-react";
import { useApp } from "@/lib/context";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { shortlist, user, authLoading, refreshAuth } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isBrand = user?.role === "BRAND";
  const isCreator = user?.role === "CREATOR";

  const brandLinks: NavItem[] = [
    { href: "/", label: "Find Creators", icon: Search },
    { href: "/results", label: "Results", icon: Users },
    { href: "/shortlist", label: "Shortlist", icon: ListChecks, badge: shortlist.length },
    { href: "/dashboard/brand", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/brand/inquiries", label: "Deals", icon: Handshake },
  ];

  const creatorLinks: NavItem[] = [
    { href: "/dashboard/creator", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/creator/inquiries", label: "My Deals", icon: Handshake },
  ];

  const guestLinks: NavItem[] = [
    { href: "/", label: "Find Creators", icon: Search },
    { href: "/results", label: "Results", icon: Users },
    { href: "/shortlist", label: "Shortlist", icon: ListChecks, badge: shortlist.length },
  ];

  const links = isCreator ? creatorLinks : isBrand ? brandLinks : guestLinks;
  const homeHref = isCreator ? "/dashboard/creator" : "/";

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    await refreshAuth();
    setMobileOpen(false);
    router.push("/login");
    router.refresh();
  };

  const NavLink = ({
    href,
    label,
    icon: Icon,
    badge,
    onClick,
    className = "",
  }: NavItem & { onClick?: () => void; className?: string }) => {
    const active = isActive(href);
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`relative flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${className} ${
          active
            ? "bg-terracotta text-white shadow-sm"
            : "text-warm-gray hover:bg-cream-dark hover:text-warm-brown"
        }`}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span>{label}</span>
        {badge !== undefined && badge > 0 && (
          <span
            className={`ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold ${
              active ? "bg-white text-terracotta" : "bg-terracotta text-white"
            }`}
          >
            {badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-cream-dark/80 bg-white/90 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href={homeHref} className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-terracotta to-terracotta-dark text-white shadow-sm">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-warm-brown">InfluConnect</span>
            <span className="ml-2 hidden text-xs text-warm-gray lg:inline">
              {isCreator ? "Creator portal" : "For small businesses"}
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          {!authLoading &&
            links.map((item) => (
              <NavLink
                key={item.href}
                {...item}
                className="!rounded-full !px-3 !py-2 lg:!px-4"
              />
            ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {!authLoading && user && (
            <div className="flex items-center gap-2 rounded-full border border-cream-dark bg-cream/50 py-1 pl-1 pr-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-terracotta/15 text-terracotta">
                <User className="h-4 w-4" />
              </div>
              <div className="hidden text-left lg:block">
                <p className="max-w-[120px] truncate text-xs font-semibold text-warm-brown">
                  {user.name}
                </p>
                <p className="text-[10px] text-warm-gray">
                  {isBrand ? user.brandProfile?.businessName ?? "Brand" : "Creator"}
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Log out"
                className="rounded-lg p-1.5 text-warm-gray hover:bg-white hover:text-terracotta"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}

          {!authLoading && !user && (
            <>
              <Link href="/login" className="btn-secondary !py-2 !text-sm">
                Sign in
              </Link>
              <Link href="/signup" className="btn-primary !py-2 !text-sm">
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-xl border border-cream-dark p-2 text-warm-brown md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-cream-dark bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {!authLoading &&
              links.map((item) => (
                <NavLink
                  key={item.href}
                  {...item}
                  onClick={() => setMobileOpen(false)}
                />
              ))}
          </nav>

          <div className="mt-4 border-t border-cream-dark pt-4">
            {!authLoading && user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-terracotta/15 text-terracotta">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-warm-brown">{user.name}</p>
                    <p className="text-xs text-warm-gray">{user.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-cream-dark py-2.5 text-sm font-medium text-warm-gray"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            ) : (
              !authLoading && (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="btn-secondary w-full !text-sm"
                  >
                    <LogIn className="h-4 w-4" />
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="btn-primary w-full !text-sm"
                  >
                    Get started free
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
}
