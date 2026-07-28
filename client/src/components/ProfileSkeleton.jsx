import logoImg from "../assets/logo.png";

export default function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#16160F] antialiased flex flex-col">
      {/* Top Navbar Skeleton */}
      <nav className="border-b border-[#E6E3DA] bg-white sticky top-0 z-40 px-4 sm:px-8 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={logoImg}
              alt="SkillSwap"
              className="w-9 h-9 object-contain rounded-xl border border-[#E6E3DA] p-1 bg-white"
            />
            <span className="text-xl font-bold tracking-tight text-[#16160F]">
              Skill<span className="text-[#1B4332]">Swap</span>
            </span>
          </div>
          <div className="w-28 h-9 bg-[#E6E3DA] rounded-xl animate-shimmer"></div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 space-y-6">
        
        {/* Header Skeleton Card */}
        <div className="bg-white rounded-2xl border border-[#E6E3DA] overflow-hidden shadow-sm">
          {/* Banner Skeleton */}
          <div className="h-36 sm:h-44 lg:h-48 bg-gradient-to-r from-[#E6E3DA]/60 via-[#E4EEE8]/40 to-[#E6E3DA]/60 animate-shimmer"></div>
          
          <div className="p-6 sm:p-7 pt-0 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-20 sm:-mt-22 mb-4">
              
              {/* Overlapping Avatar Skeleton (w-32 h-32 sm:w-36 sm:h-36) */}
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-[5px] border-white bg-[#E6E3DA] shadow-xl animate-shimmer shrink-0"></div>

              {/* Action Button Skeleton */}
              <div className="w-32 h-10 bg-[#E6E3DA] rounded-xl animate-shimmer"></div>
            </div>

            {/* User Info Lines */}
            <div className="space-y-3 mt-2 text-center sm:text-left">
              <div className="h-8 bg-[#E6E3DA] rounded-md w-56 mx-auto sm:mx-0 animate-shimmer"></div>
              <div className="h-4 bg-[#E6E3DA] rounded-md w-32 mx-auto sm:mx-0 animate-shimmer"></div>
              <div className="flex items-center justify-center sm:justify-start gap-4">
                <div className="h-4 bg-[#E6E3DA] rounded-md w-28 animate-shimmer"></div>
                <div className="h-4 bg-[#E6E3DA] rounded-md w-32 animate-shimmer"></div>
              </div>
              <div className="h-12 bg-[#E6E3DA]/60 rounded-xl w-full max-w-lg mt-3 animate-shimmer"></div>
            </div>
          </div>
        </div>

        {/* Profile Completion Skeleton Card */}
        <div className="bg-white rounded-2xl border border-[#E6E3DA] p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-5 bg-[#E6E3DA] rounded-md w-40 animate-shimmer"></div>
            <div className="h-6 bg-[#E6E3DA] rounded-full w-14 animate-shimmer"></div>
          </div>
          <div className="h-2.5 bg-[#E6E3DA] rounded-full w-full animate-shimmer"></div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 bg-[#E6E3DA] rounded-xl animate-shimmer"></div>
            ))}
          </div>
        </div>

        {/* 4 Stat Cards Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#E6E3DA] p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-3 bg-[#E6E3DA] rounded-md w-24 animate-shimmer"></div>
                <div className="w-9 h-9 rounded-full bg-[#E6E3DA] animate-shimmer"></div>
              </div>
              <div className="h-8 bg-[#E6E3DA] rounded-md w-16 animate-shimmer"></div>
            </div>
          ))}
        </div>

        {/* Skills Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#E6E3DA] p-6 shadow-sm space-y-4">
              <div className="h-5 bg-[#E6E3DA] rounded-md w-32 animate-shimmer"></div>
              <div className="h-3 bg-[#E6E3DA] rounded-md w-44 animate-shimmer"></div>
              <div className="flex flex-wrap gap-2 pt-2">
                <div className="h-7 bg-[#E6E3DA] rounded-full w-20 animate-shimmer"></div>
                <div className="h-7 bg-[#E6E3DA] rounded-full w-24 animate-shimmer"></div>
                <div className="h-7 bg-[#E6E3DA] rounded-full w-16 animate-shimmer"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Portfolio Skeleton Card */}
        <div className="bg-white rounded-2xl border border-[#E6E3DA] p-6 shadow-sm space-y-3">
          <div className="h-5 bg-[#E6E3DA] rounded-md w-36 mx-auto animate-shimmer"></div>
          <div className="h-3 bg-[#E6E3DA] rounded-md w-64 mx-auto animate-shimmer"></div>
        </div>

      </main>
    </div>
  );
}
