import React from "react";
import { formatDateSeparator } from "../../utils/dateUtils";

/**
 * DateSeparator Component
 *
 * Renders a clean, compact WhatsApp-style date pill centered between messages
 * to indicate calendar day boundaries ("Today", "Yesterday", "10 August 2026").
 *
 * @param {Object} props
 * @param {string|Date|number} props.date - Message timestamp (e.g. createdAt)
 */
export default function DateSeparator({ date }) {
  const label = formatDateSeparator(date);

  if (!label) return null;

  return (
    <div
      role="separator"
      aria-label={`Date: ${label}`}
      className="w-full flex items-center justify-center my-3 sm:my-4 text-center select-none"
    >
      <span className="px-3 py-0.5 sm:py-1 text-[11px] font-semibold text-[#6B6858] bg-[#E4EEE8]/70 border border-[#1B4332]/10 rounded-full shadow-2xs shrink-0 tracking-wide max-w-[90%] truncate">
        {label}
      </span>
    </div>
  );
}
