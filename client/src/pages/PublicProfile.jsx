import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getPublicProfile } from "../services/profileService";
import Navbar from "../components/Navbar";
import ProfileSkeleton from "../components/ProfileSkeleton";
import ProfileBanner from "../components/ProfileBanner";
import AnimatedStatCard from "../components/AnimatedStatCard";
import SkillsSection from "../components/skills/SkillsSection";
import SwapRequestModal from "../components/swaps/SwapRequestModal";
import useAuth from "../hooks/useAuth";

export default function PublicProfile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalSkills, setTotalSkills] = useState(0);
  const [swapModalOpen, setSwapModalOpen] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, [id]);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getPublicProfile(id);
      if (res.success && res.data) {
        setProfile(res.data);
      }
    } catch (err) {
      console.error("Failed to load public profile:", err);
      setError(err.response?.data?.message || "User profile not found");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#F7F6F2] text-[#16160F] antialiased flex flex-col animate-fadeIn">
        <Navbar />

        <main className="max-w-md mx-auto px-4 py-16 text-center flex-1">
          <div className="bg-white rounded-2xl border border-[#E6E3DA] p-8 shadow-sm space-y-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl mx-auto flex items-center justify-center font-bold text-xl border border-red-200 shadow-2xs">
              !
            </div>
            <div>
              <h2 className="text-base font-bold text-[#16160F]">{error || "User not found"}</h2>
              <p className="text-xs text-[#6B6858] mt-1">
                The user profile you requested does not exist or may have been removed.
              </p>
            </div>
            <Link
              to="/"
              className="inline-block px-5 py-2.5 bg-[#1B4332] text-white text-xs font-semibold rounded-xl hover:bg-[#143326] transition-all active:scale-[0.98] shadow-2xs"
            >
              Return to Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const usernameHandle = profile.email ? `@${profile.email.split("@")[0]}` : "@swapper";
  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "Jan 2026";

  const currentUserId = currentUser?._id || currentUser?.id;
  const profileUserId = profile?._id || profile?.id || id;
  const isSelf = Boolean(currentUserId && profileUserId && String(currentUserId) === String(profileUserId));

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#16160F] antialiased flex flex-col animate-fadeIn">
      {/* Navigation Header */}
      <Navbar />

      {/* Main Content */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 space-y-6">
        
        {/* PROFILE HEADER CARD */}
        <div className="bg-white rounded-2xl border border-[#E6E3DA] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300">
          
          {/* Profile Banner */}
          <ProfileBanner
            bannerUrl={profile.profileBanner}
            isOwner={false}
            badgeText="Public Profile"
          />

          <div className="p-6 sm:p-7 pt-0 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-20 sm:-mt-22 mb-4">
              
              {/* ENLARGED HERO AVATAR */}
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-[5px] border-white bg-[#E4EEE8] flex items-center justify-center shadow-xl shadow-black/10 overflow-hidden shrink-0 hover:scale-[1.02] transition-transform">
                {profile.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#1B4332] text-white flex items-center justify-center font-black text-5xl">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
              </div>

              {/* Request Swap CTA Button */}
              <div className="w-full sm:w-auto flex justify-center sm:justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setSwapModalOpen(true)}
                  disabled={isSelf}
                  className="w-full sm:w-auto h-10 px-5 text-xs font-semibold text-white bg-[#1B4332] hover:bg-[#143326] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all active:scale-[0.98] inline-flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
                  title={isSelf ? "You cannot request a swap with yourself" : "Request Skill Swap"}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span>Request Skill Swap</span>
                </button>
              </div>
            </div>

            {/* Profile Info Details */}
            <div className="space-y-3 text-center sm:text-left">
              <div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#16160F]">
                  {profile.name}
                </h1>
                <p className="text-xs sm:text-sm font-bold text-[#1B4332] mt-0.5">
                  {usernameHandle}
                </p>
              </div>

              {/* Metadata Line */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-[#6B6858] pt-0.5">
                <div className="flex items-center gap-1.5 font-medium">
                  <svg className="w-4 h-4 text-[#1B4332]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{profile.location || "Location not set"}</span>
                </div>

                <div className="flex items-center gap-1.5 font-medium">
                  <svg className="w-4 h-4 text-[#6B6858]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Member since {memberSince}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 4 ANIMATED STAT CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatedStatCard
            label="Average Rating"
            value={profile.avgRating || 0.0}
            isDecimal={true}
            badgeText="★ Reviews"
            icon={
              <svg className="w-5 h-5 text-[#B8860B]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            }
          />

          <AnimatedStatCard
            label="Completed Swaps"
            value={profile.completedSwaps || 0}
            badgeText="Verified"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            }
          />

          <AnimatedStatCard
            label="Total Skills"
            value={totalSkills}
            badgeText="Offered & Wanted"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
          />

          <AnimatedStatCard
            label="Profile Views"
            value={0}
            isPlaceholder={true}
            badgeText="Analytics"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            }
          />
        </div>

        {/* ACTIVE SKILLS SECTION */}
        <SkillsSection
          userId={profile._id}
          isOwner={false}
          onSkillsCountChanged={(count) => setTotalSkills(count)}
        />

        {/* PORTFOLIO PLACEHOLDER CARD */}
        <div className="bg-white rounded-2xl border border-[#E6E3DA] p-6 text-center shadow-xs hover:shadow-md transition-all">
          <div className="max-w-md mx-auto py-2 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-[#E4EEE8] border border-[#1B4332]/20 flex items-center justify-center text-xl text-[#1B4332] mb-3 shadow-2xs">
              🎨
            </div>
            <h3 className="text-sm font-bold text-[#16160F]">Portfolio Grid</h3>
            <p className="text-xs text-[#6B6858] mt-1 max-w-sm">
              Showcase photos and project media proving skill expertise.
            </p>
            <div className="mt-4 px-4 py-1.5 bg-[#F7F6F2] border border-[#E6E3DA] text-[11px] font-bold text-[#1B4332] rounded-full tracking-wide inline-flex items-center gap-1.5 shadow-2xs">
              <span>✨</span>
              <span>Portfolio — Feature available in Phase 10</span>
            </div>
          </div>
        </div>

      </main>

      {/* Swap Request Modal */}
      {profile && (
        <SwapRequestModal
          isOpen={swapModalOpen}
          onClose={() => setSwapModalOpen(false)}
          targetUser={profile}
        />
      )}
    </div>
  );
}
