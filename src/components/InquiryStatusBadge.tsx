import type { InquiryStatus } from "@/lib/inquiry-types";
import { statusLabel } from "@/lib/inquiry-types";

const STATUS_STYLES: Record<InquiryStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  NEGOTIATING: "bg-blue-100 text-blue-800 border-blue-200",
  CONFIRMED: "bg-sage-light/50 text-sage-dark border-sage/30",
  DELIVERED: "bg-violet-100 text-violet-800 border-violet-200",
  COMPLETED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  CANCELLED: "bg-cream-dark text-warm-gray border-cream-dark",
  DECLINED: "bg-red-100 text-red-800 border-red-200",
};

interface InquiryStatusBadgeProps {
  status: InquiryStatus;
  className?: string;
}

export function InquiryStatusBadge({ status, className = "" }: InquiryStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status]} ${className}`}
    >
      {statusLabel(status)}
    </span>
  );
}
