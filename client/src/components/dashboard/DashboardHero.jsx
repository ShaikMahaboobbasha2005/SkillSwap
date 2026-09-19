import { Link } from "react-router-dom";
import { Compass, ArrowLeftRight, User, ArrowRight } from "lucide-react";
import { MatchesIcon, OfferedSkillIcon, WantedSkillIcon } from "../icons";

/**
 * DashboardHero Component (Phase 13.3 — Animated Hero)
 *
 * Implements the SkillSwap Animated Hero communicating:
 * LEARN ↔ SHARE
 *
 * Visual Hierarchy:
 * 1. Identity Cue (0ms)
 * 2. Main Greeting / Headline (60ms)
 * 3. Supporting Description (120ms)
 * 4. Skill Exchange Visual (180ms): Offered Skill ↔ Wanted Skill with calm 4s ambient breathing
 * 5. Quick Actions (240ms–300ms)
 *
 * Fully respects Light & Dark themes, 320px–1024px+ viewports, and prefers-reduced-motion.
 */
export default function DashboardHero({ user, skills = [], loading = false }) {
  const firstName = user?.name ? user.name.split(" ")[0] : "there";
  const fullName = user?.name || "Friend";

  // Derive dynamic user skills
  const offeredSkills = Array.isArray(skills) ? skills.filter((s) => s?.type === "Offer") : [];
  const wantedSkills = Array.isArray(skills) ? skills.filter((s) => s?.type && s.type !== "Offer") : [];

  const primaryOffered = offeredSkills[0];
  const primaryWanted = wantedSkills[0];

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
    <div className="bg-white dark:bg-[#181B18] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-2xl p-5 sm:p-7 md:p-8 shadow-xs transition-colors duration-150 space-y-6">
      {/* ============================================================== */}
      {/* 1. TOP HEADER: IDENTITY CUE + GREETING + USER INFO CHIP */}
      {/* ============================================================== */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 pb-5 border-b border-[#E6E3DA] dark:border-[#2A2E29]">
        {/* Left: Identity Cue, Headline, Description */}
        <div className="space-y-1.5 max-w-2xl">
          {/* Identity Cue (0ms) */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E4EEE8] dark:bg-[#1C2E24] text-[#1B4332] dark:text-[#3FA873] tracking-wider uppercase animate-hero-fade-up hero-delay-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1B4332] dark:bg-[#3FA873]" />
            <span>Exchange Engine</span>
          </div>

          {/* Headline (60ms) */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#16160F] dark:text-[#F2F1EC] tracking-tight animate-hero-fade-up hero-delay-1">
            Welcome back, {fullName}
          </h1>

          {/* Description (120ms) */}
          <p className="text-xs sm:text-sm text-[#6B6858] dark:text-[#9C9A8C] leading-relaxed animate-hero-fade-up hero-delay-2">
            Your personal SkillSwap overview. Share what you know. Learn something new.
          </p>
        </div>

        {/* Right: User Identity Chip (preserved) */}
        {user && (
          <div className="animate-hero-fade-up hero-delay-1 flex items-center gap-3 self-start md:self-auto bg-[#F7F6F2] dark:bg-[#111412] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-xl px-3.5 py-2 shrink-0">
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

      {/* ============================================================== */}
      {/* 2. SKILL EXCHANGE VISUAL: OFFERED SKILL ↔ WANTED SKILL (180ms) */}
      {/* ============================================================== */}
      <div className="animate-hero-exchange-in hero-delay-3 bg-[#F7F6F2]/70 dark:bg-[#111412]/70 border border-[#E6E3DA] dark:border-[#2A2E29] rounded-2xl p-4 sm:p-5 relative overflow-hidden">
        {/* Subtle section label */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B6858] dark:text-[#9C9A8C]">
              Live Skill Exchange
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#1B4332] dark:text-[#3FA873] bg-[#E4EEE8] dark:bg-[#1C2E24] px-2 py-0.5 rounded-md border border-[#1B4332]/10 dark:border-[#3FA873]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1B4332] dark:bg-[#3FA873]" />
              Active
            </span>
          </div>
          <span className="text-[11px] font-medium text-[#6B6858] dark:text-[#9C9A8C] hidden sm:inline">
            {offeredSkills.length} Offered • {wantedSkills.length} Wanted
          </span>
        </div>

        {/* Skill Exchange Interactive Flow */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4 relative">
          {/* Card 1: Offered Skill (Slides in from Left) */}
          <Link
            to="/profile"
            aria-label="View or manage offered skills"
            className="animate-hero-slide-left hero-delay-3 motion-card-interactive group bg-white dark:bg-[#181B18] border border-[#E6E3DA] dark:border-[#2A2E29] hover:border-[#1B4332]/40 dark:hover:border-[#3FA873]/40 rounded-xl p-3.5 sm:p-4 flex items-center gap-3 shadow-2xs hover:shadow-xs transition-all duration-150 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#E4EEE8] dark:bg-[#1C2E24] text-[#1B4332] dark:text-[#3FA873] border border-[#1B4332]/15 dark:border-[#3FA873]/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <OfferedSkillIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1B4332] dark:text-[#3FA873]">
                  You Teach
                </span>
                {primaryOffered && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#E4EEE8]/70 dark:bg-[#1C2E24]/70 text-[#1B4332] dark:text-[#3FA873] font-medium">
                    {primaryOffered.level || "Intermediate"}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm font-bold text-[#16160F] dark:text-[#F2F1EC] truncate group-hover:text-[#1B4332] dark:group-hover:text-[#3FA873] transition-colors">
                {primaryOffered ? primaryOffered.name : "Add a skill you can teach"}
              </p>
              <p className="text-[11px] text-[#6B6858] dark:text-[#9C9A8C] truncate">
                {primaryOffered
                  ? (primaryOffered.category || "Skill Offered")
                  : "Share your knowledge with others →"}
              </p>
            </div>
          </Link>

          {/* Center Connection: Exchange Arrow with Calm Ambient Breathing */}
          <div className="flex flex-col items-center justify-center py-0.5 md:py-0">
            <div
              className="animate-hero-exchange-in hero-delay-3 animate-hero-pulse inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#181B18] border border-[#E6E3DA] dark:border-[#2A2E29] shadow-xs text-[#1B4332] dark:text-[#3FA873]"
              title="SkillSwap Exchange Flow"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-[#1B4332] dark:text-[#3FA873]" />
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#16160F] dark:text-[#F2F1EC]">
                Swap
              </span>
            </div>
          </div>

          {/* Card 2: Wanted Skill (Slides in from Right) */}
          <Link
            to="/discover"
            aria-label="Discover and request skills to learn"
            className="animate-hero-slide-right hero-delay-3 motion-card-interactive group bg-white dark:bg-[#181B18] border border-[#E6E3DA] dark:border-[#2A2E29] hover:border-[#1B4332]/40 dark:hover:border-[#3FA873]/40 rounded-xl p-3.5 sm:p-4 flex items-center gap-3 shadow-2xs hover:shadow-xs transition-all duration-150 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <WantedSkillIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                  You Learn
                </span>
                {primaryWanted && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100/70 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-medium">
                    {primaryWanted.level || "Beginner"}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm font-bold text-[#16160F] dark:text-[#F2F1EC] truncate group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors">
                {primaryWanted ? primaryWanted.name : "Find a skill you want to learn"}
              </p>
              <p className="text-[11px] text-[#6B6858] dark:text-[#9C9A8C] truncate">
                {primaryWanted
                  ? (primaryWanted.category || "Skill Wanted")
                  : "Browse community skills to learn →"}
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. QUICK ACTIONS GRID (240ms–300ms) */}
      {/* ============================================================== */}
      <div>
        <span className="animate-hero-fade-up hero-delay-4 text-[11px] font-bold uppercase tracking-wider text-[#6B6858] dark:text-[#9C9A8C] block mb-3">
          Quick Actions
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            const CustomIcon = action.customIcon;
            const delayClass =
              idx === 0
                ? "hero-delay-4"
                : idx === 1
                ? "hero-delay-4"
                : idx === 2
                ? "hero-delay-5"
                : "hero-delay-5";

            return (
              <Link
                key={action.to}
                to={action.to}
                className={`animate-hero-fade-up ${delayClass} motion-card-interactive group flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border text-left ${
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
                      action.primary
                        ? "text-white/80 dark:text-[#0F1210]/80"
                        : "text-[#6B6858] dark:text-[#9C9A8C]"
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

