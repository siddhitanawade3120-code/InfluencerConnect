"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/lib/context";
import { AREAS, CITIES } from "@/lib/types";

const CATEGORIES = [
  "Cloud Kitchen",
  "Restaurant",
  "Cafe",
  "Dessert Shop",
  "Bakery",
  "Other",
];

const inputClass = "input-field !py-2.5";

export default function BrandSignupPage() {
  const router = useRouter();
  const { refreshAuth } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    businessName: "",
    category: CATEGORIES[0],
    budgetMin: 500,
    budgetMax: 5000,
    city: CITIES[0] as string,
    area: "Vasai-Virar",
    website: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/signup/brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Signup failed");
      await refreshAuth();
      router.push(data.redirect ?? "/dashboard/brand");
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
      <h1 className="mt-6 text-2xl font-bold text-warm-brown">Create your brand account</h1>
      <p className="mt-2 text-sm leading-relaxed text-warm-gray">
        Tell us about your business so we can match you with the right creators in your area.
      </p>

      <form onSubmit={handleSubmit} className="card mt-8 space-y-4 !p-6 sm:!p-8">
        <div>
          <label className="mb-1 block text-sm font-medium">Your name</label>
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
          <label className="mb-1 block text-sm font-medium">Business name</label>
          <input required className={inputClass} value={form.businessName}
            onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Category</label>
          <select className={inputClass} value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Budget min (₹)</label>
            <input type="number" required min={0} className={inputClass} value={form.budgetMin}
              onChange={(e) => setForm({ ...form, budgetMin: Number(e.target.value) })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Budget max (₹)</label>
            <input type="number" required min={0} className={inputClass} value={form.budgetMax}
              onChange={(e) => setForm({ ...form, budgetMax: Number(e.target.value) })} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">City</label>
            <select className={inputClass} value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}>
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Area</label>
            <select className={inputClass} value={form.area}
              onChange={(e) => setForm({ ...form, area: e.target.value })}>
              {AREAS.Mumbai.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Website (optional)</label>
          <input type="url" className={inputClass} value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })} />
        </div>
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Creating account…" : "Create brand account"}
        </button>
      </form>
    </div>
  );
}
