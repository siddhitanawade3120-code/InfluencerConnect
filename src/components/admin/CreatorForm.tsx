"use client";

import { useState } from "react";
import type { Creator } from "@/lib/types";
import {
  NICHES,
  CITIES,
  AREAS,
  CONTACT_METHODS,
  ACCOUNT_TYPES,
  CONTENT_STYLES,
  LANGUAGES,
} from "@/lib/types";

export type CreatorFormData = {
  instagramHandle: string;
  fullName: string;
  city: string;
  area: string;
  nicheTags: string[];
  followerCount: string;
  avgEngagementRate: string;
  estimatedRateMin: string;
  estimatedRateMax: string;
  contactMethod: string;
  contactValue: string;
  lastVerifiedDate: string;
  profilePicUrl: string;
  accountType: string;
  isVerifiedActive: boolean;
  recentPostCountChecked: string;
  avgLikes: string;
  avgComments: string;
  contentStyle: string;
  previousBrandCollabs: string;
  language: string[];
  sourceFound: string;
  notes: string;
};

export const emptyForm = (): CreatorFormData => ({
  instagramHandle: "",
  fullName: "",
  city: "Mumbai",
  area: "Vasai-Virar",
  nicheTags: [],
  followerCount: "",
  avgEngagementRate: "",
  estimatedRateMin: "",
  estimatedRateMax: "",
  contactMethod: "dm_only",
  contactValue: "DM only",
  lastVerifiedDate: new Date().toISOString().split("T")[0],
  profilePicUrl: "",
  accountType: "Personal",
  isVerifiedActive: true,
  recentPostCountChecked: "6",
  avgLikes: "",
  avgComments: "",
  contentStyle: "",
  previousBrandCollabs: "",
  language: [],
  sourceFound: "",
  notes: "",
});

export function creatorToForm(c: Creator): CreatorFormData {
  return {
    instagramHandle: c.instagramHandle,
    fullName: c.fullName,
    city: c.city,
    area: c.area,
    nicheTags: c.nicheTags,
    followerCount: String(c.followerCount),
    avgEngagementRate: String(c.avgEngagementRate),
    estimatedRateMin: String(c.estimatedRateMin),
    estimatedRateMax: String(c.estimatedRateMax),
    contactMethod: c.contactMethod,
    contactValue: c.contactValue,
    lastVerifiedDate: c.lastVerifiedDate,
    profilePicUrl: c.profilePicUrl,
    accountType: c.accountType,
    isVerifiedActive: c.isVerifiedActive,
    recentPostCountChecked: c.recentPostCountChecked
      ? String(c.recentPostCountChecked)
      : "",
    avgLikes: c.avgLikes ? String(c.avgLikes) : "",
    avgComments: c.avgComments ? String(c.avgComments) : "",
    contentStyle: c.contentStyle ?? "",
    previousBrandCollabs: c.previousBrandCollabs ?? "",
    language: c.language ?? [],
    sourceFound: c.sourceFound ?? "",
    notes: c.notes ?? "",
  };
}

export function formToPayload(form: CreatorFormData) {
  return {
    instagramHandle: form.instagramHandle,
    fullName: form.fullName,
    city: form.city,
    area: form.area,
    nicheTags: form.nicheTags,
    followerCount: parseInt(form.followerCount, 10),
    avgEngagementRate: parseFloat(form.avgEngagementRate),
    estimatedRateMin: parseInt(form.estimatedRateMin, 10),
    estimatedRateMax: parseInt(form.estimatedRateMax, 10),
    contactMethod: form.contactMethod,
    contactValue: form.contactValue,
    lastVerifiedDate: form.lastVerifiedDate,
    profilePicUrl: form.profilePicUrl,
    accountType: form.accountType,
    isVerifiedActive: form.isVerifiedActive,
    recentPostCountChecked: form.recentPostCountChecked
      ? parseInt(form.recentPostCountChecked, 10)
      : null,
    avgLikes: form.avgLikes ? parseInt(form.avgLikes, 10) : null,
    avgComments: form.avgComments ? parseInt(form.avgComments, 10) : null,
    contentStyle: form.contentStyle || null,
    previousBrandCollabs: form.previousBrandCollabs || null,
    language: form.language,
    sourceFound: form.sourceFound || null,
    notes: form.notes || null,
  };
}

interface CreatorFormProps {
  initial: CreatorFormData;
  onSubmit: (data: ReturnType<typeof formToPayload>) => Promise<void>;
  submitLabel: string;
}

