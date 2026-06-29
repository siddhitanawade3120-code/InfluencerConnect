"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { LogIn, Building2, Camera } from "lucide-react";
import { useApp } from "@/lib/context";

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
    <div className="page-gradient flex min-h-[calc(100vh-57px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card shadow-lg">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-terracotta/15 to-sage-light/30">
            <LogIn className="h-7 w-7 text-terracotta" />
          </div>
          <h1 className="text-2xl font-bold text-warm-brown">Welcome back</h1>
          <p className="mt-2 text-sm leading-relaxed text-warm-gray">
            Sign in to your brand or creator account. We&apos;ll take you to the right dashboard.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-warm-brown">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="you@business.com"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-warm-brown">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-8 border-t border-cream-dark pt-6">
            <p className="text-center text-sm text-warm-gray">New to InfluConnect?</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link
                href="/signup/brand"
                className="flex flex-col items-center gap-2 rounded-xl border border-cream-dark p-4 text-center text-sm font-medium text-warm-brown transition-colors hover:border-terracotta-light hover:bg-cream"
              >
                <Building2 className="h-5 w-5 text-terracotta" />
                Brand
              </Link>
              <Link
                href="/signup/creator"
                className="flex flex-col items-center gap-2 rounded-xl border border-cream-dark p-4 text-center text-sm font-medium text-warm-brown transition-colors hover:border-sage hover:bg-cream"
              >
                <Camera className="h-5 w-5 text-sage-dark" />
                Creator
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-57px)] items-center justify-center text-warm-gray">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
