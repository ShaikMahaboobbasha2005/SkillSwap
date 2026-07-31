/**
 * SwapRequestSkeleton Component
 *
 * Skeleton loader cards for swap requests list per Design.md rules (no full page spinners).
 *
 * @param {Object} props
 * @param {number} [props.count=3] - Number of skeleton cards to render
 */
export default function SwapRequestSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4 w-full" aria-label="Loading swap requests">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white border border-[#E6E3DA] rounded-2xl p-5 shadow-xs animate-pulse space-y-4"
        >
          {/* Header row: User Avatar + Name + Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E6E3DA]/60 shrink-0" />
              <div className="space-y-1.5">
                <div className="w-32 h-4 bg-[#E6E3DA]/70 rounded-md" />
                <div className="w-20 h-3 bg-[#E6E3DA]/50 rounded-md" />
              </div>
            </div>
            <div className="w-20 h-6 bg-[#E6E3DA]/60 rounded-full" />
          </div>

          {/* Middle Exchange Box Skeleton */}
          <div className="bg-[#F7F6F2] border border-[#E6E3DA]/80 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-1/2 space-y-1">
              <div className="w-16 h-3 bg-[#E6E3DA]/50 rounded-md" />
              <div className="w-28 h-4 bg-[#E6E3DA]/80 rounded-md" />
            </div>
            <div className="w-6 h-6 rounded-full bg-[#E6E3DA]/50 shrink-0" />
            <div className="w-full sm:w-1/2 space-y-1 text-right">
              <div className="w-16 h-3 bg-[#E6E3DA]/50 rounded-md ml-auto" />
              <div className="w-28 h-4 bg-[#E6E3DA]/80 rounded-md ml-auto" />
            </div>
          </div>

          {/* Footer Action Skeleton */}
          <div className="flex items-center justify-between pt-1">
            <div className="w-24 h-3 bg-[#E6E3DA]/50 rounded-md" />
            <div className="flex items-center gap-2">
              <div className="w-20 h-8 bg-[#E6E3DA]/70 rounded-xl" />
              <div className="w-20 h-8 bg-[#E6E3DA]/70 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
