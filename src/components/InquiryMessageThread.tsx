"use client";

import { useCallback, useEffect, useState } from "react";
import { Send } from "lucide-react";
import type { InquiryMessage } from "@/lib/inquiry-types";
import { usePolling } from "@/lib/use-polling";

interface InquiryMessageThreadProps {
  inquiryId: string;
  viewerRole: "BRAND" | "CREATOR";
  refreshToken?: string;
}

export function InquiryMessageThread({
  inquiryId,
  viewerRole,
  refreshToken,
}: InquiryMessageThreadProps) {
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const fetchMessages = useCallback(async () => {
    const res = await fetch(`/api/inquiries/${inquiryId}/messages`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to load messages");
    return data.messages as InquiryMessage[];
  }, [inquiryId]);

  const { data: messages, loading, refresh } = usePolling(fetchMessages, 10000);

  useEffect(() => {
    if (refreshToken) void refresh();
  }, [refreshToken, refresh]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;

    setSending(true);
    setSendError("");
    try {
      const res = await fetch(`/api/inquiries/${inquiryId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send");
      setBody("");
      await refresh();
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-warm-gray">
        Messages
      </h3>

      <div className="max-h-96 space-y-3 overflow-y-auto rounded-xl border border-cream-dark bg-cream/30 p-4">
        {loading && !messages ? (
          <p className="text-sm text-warm-gray">Loading messages…</p>
        ) : messages && messages.length === 0 ? (
          <p className="text-sm text-warm-gray">No messages yet.</p>
        ) : (
          messages?.map((msg) => {
            const isMine = msg.senderRole === viewerRole;
            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    isMine
                      ? "bg-terracotta text-white"
                      : "border border-cream-dark bg-white text-warm-brown"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.body}</p>
                  <p
                    className={`mt-1 text-xs ${isMine ? "text-white/70" : "text-warm-gray"}`}
                  >
                    {msg.senderRole === "BRAND" ? "Brand" : "Creator"} ·{" "}
                    {new Date(msg.createdAt).toLocaleString("en-IN", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSend} className="mt-4 flex gap-2">
        <input
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type a message…"
          className="min-w-0 flex-1 rounded-xl border border-cream-dark px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none"
        />
        <button
          type="submit"
          disabled={sending || !body.trim()}
          className="flex shrink-0 items-center gap-1 rounded-xl bg-terracotta px-4 py-2.5 text-sm font-semibold text-white hover:bg-terracotta-dark disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {sending ? "…" : "Send"}
        </button>
      </form>
      {sendError && <p className="mt-2 text-sm text-red-600">{sendError}</p>}
    </div>
  );
}
