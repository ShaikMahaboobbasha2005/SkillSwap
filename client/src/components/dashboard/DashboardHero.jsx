import { Link } from "react-router-dom";
import { Compass, ArrowLeftRight, User, ArrowRight } from "lucide-react";
import { MatchesIcon } from "../icons";

/**
 * DashboardHero Component
 *
 * Renders the clean welcome header and compact quick-actions area.
 * Uses the authenticated user's real name and existing application routes.
 */
export default function DashboardHero({ user }) {
  const firstName = user?.name ? user.name.split(" ")[0] : "there";
  const fullName = user?.name || "Friend";

  const quickActions = [
    {
      label: "Discover Skills",
      description: "Search community skills",
      to: "/discover",
      icon: Compass,
      primary: true,
    },
    {
      label: "View Matches",
      description: "Compatible skill partners",
      to: "/recommendations",
      customIcon: MatchesIcon,
    },
    {
      label: "Swap Requests",
      description: "Incoming & outgoing",
      to: "/swaps",
      icon: ArrowLeftRight,
    },
    {
      label: "My Profile",
      description: "Manage skills & info",
      to: "/profile",
      icon: User,
    },
  ];

  return (
    <div className="bg-white border border-[#E6E3DA] rounded-2xl p-6 sm:p-8 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#E6E3DA]">
        {/* Welcome Text */}
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E4EEE8] text-[#1B4332] tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1B4332]" />
            Dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#16160F] tracking-tight">
            Welcome back, {fullName}
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6858]">
            Your personal SkillSwap overview. Share what you know. Learn something new.
          </p>
        </div>

        {/* User Identity Chip */}
        {user && (
          <div className="flex items-center gap-3 self-start md:self-auto bg-[#F7F6F2] border border-[#E6E3DA] rounded-xl px-3.5 py-2 shrink-0">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={fullName}
                className="w-9 h-9 rounded-full object-cover border border-[#E6E3DA]"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#E4EEE8] text-[#1B4332] font-bold flex items-center justify-center text-sm border border-[#1B4332]/20">
                {fullName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#16160F] truncate max-w-[140px] sm:max-w-[180px]">
                {fullName}
              </p>
              <p className="text-[11px] text-[#6B6858] truncate max-w-[140px] sm:max-w-[180px]">
                {user.email}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions Grid */}
      <div className="mt-6">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B6858] block mb-3">
          Quick Actions
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const CustomIcon = action.customIcon;
            return (
              <Link
                key={action.to}
                to={action.to}
                className={`group flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border transition-all duration-150 text-left ${
                  action.primary
                    ? "bg-[#1B4332] text-white border-[#1B4332] hover:bg-[#153427] hover:shadow-xs"
                    : "bg-[#F7F6F2] text-[#16160F] border-[#E6E3DA] hover:border-[#1B4332] hover:bg-white"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                    action.primary
                      ? "bg-white/15 text-white"
                      : "bg-white border border-[#E6E3DA] text-[#1B4332]"
                  }`}
                >
                  {CustomIcon ? (
                    <CustomIcon className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span
                    className={`block text-xs sm:text-sm font-bold truncate ${
                      action.primary ? "text-white" : "text-[#16160F] group-hover:text-[#1B4332]"
                    }`}
                  >
                    {action.label}
                  </span>
                  <span
                    className={`hidden sm:block text-[10px] truncate ${
                      action.primary ? "text-white/80" : "text-[#6B6858]"
                    }`}
                  >
                    {action.description}
                  </span>
                </div>
                <ArrowRight
                  className={`w-3.5 h-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 ${
                    action.primary ? "text-white/70" : "text-[#6B6858] group-hover:text-[#1B4332]"
                  }`}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
