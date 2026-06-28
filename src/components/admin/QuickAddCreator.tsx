"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Instagram, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { proxiedImageUrl } from "@/lib/proxy-image";
import { AREAS, CITIES, NICHES } from "@/lib/types";

interface ScrapePreview {
  username: string;
  fullName: string;
  followers: number;
  avgEngagementRate: number;
  avgLikes: number;
  avgComments: number;
  postsChecked: number;
  nicheTags: string[];
  profilePicUrl: string;
  bio: string;
  verified: boolean;
  accountType: string;
}

export function QuickAddCreator() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [area, setArea] = useState("Vasai-Virar");
  const [city, setCity] = useState("Mumbai");
  const [nicheTags, setNicheTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<ScrapePreview | null>(null);
  const [success, setSuccess] = useState("");

  const toggleNiche = (niche: string) => {
    setNicheTags((prev) =>
      prev.includes(niche) ? prev.filter((n) => n !== niche) : [...prev, niche]
    );
  };

  const handlePreview = async () => {
    setPreviewLoading(true);
    setError("");
    setPreview(null);
    setSuccess("");

    try {
      const res = await fetch("/api/creators/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          city,
          area,
          nicheTags: nicheTags.length ? nicheTags : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Scrape failed");
      setPreview(data.scraped);
      if (data.scraped.nicheTags?.length && nicheTags.length === 0) {
        setNicheTags(data.scraped.nicheTags);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scrape failed");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleImport = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/creators/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          city,
          area,
          nicheTags: nicheTags.length ? nicheTags : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed");

      setSuccess(data.message);
      setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-terracotta/20 bg-terracotta/5 p-4 text-sm text-warm-brown">
        <p className="font-semibold">Import from Instagram</p>
        <p className="mt-1 text-warm-gray">
          Enter a public Instagram username — we fetch profile photo, followers, engagement
          (from last 6 posts), and bio automatically via <code className="rounded bg-white px-1">scraper-instagram</code>.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-semibold text-warm-brown">
            Instagram username *
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray">@</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/^@/, ""))}
                placeholder="foodie_khalasi24"
                className="w-full rounded-xl border border-cream-dark py-3 pl-8 pr-4 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
              />
            </div>
            <button
              type="button"
              onClick={handlePreview}
              disabled={!username.trim() || previewLoading}
              className="flex items-center gap-2 rounded-xl border border-cream-dark bg-white px-4 py-2 text-sm font-semibold hover:bg-cream disabled:opacity-50"
            >
              {previewLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Instagram className="h-4 w-4" />
              )}
              Preview
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-warm-brown">City</label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-xl border border-cream-dark px-4 py-2.5"
          >
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-warm-brown">Area</label>
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="w-full rounded-xl border border-cream-dark px-4 py-2.5"
          >
            {(AREAS[city] ?? []).map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-warm-brown">
            Niche (optional — auto-detected from bio)
          </label>
          <div className="flex flex-wrap gap-2">
            {NICHES.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => toggleNiche(n)}
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  nicheTags.includes(n)
                    ? "bg-sage text-white"
                    : "bg-cream-dark text-warm-gray"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p>{error}</p>
            <p className="mt-2 text-xs text-red-700">
              Tip: Profile must be public. INSTAGRAM_SESSION_ID in .env is optional — use raw
              sessionid value (not URL-encoded). Remove it if you get rate-limit errors.
            </p>
          </div>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-sage/30 bg-sage-light/20 p-4 text-sm text-sage-dark">
          <CheckCircle2 className="h-5 w-5" />
          {success}
        </div>
      )}

      {preview && (
        <div className="rounded-2xl border border-cream-dark bg-cream p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-warm-gray">
            Preview from Instagram
          </p>
          <div className="flex gap-4">
            <img
              src={proxiedImageUrl(preview.profilePicUrl)}
              alt=""
              className="h-16 w-16 rounded-full ring-2 ring-white"
            />
            <div>
              <p className="font-bold text-warm-brown">@{preview.username}</p>
              <p className="text-sm text-warm-gray">{preview.fullName}</p>
              <p className="mt-2 text-sm">
                <span className="font-semibold">{preview.followers.toLocaleString()}</span> followers ·{" "}
                <span className="font-semibold text-sage">{preview.avgEngagementRate}%</span> engagement
              </p>
              <p className="mt-1 text-xs text-warm-gray">
                {preview.postsChecked} posts checked · avg {preview.avgLikes} likes, {preview.avgComments} comments
              </p>
              {preview.bio && (
                <p className="mt-2 line-clamp-2 text-xs text-warm-gray">{preview.bio}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleImport}
          disabled={!username.trim() || loading}
          className="flex items-center gap-2 rounded-2xl bg-terracotta px-8 py-3 font-bold text-white hover:bg-terracotta-dark disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> Fetching & saving…
            </>
          ) : (
            <>
              <Instagram className="h-5 w-5" /> Fetch from Instagram & save
            </>
          )}
        </button>
        <Link
          href="/admin/creators/manual"
          className="rounded-2xl border border-cream-dark px-6 py-3 text-sm font-medium text-warm-gray hover:bg-cream"
        >
          Manual entry instead
        </Link>
      </div>
    </div>
  );
}
