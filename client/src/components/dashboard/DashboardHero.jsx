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
    <div className="bg-white dark:bg-[#181B18] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-2xl p-6 sm:p-8 shadow-xs transition-colors duration-150">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#E6E3DA] dark:border-[#2A2E29]">
        {/* Welcome Text */}
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E4EEE8] dark:bg-[#1C2E24] text-[#1B4332] dark:text-[#3FA873] tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1B4332] dark:bg-[#3FA873]" />
            Dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#16160F] dark:text-[#F2F1EC] tracking-tight">
            Welcome back, {fullName}
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6858] dark:text-[#9C9A8C]">
            Your personal SkillSwap overview. Share what you know. Learn something new.
          </p>
        </div>

        {/* User Identity Chip */}
        {user && (
          <div className="flex items-center gap-3 self-start md:self-auto bg-[#F7F6F2] dark:bg-[#111412] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-xl px-3.5 py-2 shrink-0">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={fullName}
                className="w-9 h-9 rounded-full object-cover border border-[#E6E3DA] dark:border-[#2A2E29]"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#E4EEE8] dark:bg-[#1C2E24] text-[#1B4332] dark:text-[#3FA873] font-bold flex items-center justify-center text-sm border border-[#1B4332]/20 dark:border-[#3FA873]/30">
                {fullName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#16160F] dark:text-[#F2F1EC] truncate max-w-[140px] sm:max-w-[180px]">
                {fullName}
              </p>
              <p className="text-[11px] text-[#6B6858] dark:text-[#9C9A8C] truncate max-w-[140px] sm:max-w-[180px]">
                {user.email}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions Grid */}
      <div className="mt-6">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B6858] dark:text-[#9C9A8C] block mb-3">
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
                    ? "bg-[#1B4332] dark:bg-[#3FA873] text-white dark:text-[#0F1210] border-[#1B4332] dark:border-[#3FA873] hover:bg-[#153427] dark:hover:bg-[#338d60] hover:shadow-xs"
                    : "bg-[#F7F6F2] dark:bg-[#111412] text-[#16160F] dark:text-[#F2F1EC] border-[#E6E3DA] dark:border-[#2A2E29] hover:border-[#1B4332] dark:hover:border-[#3FA873] hover:bg-white dark:hover:bg-[#181B18]"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                    action.primary
                      ? "bg-white/15 dark:bg-black/15 text-white dark:text-[#0F1210]"
                      : "bg-white dark:bg-[#181B18] border border-[#E6E3DA] dark:border-[#2A2E29] text-[#1B4332] dark:text-[#3FA873]"
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
                      action.primary
                        ? "text-white dark:text-[#0F1210]"
                        : "text-[#16160F] dark:text-[#F2F1EC] group-hover:text-[#1B4332] dark:group-hover:text-[#3FA873]"
                    }`}
                  >
                    {action.label}
                  </span>
                  <span
                    className={`hidden sm:block text-[10px] truncate ${
                      action.primary ? "text-white/80 dark:text-[#0F1210]/80" : "text-[#6B6858] dark:text-[#9C9A8C]"
                    }`}
                  >
                    {action.description}
                  </span>
                </div>
                <ArrowRight
                  className={`w-3.5 h-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 ${
                    action.primary
                      ? "text-white/70 dark:text-[#0F1210]/70"
                      : "text-[#6B6858] dark:text-[#9C9A8C] group-hover:text-[#1B4332] dark:group-hover:text-[#3FA873]"
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
