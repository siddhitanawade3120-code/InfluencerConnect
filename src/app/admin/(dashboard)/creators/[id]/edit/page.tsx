"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { CreatorForm, creatorToForm } from "@/components/admin/CreatorForm";
import type { Creator } from "@/lib/types";

export default function EditCreatorPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/creators/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setCreator(data);
      })
      .catch(() => setCreator(null))
      .finally(() => setLoading(false));
  }, [id]);

  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState("");

  const handleRefreshFromInstagram = async () => {
    if (!creator) return;
    setRefreshing(true);
    setRefreshMsg("");
    try {
      const res = await fetch("/api/creators/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: creator.instagramHandle,
          city: creator.city,
          area: creator.area,
          nicheTags: creator.nicheTags,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Refresh failed");
      setCreator(data.creator);
      setRefreshMsg("Profile refreshed from Instagram");
    } catch (err) {
      setRefreshMsg(err instanceof Error ? err.message : "Refresh failed");
    } finally {
      setRefreshing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this creator permanently?")) return;
    const res = await fetch(`/api/creators/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    }
  };

  if (loading) {
    return <p className="text-warm-gray">Loading…</p>;
  }

  if (!creator) {
    return <p className="text-red-600">Creator not found.</p>;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-warm-brown">
          Edit @{creator.instagramHandle}
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleRefreshFromInstagram}
            disabled={refreshing}
            className="rounded-xl border border-sage bg-sage-light/30 px-4 py-2 text-sm font-medium text-sage-dark hover:bg-sage-light/50 disabled:opacity-50"
          >
            {refreshing ? "Refreshing…" : "Refresh from Instagram"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
      {refreshMsg && (
        <p className={`mb-4 text-sm ${refreshMsg.includes("failed") || refreshMsg.includes("blocked") ? "text-red-600" : "text-sage-dark"}`}>
          {refreshMsg}
        </p>
      )}
      <div className="rounded-2xl border border-cream-dark bg-white p-6 shadow-sm sm:p-8">
        <CreatorForm
          initial={creatorToForm(creator)}
          submitLabel="Update creator"
          onSubmit={async (data) => {
            const res = await fetch(`/api/creators/${id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            });
            if (!res.ok) {
              const err = await res.json();
              throw new Error(err.error ?? "Failed to update");
            }
            router.push("/admin");
            router.refresh();
          }}
        />
      </div>
    </div>
  );
}
