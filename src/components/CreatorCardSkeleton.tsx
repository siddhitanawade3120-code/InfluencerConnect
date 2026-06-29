export function CreatorCardSkeleton() {
  return (
    <article className="card flex flex-col overflow-hidden !p-0 animate-pulse">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 shrink-0 rounded-full bg-cream-dark" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-32 rounded-lg bg-cream-dark" />
            <div className="h-3 w-24 rounded-lg bg-cream-dark/80" />
          </div>
        </div>
        <div className="mt-4 flex gap-4">
          <div className="h-4 w-20 rounded bg-cream-dark" />
          <div className="h-4 w-16 rounded bg-cream-dark" />
        </div>
        <div className="mt-3 flex gap-2">
          <div className="h-5 w-14 rounded-full bg-cream-dark" />
          <div className="h-5 w-16 rounded-full bg-cream-dark" />
        </div>
        <div className="mt-4 h-6 w-28 rounded bg-cream-dark" />
      </div>
      <div className="mt-auto space-y-2 border-t border-cream-dark p-4">
        <div className="h-10 rounded-xl bg-cream-dark" />
        <div className="h-10 rounded-xl bg-cream-dark/70" />
      </div>
    </article>
  );
}

export function CreatorGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CreatorCardSkeleton key={i} />
      ))}
    </div>
  );
}
