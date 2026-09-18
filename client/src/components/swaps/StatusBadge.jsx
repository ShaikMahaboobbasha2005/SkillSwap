import { Clock, CheckCircle2, XCircle, Ban, LogOut, Award } from "lucide-react";

/**
 * StatusBadge Component
 *
 * Displays a styled status badge per Design.md rules (subtle borders, muted palette, flat design).
 *
 * @param {Object} props
 * @param {string} props.status - "pending" | "accepted" | "rejected" | "cancelled" | "completed" | "left"
 * @param {string} [props.className] - Additional Tailwind classes
 */
export default function StatusBadge({ status = "pending", className = "" }) {
  const normalizedStatus = status ? status.toLowerCase() : "pending";

  switch (normalizedStatus) {
    case "completed":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/50 tracking-wide ${className}`}
        >
          <Award className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
          <span>Completed</span>
        </span>
      );

    case "left":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-zinc-100 dark:bg-[#202520] text-zinc-700 dark:text-[#9C9A8C] border border-zinc-300 dark:border-[#2A2E29] tracking-wide ${className}`}
        >
          <LogOut className="w-3.5 h-3.5 text-zinc-600 dark:text-[#767468]" />
          <span>Left</span>
        </span>
      );

    case "accepted":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-[#E4EEE8] dark:bg-[#1C2E24] text-[#1B4332] dark:text-[#3FA873] border border-[#1B4332]/20 dark:border-[#3FA873]/30 tracking-wide ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4332] dark:text-[#3FA873]" />
          <span>Accepted</span>
        </span>
      );

    case "rejected":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/40 tracking-wide ${className}`}
        >
          <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
          <span>Rejected</span>
        </span>
      );

    case "cancelled":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-[#F7F6F2] dark:bg-[#202520] text-[#6B6858] dark:text-[#9C9A8C] border border-[#E6E3DA] dark:border-[#2A2E29] tracking-wide ${className}`}
        >
          <Ban className="w-3.5 h-3.5 text-[#6B6858] dark:text-[#9C9A8C]" />
          <span>Cancelled</span>
        </span>
      );

    case "pending":
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 tracking-wide ${className}`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 animate-pulse" />
          <span>Pending</span>
        </span>
      );
  }
}
