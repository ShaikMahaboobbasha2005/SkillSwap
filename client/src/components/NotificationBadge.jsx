/**
 * NotificationBadge Component
 *
 * Reusable notification badge displaying numeric unread/pending counts.
 * Designed for future compatibility (Phase 8 Notifications module).
 *
 * @param {Object} props
 * @param {number} props.count - Numeric badge count (renders nothing if <= 0)
 * @param {"inline" | "floating"} [props.variant="inline"] - "inline" for nav text links, "floating" for avatar badges
 * @param {string} [props.className] - Additional custom styles
 */
export default function NotificationBadge({
  count = 0,
  variant = "inline",
  className = "",
}) {
  const numericCount = parseInt(count, 10);

  if (isNaN(numericCount) || numericCount <= 0) {
    return null;
  }

  const displayCount = numericCount > 99 ? "99+" : numericCount;

  if (variant === "floating") {
    return (
      <span
        className={`absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 text-[10px] font-black rounded-full bg-amber-400 text-amber-950 flex items-center justify-center border-2 border-white shadow-xs leading-none z-10 animate-bounce ${className}`}
        aria-label={`${displayCount} pending items`}
      >
        {displayCount}
      </span>
    );
  }

  return (
    <span
      className={`px-1.5 py-0.5 text-[10px] font-extrabold rounded-full bg-amber-400 text-amber-950 leading-none inline-flex items-center justify-center ${className}`}
      aria-label={`${displayCount} pending items`}
    >
      {displayCount}
    </span>
  );
}
