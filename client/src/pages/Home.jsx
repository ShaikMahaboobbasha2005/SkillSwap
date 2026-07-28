import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import logoImg from "../assets/logo.png";

const Home = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#16160F] flex flex-col font-sans antialiased">
      {/* Navigation Bar */}
      <nav className="border-b border-[#E6E3DA] bg-white sticky top-0 z-50 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={logoImg}
              alt="SkillSwap Logo"
              className="w-9 h-9 object-contain rounded-xl border border-[#E6E3DA] p-1 bg-white"
            />
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-[#16160F]">
                Skill<span className="text-[#1B4332]">Swap</span>
              </span>
              <span className="font-brand-serif italic text-[10px] tracking-wider uppercase text-[#6B6858] font-medium -mt-1 hidden sm:inline">
                Swap Skills. Grow Together.
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/profile"
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-[#1B4332] text-white flex items-center justify-center font-bold text-xs overflow-hidden">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                ) : user?.name ? (
                  user.name.charAt(0).toUpperCase()
                ) : (
                  "U"
                )}
              </div>
              <span className="text-sm text-[#16160F] font-medium hidden sm:inline">
                {user?.name}
              </span>
            </Link>
            <Link
              to="/profile"
              className="px-3.5 py-1.5 text-xs font-semibold text-[#1B4332] bg-[#E4EEE8] hover:bg-[#1B4332] hover:text-white rounded-[10px] transition-colors"
            >
              My Profile
            </Link>
            <button
              onClick={logout}
              className="px-3.5 py-1.5 text-xs font-semibold text-[#16160F] hover:text-[#1B4332] bg-[#F7F6F2] hover:bg-[#E4EEE8] border border-[#E6E3DA] rounded-[10px] transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-10">
        {/* Main Linear Flat Card */}
        <div className="bg-white border border-[#E6E3DA] rounded-[16px] p-6 sm:p-10 transition-all">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E6E3DA] pb-6">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#E4EEE8] text-[#1B4332] mb-3">
                Phase 2: Authentication System Active
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#16160F] tracking-tight">
                Welcome back, {user?.name || "User"}
              </h1>
              <p className="mt-1 text-[#6B6858] text-sm">
                Your session is authenticated and persisted via JWT token.
              </p>
            </div>
          </div>

          {/* User Profile Cards Grid */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-[#F7F6F2] border border-[#E6E3DA] rounded-[16px] p-5 hover:border-[#1B4332] transition-colors">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6858]">Email</span>
              <p className="mt-1.5 text-sm font-semibold text-[#16160F] truncate">{user?.email}</p>
            </div>

            <div className="bg-[#F7F6F2] border border-[#E6E3DA] rounded-[16px] p-5 hover:border-[#1B4332] transition-colors">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6858]">Role</span>
              <p className="mt-1.5 text-sm font-semibold text-[#1B4332] capitalize">{user?.role || "user"}</p>
            </div>

            <div className="bg-[#F7F6F2] border border-[#E6E3DA] rounded-[16px] p-5 hover:border-[#1B4332] transition-colors">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6858]">Average Rating</span>
              <p className="mt-1.5 text-sm font-bold text-[#B8860B]">
                ★ {user?.avgRating !== undefined ? user.avgRating.toFixed(1) : "0.0"}
              </p>
            </div>

            <div className="bg-[#F7F6F2] border border-[#E6E3DA] rounded-[16px] p-5 hover:border-[#1B4332] transition-colors">
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
