export default function RecommendationSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 w-full animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-[#E6E3DA] rounded-xl overflow-hidden shadow-xs flex flex-col justify-between"
        >
          {/* Card Top / Header Skeleton */}
          <div className="p-3.5 sm:p-4 pb-2.5">
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-full bg-[#E6E3DA] shrink-0" />
                <div className="space-y-1 flex-1">
                  <div className="h-3.5 bg-[#E6E3DA] rounded w-2/3" />
                  <div className="h-2.5 bg-[#E6E3DA]/60 rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-1 flex flex-col items-end">
                <div className="h-5 bg-[#E6E3DA] rounded-lg w-16" />
                <div className="h-2.5 bg-[#E6E3DA]/60 rounded w-12" />
              </div>
            </div>

            {/* Progress Bar Skeleton */}
            <div className="w-full bg-[#E6E3DA]/40 h-1 rounded-full mt-2.5" />
          </div>

          {/* Divider */}
          <div className="border-t border-[#E6E3DA]" />

          {/* Skill Section Skeletons */}
          <div className="p-3.5 sm:p-4 pt-2.5 space-y-2.5 flex-1">
            <div className="space-y-1">
              <div className="h-2.5 bg-[#E6E3DA] rounded w-1/3" />
              <div className="flex gap-1">
                <div className="h-5 bg-[#E6E3DA]/60 rounded-md w-16" />
                <div className="h-5 bg-[#E6E3DA]/60 rounded-md w-20" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="h-2.5 bg-[#E6E3DA] rounded w-1/3" />
              <div className="flex gap-1">
                <div className="h-5 bg-[#E6E3DA]/40 rounded-md w-20" />
              </div>
            </div>

            {/* Reasons Skeleton */}
            <div className="space-y-1 pt-1.5 border-t border-[#E6E3DA]/60">
              <div className="h-2.5 bg-[#E6E3DA]/50 rounded w-full" />
              <div className="h-2.5 bg-[#E6E3DA]/50 rounded w-4/5" />
            </div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="px-3 sm:px-3.5 pb-3 sm:pb-3.5 pt-2 border-t border-[#E6E3DA] flex gap-2">
            <div className="h-7 bg-[#E6E3DA]/80 rounded-lg flex-1" />
            <div className="h-7 bg-[#E6E3DA] rounded-lg flex-1" />
          </div>
        </div>
      ))}
    </div>
  );
}

