"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useApp } from "@/lib/context";

const inputClass = "input-field !py-2.5";

export default function CreatorSignupPage() {
  const router = useRouter();
  const { refreshAuth } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    instagramHandle: "",
    bio: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/signup/creator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Signup failed");
      await refreshAuth();
      router.push(data.redirect ?? "/dashboard/creator");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-gradient mx-auto max-w-lg px-4 py-10">
      <Link href="/signup" className="text-sm font-medium text-warm-gray hover:text-terracotta">
        ← Back to account type
      </Link>
      <h1 className="mt-6 text-2xl font-bold text-warm-brown">Join as a creator</h1>
      <p className="mt-2 text-sm leading-relaxed text-warm-gray">
        Use your Instagram handle — we&apos;ll link your account if you&apos;re already in our directory.
        Brands will send deals directly to your dashboard.
      </p>

      <form onSubmit={handleSubmit} className="card mt-8 space-y-4 !p-6 sm:!p-8">
        <div>
          <label className="mb-1 block text-sm font-medium">Full name</label>
          <input required className={inputClass} value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input type="email" required className={inputClass} value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Password (min 8 chars)</label>
          <input type="password" required minLength={8} className={inputClass} value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Phone / WhatsApp</label>
          <input type="tel" className={inputClass} value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Instagram handle</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-gray">@</span>
            <input required className={`${inputClass} pl-8`} value={form.instagramHandle}
              placeholder="foodie_khalasi24"
              onChange={(e) => setForm({ ...form, instagramHandle: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Bio (optional)</label>
          <textarea rows={3} className={inputClass} value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </div>
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Creating account…" : "Create creator account"}
        </button>
      </form>
    </div>
  );
}
