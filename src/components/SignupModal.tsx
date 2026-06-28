"use client";

import { X } from "lucide-react";
import { useApp } from "@/lib/context";
import { useState } from "react";

interface SignupModalProps {
  open: boolean;
  onClose: () => void;
}

export function SignupModal({ open, onClose }: SignupModalProps) {
  const { setSignedUp, setBusinessName } = useApp();
  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [phone, setPhone] = useState("");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (business.trim()) setBusinessName(business.trim());
    setSignedUp(true);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-warm-brown">
            Unlock contact details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-warm-gray hover:bg-cream"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-6 text-sm text-warm-gray">
          Quick signup to view creator profiles, contact info, and send outreach
          messages. No credit card needed.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Your name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rajesh Kumar"
              className="w-full rounded-xl border border-cream-dark px-4 py-2.5 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Business name
            </label>
            <input
              type="text"
              required
              value={business}
              onChange={(e) => setBusiness(e.target.value)}
              placeholder="Spice Box Cloud Kitchen"
              className="w-full rounded-xl border border-cream-dark px-4 py-2.5 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Phone / WhatsApp</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full rounded-xl border border-cream-dark px-4 py-2.5 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-terracotta py-3 font-semibold text-white hover:bg-terracotta-dark"
          >
            Continue — it&apos;s free
          </button>
        </form>
      </div>
    </div>
  );
}