export function CreatorForm({ initial, onSubmit, submitLabel }: CreatorFormProps) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof CreatorFormData>(key: K, value: CreatorFormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleNiche = (niche: string) => {
    set(
      "nicheTags",
      form.nicheTags.includes(niche)
        ? form.nicheTags.filter((n) => n !== niche)
        : [...form.nicheTags, niche]
    );
  };

  const toggleLanguage = (lang: string) => {
    set(
      "language",
      form.language.includes(lang)
        ? form.language.filter((l) => l !== lang)
        : [...form.language, lang]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSubmit(formToPayload(form));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-cream-dark bg-white px-3 py-2 text-sm focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20";
  const labelClass = "mb-1 block text-xs font-semibold uppercase tracking-wide text-warm-gray";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Must-have */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-warm-brown">
          Must-have fields <span className="text-sm font-normal text-terracotta">(MVP-critical)</span>
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Instagram handle *</label>
            <input
              required
              className={inputClass}
              placeholder="vasaifoodie_raj"
              value={form.instagramHandle}
              onChange={(e) => set("instagramHandle", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Full name *</label>
            <input
              required
              className={inputClass}
              placeholder="Raj Patil"
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>City *</label>
            <select
              className={inputClass}
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Area *</label>
            <select
              className={inputClass}
              value={form.area}
              onChange={(e) => set("area", e.target.value)}
            >
              {(AREAS[form.city] ?? []).map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Niche tags *</label>
            <div className="flex flex-wrap gap-2">
              {NICHES.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => toggleNiche(n)}
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    form.nicheTags.includes(n)
                      ? "bg-sage text-white"
                      : "bg-cream-dark text-warm-gray"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>Follower count *</label>
            <input
              required
              type="number"
              className={inputClass}
              placeholder="8400"
              value={form.followerCount}
              onChange={(e) => set("followerCount", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Avg engagement rate (%) *</label>
            <input
              required
              type="number"
              step="0.1"
              className={inputClass}
              placeholder="4.2"
              value={form.avgEngagementRate}
              onChange={(e) => set("avgEngagementRate", e.target.value)}
            />
            <p className="mt-1 text-xs text-warm-gray">
              (avg likes + comments) / followers × 100 over last 6 posts
            </p>
          </div>
          <div>
            <label className={labelClass}>Rate min (₹/post) *</label>
            <input
              required
              type="number"
              className={inputClass}
              placeholder="800"
              value={form.estimatedRateMin}
              onChange={(e) => set("estimatedRateMin", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Rate max (₹/post) *</label>
            <input
              required
              type="number"
              className={inputClass}
              placeholder="1500"
              value={form.estimatedRateMax}
              onChange={(e) => set("estimatedRateMax", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Contact method *</label>
            <select
              className={inputClass}
              value={form.contactMethod}
              onChange={(e) => {
                set("contactMethod", e.target.value);
                if (e.target.value === "dm_only") set("contactValue", "DM only");
              }}
            >
              {CONTACT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Contact value *</label>
            <input
              required
              className={inputClass}
              placeholder="raj@email.com or DM only"
              value={form.contactValue}
              onChange={(e) => set("contactValue", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Last verified date *</label>
            <input
              required
              type="date"
              className={inputClass}
              value={form.lastVerifiedDate}
              onChange={(e) => set("lastVerifiedDate", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Account type *</label>
            <select
              className={inputClass}
              value={form.accountType}
              onChange={(e) => set("accountType", e.target.value)}
            >
              {ACCOUNT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Profile pic URL *</label>
            <input
              required
              type="url"
              className={inputClass}
              placeholder="https://..."
              value={form.profilePicUrl}
              onChange={(e) => set("profilePicUrl", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={form.isVerifiedActive}
                onChange={(e) => set("isVerifiedActive", e.target.checked)}
                className="h-4 w-4 rounded accent-terracotta"
              />
              <span className="text-sm font-medium text-warm-brown">
                Verified active (show in public search)
              </span>
            </label>
          </div>
        </div>
      </section>

      {/* Good-to-have */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-warm-brown">
          Good-to-have <span className="text-sm font-normal text-warm-gray">(quality signals)</span>
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Posts checked for engagement</label>
            <input
              type="number"
              className={inputClass}
              placeholder="6"
              value={form.recentPostCountChecked}
              onChange={(e) => set("recentPostCountChecked", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Content style</label>
            <select
              className={inputClass}
              value={form.contentStyle}
              onChange={(e) => set("contentStyle", e.target.value)}
            >
              <option value="">— Select —</option>
              {CONTENT_STYLES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Avg likes</label>
            <input
              type="number"
              className={inputClass}
              placeholder="320"
              value={form.avgLikes}
              onChange={(e) => set("avgLikes", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Avg comments</label>
            <input
              type="number"
              className={inputClass}
              placeholder="18"
              value={form.avgComments}
              onChange={(e) => set("avgComments", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Previous brand collabs</label>
            <input
              className={inputClass}
              placeholder="Worked with XYZ Bakery"
              value={form.previousBrandCollabs}
              onChange={(e) => set("previousBrandCollabs", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Language</label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    form.language.includes(lang)
                      ? "bg-terracotta text-white"
                      : "bg-cream-dark text-warm-gray"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>Source found (internal)</label>
            <input
              className={inputClass}
              placeholder="Hashtag #vasaifood"
              value={form.sourceFound}
              onChange={(e) => set("sourceFound", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Internal notes</label>
            <textarea
              rows={3}
              className={inputClass}
              placeholder="Responsive, posted within 2 days for prior brand"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>
        </div>
      </section>

      <button
        type="submit"
        disabled={saving || form.nicheTags.length === 0}
        className="w-full rounded-2xl bg-terracotta py-4 text-lg font-bold text-white hover:bg-terracotta-dark disabled:opacity-50 sm:w-auto sm:px-12"
      >
        {saving ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
