"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useApp } from "@/lib/context";

export function LogoutButton() {
  const router = useRouter();
  const { refreshAuth } = useApp();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    await refreshAuth();
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="inline-flex items-center gap-2 rounded-xl border border-cream-dark px-4 py-2 text-sm font-medium text-warm-gray hover:bg-cream"
    >
      <LogOut className="h-4 w-4" />
      Log out
    </button>
  );
}
