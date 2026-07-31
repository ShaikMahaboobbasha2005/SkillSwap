import { Clock, CheckCircle2, XCircle, Ban } from "lucide-react";

/**
 * StatusBadge Component
 *
 * Displays a styled, status badge per Design.md rules (subtle borders, muted palette, flat design).
 *
 * @param {Object} props
 * @param {string} props.status - "pending" | "accepted" | "rejected" | "cancelled"
 * @param {string} [props.className] - Additional Tailwind classes
 */
export default function StatusBadge({ status = "pending", className = "" }) {
  const normalizedStatus = status ? status.toLowerCase() : "pending";

  switch (normalizedStatus) {
    case "accepted":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-[#E4EEE8] text-[#1B4332] border border-[#1B4332]/20 tracking-wide ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4332]" />
          <span>Accepted</span>
        </span>
      );

    case "rejected":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-red-50 text-red-700 border border-red-200 tracking-wide ${className}`}
        >
          <XCircle className="w-3.5 h-3.5 text-red-600" />
          <span>Rejected</span>
        </span>
      );

    case "cancelled":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-[#F7F6F2] text-[#6B6858] border border-[#E6E3DA] tracking-wide ${className}`}
        >
          <Ban className="w-3.5 h-3.5 text-[#6B6858]" />
          <span>Cancelled</span>
        </span>
      );

    case "pending":
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-900 border border-amber-200 tracking-wide ${className}`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
          <span>Pending</span>
        </span>
      );
  }
}
