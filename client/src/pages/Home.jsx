import useAuth from "../hooks/useAuth";
import Navbar from "../components/Navbar";
import { Star } from "lucide-react";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#16160F] flex flex-col font-sans antialiased">
      {/* Centralized Shared Navigation Bar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-10 space-y-6">
        {/* Main Linear Flat Dashboard Card */}
        <div className="bg-white border border-[#E6E3DA] rounded-2xl p-6 sm:p-10 shadow-xs">
          <div className="border-b border-[#E6E3DA] pb-6">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#E4EEE8] text-[#1B4332] mb-3">
              Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#16160F] tracking-tight">
              Welcome back, {user?.name || "User"}
            </h1>
            <p className="mt-1 text-[#6B6858] text-xs sm:text-sm">
              Your personal dashboard overview. Swap skills, mentor others, and grow together.
            </p>
          </div>

          {/* User Profile Overview Cards Grid */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-[#F7F6F2] border border-[#E6E3DA] rounded-2xl p-5 hover:border-[#1B4332] transition-colors">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6858]">Email</span>
              <p className="mt-1.5 text-sm font-semibold text-[#16160F] truncate">{user?.email}</p>
            </div>

            <div className="bg-[#F7F6F2] border border-[#E6E3DA] rounded-2xl p-5 hover:border-[#1B4332] transition-colors">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6858]">Role</span>
              <p className="mt-1.5 text-sm font-semibold text-[#1B4332] capitalize">{user?.role || "user"}</p>
            </div>

            <div className="bg-[#F7F6F2] border border-[#E6E3DA] rounded-2xl p-5 hover:border-[#1B4332] transition-colors">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6858]">Average Rating</span>
              <div className="mt-1.5 flex items-center gap-1">
                <Star className="w-4 h-4 fill-[#B8860B] text-[#B8860B]" />
                <span className="text-sm font-bold text-[#16160F]">
                  {user?.avgRating !== undefined ? user.avgRating.toFixed(1) : "0.0"}
                </span>
              </div>
            </div>

            <div className="bg-[#F7F6F2] border border-[#E6E3DA] rounded-2xl p-5 hover:border-[#1B4332] transition-colors">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6858]">Completed Swaps</span>
              <p className="mt-1.5 text-sm font-semibold text-[#1B4332]">{user?.completedSwaps || 0}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
