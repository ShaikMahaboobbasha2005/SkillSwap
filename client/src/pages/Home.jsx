import { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import { useSwap } from "../context/SwapContext";
import useNotifications from "../hooks/useNotifications";
import Navbar from "../components/Navbar";

// Dashboard Subcomponents
import DashboardHero from "../components/dashboard/DashboardHero";
import DashboardStats from "../components/dashboard/DashboardStats";
import ActiveSwapsSection from "../components/dashboard/ActiveSwapsSection";
import PendingRequestsSection from "../components/dashboard/PendingRequestsSection";
import RecommendedMatchesSection from "../components/dashboard/RecommendedMatchesSection";
import RecentActivitySection from "../components/dashboard/RecentActivitySection";

// Existing Services
import swapService from "../services/swapService";
import { getOwnSkills } from "../services/skillService";
import { getRecommendations } from "../services/recommendationService";

/**
 * Home (SkillSwap Personal Dashboard)
 *
 * Transformed from a basic landing/overview page into an actionable personal dashboard.
 * Immediately answers: "What's happening with my SkillSwap account right now?"
 *
 * Reuses existing services, context, and sockets without introducing duplicate
 * endpoints, polling, or backend modifications.
 */
export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { stats: swapStats } = useSwap();
  const { notifications, fetchNotifications, loading: notificationsLoading } = useNotifications();

  const [dashboardData, setDashboardData] = useState({
    skills: [],
    activeSwaps: [],
    pendingSwaps: [],
    recommendations: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      if (!isAuthenticated) return;

      try {
        const [skillsRes, activeSwapsRes, pendingSwapsRes, recsRes] = await Promise.allSettled([
          getOwnSkills(),
          swapService.getAllSwaps({ status: "accepted", limit: 4 }),
          swapService.getAllSwaps({ status: "pending", limit: 6 }),
          getRecommendations(1, 3, false),
        ]);

        if (!isMounted) return;

        // Defensive normalization of returned payloads
        const rawSkills =
          skillsRes.status === "fulfilled"
            ? (Array.isArray(skillsRes.value?.data)
                ? skillsRes.value.data
                : Array.isArray(skillsRes.value)
                ? skillsRes.value
                : [])
            : [];

        const rawActiveSwaps =
          activeSwapsRes.status === "fulfilled"
            ? (Array.isArray(activeSwapsRes.value?.data?.swapRequests)
                ? activeSwapsRes.value.data.swapRequests
                : Array.isArray(activeSwapsRes.value?.data)
                ? activeSwapsRes.value.data
                : [])
            : [];

        const rawPendingSwaps =
          pendingSwapsRes.status === "fulfilled"
            ? (Array.isArray(pendingSwapsRes.value?.data?.swapRequests)
                ? pendingSwapsRes.value.data.swapRequests
                : Array.isArray(pendingSwapsRes.value?.data)
                ? pendingSwapsRes.value.data
                : [])
            : [];

        const rawRecommendations =
          recsRes.status === "fulfilled"
            ? (Array.isArray(recsRes.value?.data?.recommendations)
                ? recsRes.value.data.recommendations
                : Array.isArray(recsRes.value?.data)
                ? recsRes.value.data
                : [])
            : [];

        setDashboardData({
          skills: rawSkills,
          activeSwaps: rawActiveSwaps,
          pendingSwaps: rawPendingSwaps,
          recommendations: rawRecommendations,
          loading: false,
          error: null,
        });
      } catch (err) {
        if (!isMounted) return;
        console.warn("[Dashboard] Failed to fetch dashboard data:", err);
        setDashboardData((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to load some dashboard items.",
        }));
      }
    }

    loadDashboardData();

    // Load recent activity notifications if needed
    if (typeof fetchNotifications === "function") {
      fetchNotifications({ page: 1, limit: 5 });
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const { skills, activeSwaps, pendingSwaps, recommendations, loading } = dashboardData;

  // Defensive array handling
  const skillsList = Array.isArray(skills) ? skills.filter(Boolean) : [];
  const safeActiveSwaps = Array.isArray(activeSwaps) ? activeSwaps.filter(Boolean) : [];
  const safePendingSwaps = Array.isArray(pendingSwaps) ? pendingSwaps.filter(Boolean) : [];
  const safeRecommendations = Array.isArray(recommendations) ? recommendations.filter(Boolean) : [];
  const safeNotifications = Array.isArray(notifications) ? notifications.filter(Boolean) : [];

  // Derive accurate stats from real data
  const skillsOfferedCount = skillsList.filter((s) => s?.type === "Offer").length;
  const skillsWantedCount = skillsList.filter((s) => s?.type && s.type !== "Offer").length;

  const activeSwapsCount =
    typeof swapStats?.accepted === "number"
      ? swapStats.accepted
      : safeActiveSwaps.length;

  const completedSwapsCount =
    typeof user?.completedSwaps === "number"
      ? user.completedSwaps
      : (typeof swapStats?.completed === "number" ? swapStats.completed : 0);

  const numRating = Number(user?.avgRating);
  const avgRating = !isNaN(numRating) && numRating >= 0 ? numRating : 0;
  const currentUserId = user?._id || user?.id;

  return (
    <div className="min-h-screen bg-[#F7F6F2] dark:bg-[#0F1210] text-[#16160F] dark:text-[#F2F1EC] flex flex-col font-sans antialiased transition-colors duration-150">
      {/* Centralized Shared Navigation Bar */}
      <Navbar />

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* 1. Hero / Welcome Section + Quick Actions */}
        <DashboardHero user={user} />

        {/* 2. Account Snapshot Stats */}
        <DashboardStats
          skillsOffered={skillsOfferedCount}
          skillsWanted={skillsWantedCount}
          activeSwaps={activeSwapsCount}
          completedSwaps={completedSwapsCount}
          avgRating={avgRating}
          loading={loading}
        />

        {/* 3. Primary Dashboard Grid (2-Column Desktop, 1-Column Mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Primary Operational Workflows (Active Swaps & Matches) - 7 cols on lg */}
          <div className="lg:col-span-7 space-y-6 lg:space-y-8 h-fit self-start">
            <ActiveSwapsSection
              swaps={safeActiveSwaps}
              loading={loading}
              currentUserId={currentUserId}
            />

            <RecommendedMatchesSection
              recommendations={safeRecommendations}
              loading={loading}
            />
          </div>

          {/* Right Column: Pending Actions & Activity Feed - 5 cols on lg */}
          <div className="lg:col-span-5 space-y-6 lg:space-y-8 h-fit self-start">
            <PendingRequestsSection
              pendingSwaps={safePendingSwaps}
              loading={loading}
              currentUserId={currentUserId}
            />

            <RecentActivitySection
              notifications={safeNotifications}
              loading={notificationsLoading}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
