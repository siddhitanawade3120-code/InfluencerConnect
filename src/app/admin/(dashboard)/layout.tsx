import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-[calc(100vh-57px)] bg-cream">
      <div className="border-b border-cream-dark bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-terracotta">
              Admin Panel
            </p>
            <h1 className="text-lg font-bold text-warm-brown">Creator Database</h1>
          </div>
          <nav className="flex gap-2 text-sm">
            <a href="/admin" className="rounded-lg px-3 py-1.5 font-medium hover:bg-cream">
              All creators
            </a>
            <a
              href="/admin/creators/new"
              className="rounded-lg bg-terracotta px-3 py-1.5 font-medium text-white hover:bg-terracotta-dark"
            >
              + Add creator
            </a>
          </nav>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
