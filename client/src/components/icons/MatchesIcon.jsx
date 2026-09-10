/**
 * MatchesIcon
 *
 * Icon representing matched users and skill compatibility
 * Standardized to 24x24 grid with Lucide-compatible stroke styling for visual parity
 *
 * @param {Object} props
 * @param {number|string} [props.size] - Width and height in px or css string
 * @param {string} [props.className="w-5 h-5"] - Tailwind CSS class overrides
 * @param {number} [props.strokeWidth=2] - Stroke width (overridable via Tailwind stroke-[...])
 */
export function MatchesIcon({
  size,
  className = "w-5 h-5",
  strokeWidth = 2,
  ...props
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* User 1 (top-left) */}
      <circle cx="7" cy="5.5" r="2" />
      <path d="M3.5 12.5a3.5 3.5 0 0 1 7 0" />

      {/* User 2 (bottom-right) */}
      <circle cx="17" cy="14.5" r="2" />
      <path d="M13.5 21.5a3.5 3.5 0 0 1 7 0" />

      {/* Reciprocal circular connection orbit - Upper-Right */}
      <path d="M12 4.5a8 8 0 0 1 8 8" />
      <polyline points="17.5 10 20 12.5 22 10" />

      {/* Reciprocal circular connection orbit - Lower-Left */}
      <path d="M12 19.5a8 8 0 0 1-8-8" />
      <polyline points="6.5 14 4 11.5 2 14" />
    </svg>
  );
}

export default MatchesIcon;

