"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { EnrichedInquiry, InquiryRecord, InquiryStatus } from "@/lib/inquiry-types";
import { TERMINAL_STATUSES } from "@/lib/inquiry-types";

interface InquiryActionsProps {
  inquiry: EnrichedInquiry;
  role: "BRAND" | "CREATOR";
  onUpdated: (patch: InquiryRecord) => void;
}

const inputClass =
  "w-full rounded-xl border border-cream-dark px-3 py-2 text-sm focus:border-terracotta focus:outline-none";

const ACTION_LABELS: Record<string, string> = {
  ACCEPT: "Accepting…",
  DECLINE: "Declining…",
  CONFIRM: "Confirming…",
  MARK_DELIVERED: "Updating…",
  MARK_COMPLETED: "Completing…",
  CANCEL: "Cancelling…",
  COUNTER: "Sending counter…",
};

function ActionSpinner({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      {label}
    </span>
  );
}

export function InquiryActions({ inquiry, role, onUpdated }: InquiryActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showCounter, setShowCounter] = useState(false);
  const [counterBudget, setCounterBudget] = useState(inquiry.offeredBudget);
  const [counterNote, setCounterNote] = useState("");

  const status = inquiry.status as InquiryStatus;
  const terminal = TERMINAL_STATUSES.includes(status);
  const busy = !!loading;

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
      onUpdated(data as InquiryRecord);
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
    <div className="relative space-y-3">
      {busy && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/70 backdrop-blur-[1px]"
          aria-live="polite"
          aria-busy="true"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-warm-brown shadow-sm ring-1 ring-cream-dark">
            <Loader2 className="h-4 w-4 animate-spin text-terracotta" />
            {ACTION_LABELS[loading!] ?? "Updating deal…"}
          </span>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {role === "CREATOR" && (status === "PENDING" || status === "NEGOTIATING") && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => runAction("ACCEPT")}
            className="rounded-xl bg-sage px-4 py-2 text-sm font-semibold text-white hover:bg-sage-dark disabled:opacity-50"
          >
            {loading === "ACCEPT" ? <ActionSpinner label="Accepting…" /> : "Accept deal"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => runAction("DECLINE")}
            className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            {loading === "DECLINE" ? <ActionSpinner label="Declining…" /> : "Decline"}
          </button>
          <button
            type="button"
            disabled={busy}
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
            disabled={busy}
            onClick={() => runAction("CONFIRM")}
            className="rounded-xl bg-sage px-4 py-2 text-sm font-semibold text-white hover:bg-sage-dark disabled:opacity-50"
          >
            {loading === "CONFIRM" ? <ActionSpinner label="Confirming…" /> : "Confirm terms"}
          </button>
          <button
            type="button"
            disabled={busy}
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
          disabled={busy}
          onClick={() => runAction("MARK_DELIVERED")}
          className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {loading === "MARK_DELIVERED" ? (
            <ActionSpinner label="Updating…" />
          ) : (
            "Mark as delivered"
          )}
        </button>
      )}

      {role === "BRAND" && status === "DELIVERED" && (
        <button
          type="button"
          disabled={busy}
          onClick={() => runAction("MARK_COMPLETED")}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading === "MARK_COMPLETED" ? (
            <ActionSpinner label="Completing…" />
          ) : (
            "Mark as completed"
          )}
        </button>
      )}

      {role === "BRAND" &&
        (status === "PENDING" || status === "NEGOTIATING" || status === "CONFIRMED") && (
          <button
            type="button"
            disabled={busy}
            onClick={() => runAction("CANCEL")}
            className="rounded-xl border border-cream-dark px-4 py-2 text-sm font-medium text-warm-gray hover:bg-cream disabled:opacity-50"
          >
            {loading === "CANCEL" ? <ActionSpinner label="Cancelling…" /> : "Cancel deal"}
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
              disabled={busy}
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
              disabled={busy}
              className={inputClass}
              value={counterNote}
              onChange={(e) => setCounterNote(e.target.value)}
              placeholder="Explain your counter offer…"
            />
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              runAction("COUNTER", {
                offeredBudget: counterBudget,
                note: counterNote || `Counter offer: ₹${counterBudget.toLocaleString("en-IN")}`,
              })
            }
            className="rounded-xl bg-terracotta px-4 py-2 text-sm font-semibold text-white hover:bg-terracotta-dark disabled:opacity-50"
          >
            {loading === "COUNTER" ? (
              <ActionSpinner label="Sending counter…" />
            ) : (
              "Send counter offer"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
