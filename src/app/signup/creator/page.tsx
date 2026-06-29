"use client";

import Link from "next/link";
import { useState } from "react";
import { Instagram, Loader2, CheckCircle2, AlertCircle, MapPin } from "lucide-react";
import { CreatorAvatar } from "@/components/CreatorAvatar";
import { AREAS, CITIES, formatFollowers, formatRate } from "@/lib/types";
import { proxiedImageUrl } from "@/lib/proxy-image";

const inputClass = "input-field !py-2.5";

interface IgPreview {
  instagramHandle: string;
  fullName: string;
  profilePicUrl: string;
  followerCount: number;
  avgEngagementRate: number;
  avgLikes?: number;
  avgComments?: number;
  nicheTags: string[];
  estimatedRateMin: number;
  estimatedRateMax: number;
  contentStyle?: string;
  bio?: string;
}

export default function CreatorSignupPage() {
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewError, setPreviewError] = useState("");
  const [preview, setPreview] = useState<IgPreview | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    instagramHandle: "",
    bio: "",
    city: CITIES[0] as string,
    area: "Vasai-Virar",
  });

  const handlePreview = async () => {
    const handle = form.instagramHandle.replace(/^@/, "").trim();
    if (!handle) {
      setPreviewError("Enter your Instagram handle first");
      return;
    }

    setPreviewLoading(true);
    setPreviewError("");
    setPreview(null);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 45000);

      const res = await fetch("/api/auth/signup/creator/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instagramHandle: handle,
          city: form.city,
          area: form.area,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not load Instagram profile");

      setPreview(data.preview);
      if (!form.name && data.preview.fullName) {
        setForm((f) => ({ ...f, name: data.preview.fullName }));
      }
      if (!form.bio && data.preview.bio) {
        setForm((f) => ({ ...f, bio: data.preview.bio }));
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setPreviewError("Instagram took too long. Try again in a moment.");
      } else {
        setPreviewError(err instanceof Error ? err.message : "Preview failed");
      }
    } finally {
      setPreviewLoading(false);
    }
  };

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
      window.location.assign(data.redirect ?? "/dashboard/creator");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
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
        We pull your Instagram stats automatically so brands can discover you instantly —
        like a creator marketplace, built for Vasai-Virar.
      </p>

      <form onSubmit={handleSubmit} className="card mt-8 space-y-4 !p-6 sm:!p-8">
        <div>
          <label className="mb-1 block text-sm font-medium">Instagram handle</label>
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-gray">@</span>
              <input
                required
                className={`${inputClass} pl-8`}
                value={form.instagramHandle}
                placeholder="your_handle"
                onChange={(e) => {
                  setForm({ ...form, instagramHandle: e.target.value });
                  setPreview(null);
                  setPreviewError("");
                }}
              />
            </div>
            <button
              type="button"
              onClick={handlePreview}
              disabled={previewLoading || !form.instagramHandle.trim()}
              className="btn-secondary shrink-0 !px-4 !py-2.5 !text-sm"
            >
              {previewLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Verifying…</span>
                </>
              ) : (
                <>
                  <Instagram className="h-4 w-4" />
                  Verify
                </>
              )}
            </button>
          </div>
          <p className="mt-1.5 text-xs text-warm-gray">
            Public account required. Verification usually takes 5–15 seconds.
          </p>
        </div>

        {previewError && (
          <div className="flex gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {previewError}
          </div>
        )}

        {preview && (
          <div className="rounded-2xl border border-sage/30 bg-gradient-to-br from-sage-light/20 to-white p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-sage-dark">
              <CheckCircle2 className="h-4 w-4" />
              Profile verified from Instagram
            </div>
            <div className="mt-4 flex gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-2 ring-white">
                <CreatorAvatar
                  src={proxiedImageUrl(preview.profilePicUrl)}
                  alt={preview.fullName}
                  handle={preview.instagramHandle}
                  fill
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-warm-brown">@{preview.instagramHandle}</p>
                <p className="text-sm text-warm-gray">{preview.fullName}</p>
                <p className="mt-2 text-sm">
                  <span className="font-semibold text-warm-brown">
                    {formatFollowers(preview.followerCount)}
                  </span>{" "}
                  followers ·{" "}
                  <span className="font-semibold text-sage">{preview.avgEngagementRate}%</span>{" "}
                  engagement
                </p>
                <p className="mt-1 text-sm font-medium text-terracotta">
                  {formatRate(preview.estimatedRateMin, preview.estimatedRateMax)}
                </p>
                {preview.nicheTags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {preview.nicheTags.map((n) => (
                      <span
                        key={n}
                        className="rounded-full bg-sage-light/40 px-2 py-0.5 text-xs font-medium text-sage-dark"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <p className="mt-3 text-xs text-warm-gray">
              This is how brands will see your profile in search results.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">City</label>
            <select
              className={inputClass}
              value={form.city}
              onChange={(e) =>
                setForm({
                  ...form,
                  city: e.target.value,
                  area: AREAS[e.target.value]?.[0] ?? form.area,
                })
              }
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Area</label>
            <select
              className={inputClass}
              value={form.area}
              onChange={(e) => setForm({ ...form, area: e.target.value })}
            >
              {(AREAS[form.city] ?? []).map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="flex items-center gap-1.5 text-xs text-warm-gray">
          <MapPin className="h-3.5 w-3.5" />
          Brands in {form.area} will find you in local search
        </p>

        <div>
          <label className="mb-1 block text-sm font-medium">Full name</label>
          <input
            required
            className={inputClass}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            className={inputClass}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Password (min 8 chars)</label>
          <input
            type="password"
            required
            minLength={8}
            className={inputClass}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Phone / WhatsApp</label>
          <input
            type="tel"
            className={inputClass}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Bio (optional)</label>
          <textarea
            rows={3}
            className={inputClass}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Importing profile &amp; creating account…
            </>
          ) : (
            "Create creator account"
          )}
        </button>
      </form>
    </div>
  );
}
