"use client";

import { QuickAddCreator } from "@/components/admin/QuickAddCreator";

export default function NewCreatorPage() {
  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold text-warm-brown">Add creator from Instagram</h2>
      <p className="mb-6 text-sm text-warm-gray">
        Just enter the username — profile details are fetched automatically and appear on the main search page.
      </p>
      <div className="rounded-2xl border border-cream-dark bg-white p-6 shadow-sm sm:p-8">
        <QuickAddCreator />
      </div>
    </div>
  );
}
