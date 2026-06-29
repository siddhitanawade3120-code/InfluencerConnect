"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { LogIn } from "lucide-react";
import { useApp } from "@/lib/context";

const inputClass =
  "w-full rounded-xl border border-cream-dark px-4 py-3 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshAuth } = useApp();
  const redirect = searchParams.get("redirect");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Login failed");
      await refreshAuth();
      router.push(redirect ?? data.redirect ?? "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-cream-dark bg-white p-8 shadow-lg">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-terracotta/10">
          <LogIn className="h-6 w-6 text-terracotta" />
        </div>
        <h1 className="text-xl font-bold text-warm-brown">Log in</h1>
        <p className="mt-2 text-sm text-warm-gray">
          Brands and creators use the same login. You&apos;ll be sent to your dashboard.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input type="email" required placeholder="Email" className={inputClass}
            value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" required placeholder="Password" className={inputClass}
            value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full rounded-xl bg-terracotta py-3 font-semibold text-white hover:bg-terracotta-dark disabled:opacity-50">
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-warm-gray">
          No account?{" "}
          <Link href="/signup" className="font-medium text-terracotta hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[calc(100vh-57px)] items-center justify-center">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
