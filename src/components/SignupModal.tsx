"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface SignupModalProps {
  open: boolean;
  onClose: () => void;
}

export function SignupModal({ open, onClose }: SignupModalProps) {
  const router = useRouter();

  if (!open) return null;

  const go = (path: string) => {
    onClose();
    router.push(path);
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
          Create a free account to view creator profiles, contact info, and send outreach
          messages. No credit card needed.
        </p>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => go("/signup")}
            className="w-full rounded-xl bg-terracotta py-3 font-semibold text-white hover:bg-terracotta-dark"
          >
            Create free account
          </button>
          <button
            type="button"
            onClick={() => go("/signup/brand")}
            className="w-full rounded-xl border border-cream-dark py-3 font-semibold text-warm-brown hover:bg-cream"
          >
            I&apos;m a Brand — sign up
          </button>
          <button
            type="button"
            onClick={() => go("/signup/creator")}
            className="w-full rounded-xl border border-cream-dark py-3 font-semibold text-warm-brown hover:bg-cream"
          >
            I&apos;m a Creator — sign up
          </button>
          <p className="text-center text-sm text-warm-gray">
            Already have an account?{" "}
            <Link
              href="/login"
              onClick={onClose}
              className="font-medium text-terracotta hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
