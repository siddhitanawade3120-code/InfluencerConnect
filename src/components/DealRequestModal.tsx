"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Creator } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context";

interface DealRequestModalProps {
  open: boolean;
  onClose: () => void;
  creator: Creator;
}

const inputClass =
  "w-full rounded-xl border border-cream-dark px-4 py-2.5 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20";

export function DealRequestModal({ open, onClose, creator }: DealRequestModalProps) {
  const router = useRouter();
  const { user, refreshAuth } = useApp();
  const brandBudget = user?.brandProfile;

  const [offeredBudget, setOfferedBudget] = useState(
    brandBudget ? Math.round((brandBudget.budgetMin + brandBudget.budgetMax) / 2) : creator.estimatedRateMin
  );
  const [deliverables, setDeliverables] = useState("1 reel + 2 stories");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (user?.role !== "BRAND") {
        throw new Error("Only brand accounts can send deal requests");
      }

      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorId: creator.id,
          offeredBudget,
          deliverables,
          deadline: deadline || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send deal request");

      await refreshAuth();
      onClose();
      router.push(`/dashboard/inquiries/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send deal request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-warm-brown">Send deal request</h2>
            <p className="text-sm text-warm-gray">To @{creator.instagramHandle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-warm-gray hover:bg-cream"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {brandBudget && (
          <p className="mb-4 rounded-xl bg-cream p-3 text-sm text-warm-gray">
            Your profile budget: ₹{brandBudget.budgetMin.toLocaleString("en-IN")} – ₹
            {brandBudget.budgetMax.toLocaleString("en-IN")}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-warm-brown">
              Offered budget (₹)
            </label>
            <input
              type="number"
              required
              min={1}
              className={inputClass}
              value={offeredBudget}
              onChange={(e) => setOfferedBudget(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-warm-brown">
              Deliverables
            </label>
            <textarea
              required
              rows={3}
              className={inputClass}
              placeholder="e.g. 1 reel + 2 stories at our Vasai outlet"
              value={deliverables}
              onChange={(e) => setDeliverables(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-warm-brown">
              Deadline (optional)
            </label>
            <input
              type="date"
              className={inputClass}
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-terracotta py-3 font-semibold text-white hover:bg-terracotta-dark disabled:opacity-50"
          >
            {loading ? "Sending…" : "Send deal request"}
          </button>
        </form>
      </div>
    </div>
  );
}
