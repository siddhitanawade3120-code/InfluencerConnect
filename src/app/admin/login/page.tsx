"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Invalid password");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-cream-dark bg-white p-8 shadow-lg">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-terracotta/10">
          <Lock className="h-6 w-6 text-terracotta" />
        </div>
        <h1 className="text-xl font-bold text-warm-brown">Admin login</h1>
        <p className="mt-2 text-sm text-warm-gray">
          Enter your admin password to manage the creator database.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-cream-dark px-4 py-3 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-terracotta py-3 font-semibold text-white hover:bg-terracotta-dark disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
