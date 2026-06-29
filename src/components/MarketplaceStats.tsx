"use client";

import { useEffect, useState } from "react";
import { Users, Building2, Handshake, Loader2 } from "lucide-react";

interface Stats {
  registeredCreators: number;
  brands: number;
  activeDeals: number;
}

export function MarketplaceStats({ compact = false }: { compact?: boolean }) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => setStats({ registeredCreators: 0, brands: 0, activeDeals: 0 }));
  }, []);

  const items = [
    {
      icon: Users,
      value: stats?.registeredCreators ?? "—",
      label: "Creators registered",
      color: "text-sage-dark",
      bg: "bg-sage-light/30",
    },
    {
      icon: Building2,
      value: stats?.brands ?? "—",
      label: "Local businesses",
      color: "text-terracotta",
      bg: "bg-terracotta/10",
    },
    {
      icon: Handshake,
      value: stats?.activeDeals ?? "—",
      label: "Active deals",
      color: "text-warm-brown",
      bg: "bg-cream-dark",
    },
  ];

  if (compact) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-6 text-center">
        {!stats ? (
          <Loader2 className="h-5 w-5 animate-spin text-terracotta" />
        ) : (
          items.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-terracotta" />
              <span className="font-bold text-warm-brown">{value}</span>
              <span className="text-sm text-warm-gray">{label}</span>
            </div>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map(({ icon: Icon, value, label, color, bg }) => (
        <div
          key={label}
          className="flex items-center gap-4 rounded-2xl border border-cream-dark bg-white px-5 py-4 shadow-sm"
        >
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${bg}`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
          <div>
            {!stats ? (
              <Loader2 className="h-5 w-5 animate-spin text-terracotta" />
            ) : (
              <p className="text-2xl font-bold text-warm-brown">{value}</p>
            )}
            <p className="text-xs font-medium text-warm-gray">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
