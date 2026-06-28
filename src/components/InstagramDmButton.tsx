import { MessageCircle } from "lucide-react";
import { instagramDmUrl } from "@/lib/instagram-links";

interface InstagramDmButtonProps {
  handle: string;
  className?: string;
  compact?: boolean;
}

export function InstagramDmButton({ handle, className = "", compact = false }: InstagramDmButtonProps) {
  return (
    <a
      href={instagramDmUrl(handle)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-sm font-semibold text-white transition-opacity hover:opacity-90 ${compact ? "px-3 py-2" : "px-4 py-2.5"} ${className}`}
    >
      <MessageCircle className="h-4 w-4" />
      {compact ? "DM" : "Message on Instagram"}
    </a>
  );
}
