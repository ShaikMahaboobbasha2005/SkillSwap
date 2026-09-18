import React from "react";

/**
 * UnreadDivider Component
 *
 * Renders a subtle, centered WhatsApp-style unread messages boundary divider
 * immediately before the first unread incoming message in a chat thread.
 *
 * @param {Object} props
 * @param {number} props.count - Number of unread incoming messages when conversation opened
 */
export default function UnreadDivider({ count }) {
  if (!count || count < 1) return null;

  const label = `${count} ${count === 1 ? "unread message" : "unread messages"}`;

  return (
    <div
      role="separator"
      aria-label={label}
      className="w-full flex items-center justify-center my-3 text-center select-none"
    >
      <div className="flex-1 h-px bg-[#E6E3DA] dark:bg-[#2A2E29]" />
      <span className="px-3 py-1 text-[11px] font-bold text-[#1B4332] dark:text-[#3FA873] bg-[#E4EEE8] dark:bg-[#1C2E24] border border-[#1B4332]/20 dark:border-[#3FA873]/30 rounded-full shadow-2xs shrink-0 tracking-tight">
        {label}
      </span>
      <div className="flex-1 h-px bg-[#E6E3DA] dark:bg-[#2A2E29]" />
    </div>
  );
}
