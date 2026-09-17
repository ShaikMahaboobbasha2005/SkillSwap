import { Link } from "react-router-dom";
import { MessageSquare, Trophy, Star, ArrowUpRight } from "lucide-react";
import { OfferedSkillIcon, WantedSkillIcon } from "../icons";

/**
 * DashboardStats Component
 *
 * Compact statistics snapshot using reliable, existing application data.
 * Does not invent values or display fake placeholder statistics.
 */
export default function DashboardStats({
  skillsOffered = 0,
  skillsWanted = 0,
  activeSwaps = 0,
  completedSwaps = 0,
  avgRating = 0,
  loading = false,
}) {
  const numericRating = Number(avgRating);
  const formattedRating = !isNaN(numericRating) && numericRating >= 0 ? numericRating.toFixed(1) : "0.0";

  const statCards = [
    {
      label: "Skills Offered",
      value: `${skillsOffered}`,
      subtext: "Max 5 active",
      to: "/profile",
      icon: OfferedSkillIcon,
      iconColor: "text-[#1B4332]",
      badgeColor: "bg-[#E4EEE8]",
    },
    {
      label: "Skills Wanted",
      value: `${skillsWanted}`,
      subtext: "Max 5 active",
      to: "/profile",
      icon: WantedSkillIcon,
      iconColor: "text-amber-700",
      badgeColor: "bg-amber-50",
    },
    {
      label: "Active Swaps",
      value: `${activeSwaps}`,
      subtext: "Current exchanges",
      to: "/chats",
      icon: MessageSquare,
      iconColor: "text-[#1B4332]",
      badgeColor: "bg-[#E4EEE8]",
    },
    {
      label: "Completed Swaps",
      value: `${completedSwaps}`,
      subtext: "Total finished",
      to: "/swaps?tab=history",
      icon: Trophy,
      iconColor: "text-[#B8860B]",
      badgeColor: "bg-amber-50",
    },
    {
      label: "Average Rating",
      value: formattedRating,
      subtext: "From reviews",
      to: "/profile",
      icon: Star,
      iconColor: "fill-[#B8860B] text-[#B8860B]",
      badgeColor: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B6858]">
          Account Snapshot
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              to={stat.to}
              className="group bg-white border border-[#E6E3DA] rounded-xl p-4 sm:p-5 hover:border-[#1B4332] hover:shadow-xs transition-all duration-150 flex flex-col justify-between relative"
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className={`w-7 h-7 rounded-lg ${stat.badgeColor} flex items-center justify-center shrink-0 border border-black/5`}
                >
                  <Icon className={`w-3.5 h-3.5 ${stat.iconColor}`} />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#6B6858] opacity-0 group-hover:opacity-100 transition-opacity group-hover:text-[#1B4332]" />
              </div>

              <div className="mt-3">
                <span className="text-[11px] font-semibold text-[#6B6858] block truncate">
                  {stat.label}
                </span>
                {loading ? (
                  <div className="h-7 w-12 bg-zinc-200 animate-pulse rounded mt-1" />
                ) : (
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xl sm:text-2xl font-extrabold text-[#16160F] tracking-tight">
                      {stat.value}
                    </span>
                  </div>
                )}
                <span className="text-[10px] text-[#6B6858] block mt-0.5">
                  {stat.subtext}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
