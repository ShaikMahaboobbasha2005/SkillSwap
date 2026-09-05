export default function RecommendationSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 w-full animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-[#E6E3DA] rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between"
        >
          {/* Top Section */}
          <div>
            {/* Header Skeleton */}
            <div className="p-4 pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-full bg-[#E6E3DA] shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-4 bg-[#E6E3DA] rounded-md w-2/3" />
                    <div className="h-3 bg-[#E6E3DA]/60 rounded-md w-1/2" />
                  </div>
                </div>
              </div>

              {/* Match Score Box Skeleton */}
              <div className="mt-3 p-2.5 rounded-xl bg-[#F7F6F2] border border-[#E6E3DA] space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#E6E3DA] shrink-0" />
                  <div className="h-3 bg-[#E6E3DA] rounded-md w-1/3" />
                </div>
                <div className="w-full bg-[#E6E3DA]/60 h-1.5 rounded-full" />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[#E6E3DA]" />

            {/* Skill Section Skeletons */}
            <div className="p-4 pt-3 space-y-3 flex-1">
              <div className="space-y-1.5">
                <div className="h-3 bg-[#E6E3DA] rounded-md w-1/3" />
                <div className="flex gap-1.5">
                  <div className="h-6 bg-[#E6E3DA]/60 rounded-lg w-20" />
                  <div className="h-6 bg-[#E6E3DA]/60 rounded-lg w-24" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="h-3 bg-[#E6E3DA] rounded-md w-1/3" />
                <div className="flex gap-1.5">
                  <div className="h-6 bg-[#E6E3DA]/40 rounded-lg w-24" />
                </div>
              </div>

              {/* Reasons Skeleton */}
              <div className="space-y-1.5 pt-2 border-t border-[#E6E3DA]/60">
                <div className="h-3 bg-[#E6E3DA]/60 rounded-md w-1/4 mb-1" />
                <div className="h-3 bg-[#E6E3DA]/40 rounded-md w-full" />
                <div className="h-3 bg-[#E6E3DA]/40 rounded-md w-4/5" />
              </div>
            </div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="p-3.5 pt-2.5 border-t border-[#E6E3DA] flex gap-2.5 bg-white">
            <div className="h-8 bg-[#E6E3DA]/70 rounded-xl flex-1" />
            <div className="h-8 bg-[#E6E3DA] rounded-xl flex-1" />
          </div>
        </div>
      ))}
    </div>
  );
}
