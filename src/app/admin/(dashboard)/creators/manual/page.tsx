"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { CreatorForm, emptyForm } from "@/components/admin/CreatorForm";

export default function ManualCreatorPage() {
  const router = useRouter();

  return (
    <div>
      <Link
        href="/admin/creators/new"
        className="mb-4 inline-block text-sm text-terracotta hover:underline"
      >
        ← Back to Instagram import
      </Link>
      <h2 className="mb-6 text-2xl font-bold text-warm-brown">Manual creator entry</h2>
      <div className="rounded-2xl border border-cream-dark bg-white p-6 shadow-sm sm:p-8">
        <CreatorForm
          initial={emptyForm()}
          submitLabel="Save to database"
          onSubmit={async (data) => {
            const res = await fetch("/api/creators", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            });
            if (!res.ok) {
              const err = await res.json();
              throw new Error(err.error ?? "Failed to save");
            }
            router.push("/admin");
            router.refresh();
          }}
        />
      </div>
    </div>
  );
}
