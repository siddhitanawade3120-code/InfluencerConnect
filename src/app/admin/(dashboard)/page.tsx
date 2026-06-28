"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreatorAvatar } from "@/components/CreatorAvatar";
import { Pencil, Plus, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import type { Creator } from "@/lib/types";
import { formatFollowers, formatRate, isRecentlyVerified } from "@/lib/types";

export default function AdminDashboardPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [refreshingAll, setRefreshingAll] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState("");
  const [refreshProgress, setRefreshProgress] = useState<{
    done: number;
    total: number;
    handle: string;
  } | null>(null);

  const loadCreators = async () => {
    const r = await fetch("/api/creators?activeOnly=false");
    const data = await r.json();
    if (!r.ok) throw new Error(data.error ?? "Failed to load creators");
    if (!Array.isArray(data)) throw new Error("Invalid response");
    setCreators(data as Creator[]);
    return data as Creator[];
  };

  useEffect(() => {
    loadCreators()
      .catch((err) =>
        setDbError(err instanceof Error ? err.message : "Could not connect to MongoDB Atlas")
      )
      .finally(() => setLoading(false));
  }, []);

  const handleRefreshAll = async () => {
    if (creators.length === 0) {
      setRefreshMsg("No creators to refresh.");
      return;
    }

    const confirmed = window.confirm(
      `Refresh all ${creators.length} creator(s) from Instagram?\n\nThis fetches latest followers, engagement, and profile photos. It may take 1–2 minutes.`
    );
    if (!confirmed) return;

    setRefreshingAll(true);
    setRefreshMsg("");
    let ok = 0;
    let fail = 0;
    const failedHandles: string[] = [];

    for (let i = 0; i < creators.length; i++) {
      const c = creators[i];
      setRefreshProgress({
        done: i + 1,
        total: creators.length,
        handle: c.instagramHandle,
      });

      try {
        const res = await fetch("/api/creators/refresh-one", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: c.id }),
        });
        if (res.ok) ok += 1;
        else {
          fail += 1;
          failedHandles.push(c.instagramHandle);
        }
      } catch {
        fail += 1;
        failedHandles.push(c.instagramHandle);
      }

      if (i < creators.length - 1) {
        await new Promise((r) => setTimeout(r, 1500));
      }
    }

    await loadCreators();

    setRefreshMsg(
      fail === 0
        ? `All ${ok} creator(s) updated with latest Instagram data.`
        : `Updated ${ok}/${creators.length}. Failed: ${failedHandles.map((h) => `@${h}`).join(", ")}`
    );
    setRefreshingAll(false);
    setRefreshProgress(null);
  };

  return (
    <div>
      {dbError && (
        <div className="mb-6 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Database connection failed</p>
            <p className="mt-1">{dbError}</p>
            <p className="mt-2">
              In MongoDB Atlas: resume cluster → Network Access → add your IP (or 0.0.0.0/0 for dev) → restart app.
            </p>
          </div>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-warm-brown">
            {loading
              ? "Loading creators…"
              : `${creators.length} creator${creators.length !== 1 ? "s" : ""} in database`}
          </h2>
          <p className="text-sm text-warm-gray">
            Add, edit, or deactivate creators. Use one-click refresh to pull latest followers from Instagram.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleRefreshAll}
            disabled={refreshingAll || loading || creators.length === 0}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshingAll ? "animate-spin" : ""}`} />
            {refreshingAll ? "Updating from Instagram…" : "Refresh all from Instagram"}
          </button>
          <Link
            href="/admin/creators/new"
            className="flex items-center gap-2 rounded-xl bg-terracotta px-4 py-2.5 text-sm font-semibold text-white hover:bg-terracotta-dark"
          >
            <Plus className="h-4 w-4" /> Add creator
          </Link>
        </div>
      </div>

      {refreshProgress && (
        <div className="mb-4 rounded-2xl border border-terracotta/20 bg-terracotta/5 p-4 text-sm">
          <p className="font-semibold text-warm-brown">
            Updating {refreshProgress.done} of {refreshProgress.total}
          </p>
          <p className="mt-1 text-warm-gray">
            Fetching @{refreshProgress.handle} from Instagram…
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-cream-dark">
            <div
              className="h-full rounded-full bg-terracotta transition-all duration-300"
              style={{
                width: `${(refreshProgress.done / refreshProgress.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {refreshMsg && (
        <p
          className={`mb-4 text-sm ${
            refreshMsg.includes("Failed") ? "text-red-600" : "text-sage-dark"
          }`}
        >
          {refreshMsg}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-warm-gray">
          <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
        </div>
      ) : creators.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-cream-dark bg-white p-12 text-center">
          <p className="text-lg font-medium text-warm-brown">
            {dbError ? "Cannot load creators" : "No creators yet"}
          </p>
          {!dbError && (
            <>
              <p className="mt-2 text-sm text-warm-gray">
                Add your first Vasai-Virar influencer to get started.
              </p>
              <Link
                href="/admin/creators/new"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-terracotta px-5 py-2.5 text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" /> Add creator
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-cream-dark bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-cream-dark bg-cream text-xs uppercase tracking-wide text-warm-gray">
                <tr>
                  <th className="p-4">Creator</th>
                  <th className="p-4">Area</th>
                  <th className="p-4">Followers</th>
                  <th className="p-4">Engagement</th>
                  <th className="p-4">Rate band</th>
                  <th className="p-4">Verified</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Source</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {creators.map((c) => (
                  <tr key={c.id} className="border-b border-cream-dark last:border-0">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full">
                          <CreatorAvatar src={c.profilePicUrl} alt={c.fullName} fill />
                        </div>
                        <div>
                          <p className="font-semibold">@{c.instagramHandle}</p>
                          <p className="text-xs text-warm-gray">{c.fullName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-warm-gray">{c.area}</td>
                    <td className="p-4">{formatFollowers(c.followerCount)}</td>
                    <td className="p-4 text-sage">{c.avgEngagementRate}%</td>
                    <td className="p-4 font-medium text-terracotta">
                      {formatRate(c.estimatedRateMin, c.estimatedRateMax)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          isRecentlyVerified(c.lastVerifiedDate)
                            ? "bg-sage-light/40 text-sage-dark"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {c.lastVerifiedDate}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          c.isVerifiedActive
                            ? "bg-sage text-white"
                            : "bg-cream-dark text-warm-gray"
                        }`}
                      >
                        {c.isVerifiedActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4 max-w-[120px] truncate text-xs text-warm-gray">
                      {c.sourceFound ?? "—"}
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/admin/creators/${c.id}/edit`}
                        className="inline-flex items-center gap-1 rounded-lg bg-cream px-3 py-1.5 text-xs font-medium hover:bg-cream-dark"
                      >
                        <Pencil className="h-3 w-3" /> Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
