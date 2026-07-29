export default function LoadingSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-[#E6E3DA] rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between"
        >
          <div>
            {/* Banner Skeleton */}
            <div className="h-20 bg-[#E6E3DA]/40 w-full" />

            {/* Avatar & Header Skeleton */}
            <div className="px-5 pt-0 relative pb-3 border-b border-[#E6E3DA]/40">
              <div className="flex items-end justify-between -mt-6 mb-2">
                <div className="w-13 h-13 rounded-full bg-[#E6E3DA] border-2 border-white" />
                <div className="w-14 h-4 rounded bg-[#E6E3DA]/60" />
              </div>
              <div className="space-y-1.5">
                <div className="h-4 bg-[#E6E3DA] rounded w-1/2" />
                <div className="h-3 bg-[#E6E3DA]/60 rounded w-1/3" />
              </div>
            </div>

            {/* Skill Details Body Skeleton */}
            <div className="p-5 space-y-3">
              <div className="space-y-2">
                <div className="h-5 bg-[#E6E3DA] rounded w-3/4" />
                <div className="flex gap-2">
                  <div className="h-4 bg-[#E6E3DA]/60 rounded-full w-20" />
                  <div className="h-4 bg-[#E6E3DA]/60 rounded-full w-16" />
                </div>
              </div>
              <div className="h-3 bg-[#E6E3DA]/40 rounded w-full" />
              <div className="h-3 bg-[#E6E3DA]/40 rounded w-4/5" />
            </div>
          </div>

          {/* Button Footer Skeleton */}
          <div className="px-5 pb-5 pt-0">
            <div className="h-9 bg-[#E6E3DA]/80 rounded-xl w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
