"use client";

import { useState, useMemo } from "react";
import { CreatorAvatar } from "@/components/CreatorAvatar";
import Link from "next/link";
import {
  MessageSquare,
  Copy,
  Send,
  Trash2,
  ArrowLeft,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { useApp } from "@/lib/context";
import { useCreators } from "@/lib/use-creators";
import {
  formatRate,
  formatFollowers,
  generateOutreachMessage,
  type Creator,
  type OutreachStatus,
} from "@/lib/types";
import { SignupModal } from "@/components/SignupModal";
import { InstagramDmButton } from "@/components/InstagramDmButton";

const STATUS_OPTIONS: { value: OutreachStatus; label: string; color: string }[] = [
  { value: "not_sent", label: "Not sent", color: "bg-cream-dark text-warm-gray" },
  { value: "sent", label: "Sent", color: "bg-terracotta-light/40 text-terracotta-dark" },
  { value: "replied", label: "Replied", color: "bg-sage-light/50 text-sage-dark" },
  { value: "confirmed", label: "Confirmed", color: "bg-sage text-white" },
];

export default function ShortlistPage() {
  const {
    shortlist,
    removeFromShortlist,
    updateShortlistStatus,
    isSignedUp,
    businessName,
  } = useApp();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showSignup, setShowSignup] = useState(false);
  const [messageModal, setMessageModal] = useState<{
    creatorId: string;
    message: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const { creators, loading } = useCreators({ activeOnly: false });

  const creatorMap = useMemo(
    () => new Map(creators.map((c) => [c.id, c])),
    [creators]
  );

  const items = useMemo(
    () =>
      shortlist
        .map((s) => ({
          ...s,
          creator: creatorMap.get(s.creatorId),
        }))
        .filter((item): item is typeof item & { creator: Creator } => !!item.creator)
        .sort((a, b) => b.addedAt - a.addedAt),
    [shortlist, creatorMap]
  );

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map((i) => i.creatorId)));
    }
  };

  const openMessageModal = (creatorId?: string) => {
    if (!isSignedUp) {
      setShowSignup(true);
      return;
    }
    const ids = creatorId ? [creatorId] : Array.from(selected);
    if (ids.length === 0) return;
    const creator = creatorMap.get(ids[0]);
    if (!creator) return;
    setMessageModal({
      creatorId: creator.id,
      message: generateOutreachMessage(creator, businessName),
    });
  };

  const copyAllMessages = async () => {
    if (!isSignedUp) {
      setShowSignup(true);
      return;
    }
    const ids = selected.size > 0 ? Array.from(selected) : items.map((i) => i.creatorId);
    const messages = ids
      .map((id) => {
        const c = creatorMap.get(id);
        return c
          ? `--- @${c.instagramHandle} ---\n${generateOutreachMessage(c, businessName)}`
          : "";
      })
      .filter(Boolean)
      .join("\n\n");
    await navigator.clipboard.writeText(messages);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const markSelectedAsSent = () => {
    const ids = selected.size > 0 ? Array.from(selected) : items.map((i) => i.creatorId);
    ids.forEach((id) => updateShortlistStatus(id, "sent"));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-warm-gray">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  if (shortlist.length === 0 || items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-warm-brown">Your shortlist is empty</h1>
        <p className="mt-3 text-warm-gray">
          Browse creators and add them to your shortlist to start outreach.
        </p>
        <Link
          href="/results"
          className="mt-6 inline-block rounded-xl bg-terracotta px-6 py-3 font-semibold text-white hover:bg-terracotta-dark"
        >
          Browse creators
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <Link
        href="/results"
        className="mb-4 inline-flex items-center gap-1 text-sm text-warm-gray hover:text-terracotta"
      >
        <ArrowLeft className="h-4 w-4" /> Back to results
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-warm-brown">Shortlist & Outreach</h1>
          <p className="text-sm text-warm-gray">
            {items.length} creator{items.length !== 1 ? "s" : ""} · Track your collab pipeline
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => openMessageModal()}
            disabled={selected.size === 0 && items.length === 0}
            className="flex items-center gap-2 rounded-xl bg-terracotta px-4 py-2.5 text-sm font-semibold text-white hover:bg-terracotta-dark disabled:opacity-50"
          >
            <MessageSquare className="h-4 w-4" />
            Generate Outreach Message
          </button>
          <button
            type="button"
            onClick={copyAllMessages}
            className="flex items-center gap-2 rounded-xl border border-cream-dark bg-white px-4 py-2.5 text-sm font-semibold text-warm-brown hover:bg-cream"
          >
            <Copy className="h-4 w-4" />
            {copied ? "Copied!" : "Copy All"}
          </button>
          <button
            type="button"
            onClick={markSelectedAsSent}
            className="flex items-center gap-2 rounded-xl border border-sage bg-sage-light/30 px-4 py-2.5 text-sm font-semibold text-sage-dark hover:bg-sage-light/50"
          >
            <Send className="h-4 w-4" />
            Mark as Sent
          </button>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-cream-dark bg-white shadow-sm md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-cream-dark bg-cream">
            <tr>
              <th className="p-4">
                <input
                  type="checkbox"
                  checked={selected.size === items.length && items.length > 0}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded accent-terracotta"
                />
              </th>
              <th className="p-4 font-semibold text-warm-brown">Creator</th>
              <th className="p-4 font-semibold text-warm-brown">Followers</th>
              <th className="p-4 font-semibold text-warm-brown">Rate</th>
              <th className="p-4 font-semibold text-warm-brown">Status</th>
              <th className="p-4 font-semibold text-warm-brown">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(({ creatorId, creator, status }) => (
              <tr key={creatorId} className="border-b border-cream-dark last:border-0">
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selected.has(creatorId)}
                    onChange={() => toggleSelect(creatorId)}
                    className="h-4 w-4 rounded accent-terracotta"
                  />
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-full">
                      <CreatorAvatar
                        src={creator.profilePicUrl}
                        alt={creator.fullName}
                        handle={creator.instagramHandle}
                        fill
                      />
                    </div>
                    <div>
                      <p className="font-semibold">@{creator.instagramHandle}</p>
                      <p className="text-xs text-warm-gray">{creator.area}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  {formatFollowers(creator.followerCount)}
                  <span className="ml-1 text-warm-gray">· {creator.avgEngagementRate}%</span>
                </td>
                <td className="p-4 font-medium text-terracotta">
                  {formatRate(creator.estimatedRateMin, creator.estimatedRateMax)}
                </td>
                <td className="p-4">
                  <div className="relative inline-block">
                    <select
                      value={status}
                      onChange={(e) =>
                        updateShortlistStatus(creatorId, e.target.value as OutreachStatus)
                      }
                      className={`appearance-none rounded-full py-1 pl-3 pr-8 text-xs font-semibold ${
                        STATUS_OPTIONS.find((s) => s.value === status)?.color
                      }`}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2" />
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openMessageModal(creatorId)}
                      className="rounded-lg bg-cream px-3 py-1.5 text-xs font-medium hover:bg-cream-dark"
                    >
                      Draft
                    </button>
                    <InstagramDmButton handle={creator.instagramHandle} compact className="!py-1.5 !text-xs" />
                    <button
                      type="button"
                      onClick={() => removeFromShortlist(creatorId)}
                      className="rounded-lg p-1.5 text-warm-gray hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-4 md:hidden">
        {items.map(({ creatorId, creator, status }) => (
          <div
            key={creatorId}
            className="rounded-2xl border border-cream-dark bg-white p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selected.has(creatorId)}
                onChange={() => toggleSelect(creatorId)}
                className="mt-1 h-4 w-4 rounded accent-terracotta"
              />
              <div className="relative h-12 w-12 overflow-hidden rounded-full">
                <CreatorAvatar
                  src={creator.profilePicUrl}
                  alt={creator.fullName}
                  handle={creator.instagramHandle}
                  fill
                />
              </div>
              <div className="flex-1">
                <p className="font-semibold">@{creator.instagramHandle}</p>
                <p className="text-sm text-terracotta">
                  {formatRate(creator.estimatedRateMin, creator.estimatedRateMax)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeFromShortlist(creatorId)}
                className="text-warm-gray hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <select
                value={status}
                onChange={(e) =>
                  updateShortlistStatus(creatorId, e.target.value as OutreachStatus)
                }
                className={`min-w-0 flex-1 rounded-xl py-2 text-xs font-semibold ${
                  STATUS_OPTIONS.find((s) => s.value === status)?.color
                }`}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => openMessageModal(creatorId)}
                className="rounded-xl bg-cream px-3 py-2 text-xs font-semibold text-warm-brown"
              >
                Draft
              </button>
              <InstagramDmButton handle={creator.instagramHandle} compact />
            </div>
          </div>
        ))}
      </div>

      {/* Message modal */}
      {messageModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          onClick={() => setMessageModal(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-warm-brown">
              Outreach message
            </h2>
            <p className="mt-1 text-sm text-warm-gray">
              Edit and copy to send via Instagram DM or WhatsApp
            </p>
            <textarea
              value={messageModal.message}
              onChange={(e) =>
                setMessageModal({ ...messageModal, message: e.target.value })
              }
              rows={14}
              className="mt-4 w-full rounded-xl border border-cream-dark p-4 text-sm leading-relaxed focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
            />
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(messageModal.message);
                  updateShortlistStatus(messageModal.creatorId, "sent");
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-terracotta py-3 font-semibold text-white"
              >
                <Copy className="h-4 w-4" />
                Copy message
              </button>
              {(() => {
                const c = creatorMap.get(messageModal.creatorId);
                return c ? (
                  <InstagramDmButton handle={c.instagramHandle} className="flex-1" />
                ) : null;
              })()}
              <button
                type="button"
                onClick={() => setMessageModal(null)}
                className="rounded-xl border border-cream-dark px-6 py-3 font-medium sm:shrink-0"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <SignupModal open={showSignup} onClose={() => setShowSignup(false)} />
    </div>
  );
}
