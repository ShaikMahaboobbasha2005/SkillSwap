export default function NotificationSkeleton({ count = 3, compact = false }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={`flex items-start gap-3 p-3 animate-pulse ${
            compact ? "rounded-xl" : "rounded-2xl border border-[#E6E3DA] dark:border-[#2A2E29]"
          } bg-white dark:bg-[#181B18]`}
        >
          {/* Avatar / Icon Skeleton */}
          <div className="w-9 h-9 rounded-full bg-[#E6E3DA]/60 dark:bg-[#2A2E29] shrink-0" />

          {/* Text Content Skeleton */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-3.5 bg-[#E6E3DA]/80 dark:bg-[#2A2E29] rounded w-1/3" />
              <div className="h-3 bg-[#E6E3DA]/50 dark:bg-[#202520] rounded w-12" />
            </div>
            <div className="h-3 bg-[#E6E3DA]/60 dark:bg-[#2A2E29] rounded w-4/5" />
            <div className="flex items-center gap-1.5 pt-0.5">
              <div className="w-4 h-4 rounded-full bg-[#E6E3DA]/60 dark:bg-[#2A2E29] shrink-0" />
              <div className="h-2.5 bg-[#E6E3DA]/50 dark:bg-[#202520] rounded w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
