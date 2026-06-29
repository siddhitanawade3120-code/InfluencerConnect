"use client";

import { useState } from "react";
import type { EnrichedInquiry, InquiryStatus } from "@/lib/inquiry-types";
import { TERMINAL_STATUSES } from "@/lib/inquiry-types";

interface InquiryActionsProps {
  inquiry: EnrichedInquiry;
  role: "BRAND" | "CREATOR";
  onUpdated: () => void;
}

const inputClass =
  "w-full rounded-xl border border-cream-dark px-3 py-2 text-sm focus:border-terracotta focus:outline-none";

export function InquiryActions({ inquiry, role, onUpdated }: InquiryActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showCounter, setShowCounter] = useState(false);
  const [counterBudget, setCounterBudget] = useState(inquiry.offeredBudget);
  const [counterNote, setCounterNote] = useState("");

  const status = inquiry.status as InquiryStatus;
  const terminal = TERMINAL_STATUSES.includes(status);

  const runAction = async (action: string, extra: Record<string, unknown> = {}) => {
    setLoading(action);
    setError("");
    try {
      const res = await fetch(`/api/inquiries/${inquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Action failed");
      setShowCounter(false);
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setLoading(null);
    }
  };

  if (terminal) {
    return null;
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-600">{error}</p>}

      {role === "CREATOR" && (status === "PENDING" || status === "NEGOTIATING") && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!!loading}
            onClick={() => runAction("ACCEPT")}
            className="rounded-xl bg-sage px-4 py-2 text-sm font-semibold text-white hover:bg-sage-dark disabled:opacity-50"
          >
            {loading === "ACCEPT" ? "…" : "Accept deal"}
          </button>
          <button
            type="button"
            disabled={!!loading}
            onClick={() => runAction("DECLINE")}
            className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            {loading === "DECLINE" ? "…" : "Decline"}
          </button>
          <button
            type="button"
            disabled={!!loading}
            onClick={() => setShowCounter(!showCounter)}
            className="rounded-xl border border-cream-dark px-4 py-2 text-sm font-semibold text-warm-brown hover:bg-cream disabled:opacity-50"
          >
            Counter offer
          </button>
        </div>
      )}

      {role === "BRAND" && status === "NEGOTIATING" && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!!loading}
            onClick={() => runAction("CONFIRM")}
            className="rounded-xl bg-sage px-4 py-2 text-sm font-semibold text-white hover:bg-sage-dark disabled:opacity-50"
          >
            {loading === "CONFIRM" ? "…" : "Confirm terms"}
          </button>
          <button
            type="button"
            disabled={!!loading}
            onClick={() => setShowCounter(!showCounter)}
            className="rounded-xl border border-cream-dark px-4 py-2 text-sm font-semibold text-warm-brown hover:bg-cream disabled:opacity-50"
          >
            Counter offer
          </button>
        </div>
      )}

      {role === "CREATOR" && status === "CONFIRMED" && (
        <button
          type="button"
          disabled={!!loading}
          onClick={() => runAction("MARK_DELIVERED")}
          className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {loading === "MARK_DELIVERED" ? "…" : "Mark as delivered"}
        </button>
      )}

      {role === "BRAND" && status === "DELIVERED" && (
        <button
          type="button"
          disabled={!!loading}
          onClick={() => runAction("MARK_COMPLETED")}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading === "MARK_COMPLETED" ? "…" : "Mark as completed"}
        </button>
      )}

      {role === "BRAND" &&
        (status === "PENDING" || status === "NEGOTIATING" || status === "CONFIRMED") && (
          <button
            type="button"
            disabled={!!loading}
            onClick={() => runAction("CANCEL")}
            className="rounded-xl border border-cream-dark px-4 py-2 text-sm font-medium text-warm-gray hover:bg-cream disabled:opacity-50"
          >
            {loading === "CANCEL" ? "…" : "Cancel deal"}
          </button>
        )}

      {showCounter && (
        <div className="rounded-xl border border-cream-dark bg-cream/50 p-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-warm-gray">
              Counter budget (₹)
            </label>
            <input
              type="number"
              min={1}
              className={inputClass}
              value={counterBudget}
              onChange={(e) => setCounterBudget(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-warm-gray">
              Note (optional)
            </label>
            <textarea
              rows={2}
              className={inputClass}
              value={counterNote}
              onChange={(e) => setCounterNote(e.target.value)}
              placeholder="Explain your counter offer…"
            />
          </div>
          <button
            type="button"
            disabled={!!loading}
            onClick={() =>
              runAction("COUNTER", {
                offeredBudget: counterBudget,
                note: counterNote || `Counter offer: ₹${counterBudget.toLocaleString("en-IN")}`,
              })
            }
            className="rounded-xl bg-terracotta px-4 py-2 text-sm font-semibold text-white hover:bg-terracotta-dark disabled:opacity-50"
          >
            {loading === "COUNTER" ? "Sending…" : "Send counter offer"}
          </button>
        </div>
      )}
    </div>
  );
}
