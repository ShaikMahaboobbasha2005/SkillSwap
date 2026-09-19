import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { getPublicProfile } from "../services/profileService";
import Navbar from "../components/Navbar";
import ProfileSkeleton from "../components/ProfileSkeleton";
import ProfileBanner from "../components/ProfileBanner";
import CompactProfileStats from "../components/profile/CompactProfileStats";
import AvatarLightboxModal from "../components/profile/AvatarLightboxModal";
import ReviewsSection from "../components/profile/ReviewsSection";
import PortfolioSection from "../components/profile/PortfolioSection";
import SkillsSection from "../components/skills/SkillsSection";
import SwapRequestModal from "../components/swaps/SwapRequestModal";
import SocialLinksRow from "../components/profile/SocialLinksRow";
import useAuth from "../hooks/useAuth";
import { Eye, MapPin, Calendar } from "lucide-react";

export default function PublicProfile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalSkills, setTotalSkills] = useState(0);
  const [swapModalOpen, setSwapModalOpen] = useState(false);

  // Avatar contextual dropdown & Lightbox state
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [showAvatarLightbox, setShowAvatarLightbox] = useState(false);
  const avatarMenuRef = useRef(null);

  // Handle Click Outside & Escape key for Avatar Contextual Menu
  useEffect(() => {
    if (!avatarMenuOpen) return;

    const handleClickOutside = (e) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target)) {
        setAvatarMenuOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setAvatarMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [avatarMenuOpen]);

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
      <div className="min-h-screen bg-[#F7F6F2] dark:bg-[#0F1210] text-[#16160F] dark:text-[#F2F1EC] antialiased flex flex-col animate-fadeIn">
        <Navbar />

        <main className="max-w-md mx-auto px-4 py-16 text-center flex-1">
          <div className="bg-white dark:bg-[#181B18] rounded-2xl border border-[#E6E3DA] dark:border-[#2A2E29] p-8 shadow-sm space-y-4">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-2xl mx-auto flex items-center justify-center font-bold text-xl border border-red-200 dark:border-red-900/50 shadow-2xs">
              !
            </div>
            <div>
              <h2 className="text-base font-bold text-[#16160F] dark:text-[#F2F1EC]">{error || "User not found"}</h2>
              <p className="text-xs text-[#6B6858] dark:text-[#9C9A8C] mt-1">
                The user profile you requested does not exist or may have been removed.
              </p>
            </div>
            <Link
              to="/"
              className="inline-block px-5 py-2.5 bg-[#1B4332] dark:bg-[#3FA873] text-white dark:text-[#0F1210] text-xs font-semibold rounded-xl hover:bg-[#143326] dark:hover:bg-[#348C5E] transition-all active:scale-[0.98] shadow-2xs"
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

  const currentPicture =
    profile?.profilePicture ||
    profile?.avatar ||
    profile?.profilePhoto ||
    profile?.avatarUrl ||
    "";

  return (
    <div className="min-h-screen bg-[#F7F6F2] dark:bg-[#0F1210] text-[#16160F] dark:text-[#F2F1EC] antialiased flex flex-col animate-fadeIn">
      {/* Navigation Header */}
      <Navbar />

      {/* Main Content */}
      <main key={id} className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 space-y-6 animate-page-enter">
        
        {/* PROFILE HEADER CARD */}
        <div className="bg-white dark:bg-[#181B18] rounded-2xl border border-[#E6E3DA] dark:border-[#2A2E29] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300">
          
          {/* Profile Banner */}
          <ProfileBanner
            bannerUrl={profile.profileBanner}
            isOwner={false}
            badgeText="Public Profile"
          />

          <div className="p-6 sm:p-7 pt-0 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-20 sm:-mt-22 mb-4">
              
              {/* HERO AVATAR WITH CONTEXTUAL DROPDOWN / LIGHTBOX */}
              <div className="relative shrink-0 z-20" ref={avatarMenuRef}>
                <div
                  onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
                  className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full border-[5px] border-white dark:border-[#181B18] bg-[#E4EEE8] dark:bg-[#202520] flex items-center justify-center shadow-xl shadow-black/10 overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-2xl hover:scale-[1.02]"
                  title="Click to view profile photo"
                  role="button"
                  aria-haspopup="true"
                  aria-expanded={avatarMenuOpen}
                >
                  {currentPicture ? (
                    <img
                      src={currentPicture}
                      alt={profile.name}
                      className="w-full h-full object-cover select-none"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#1B4332] dark:bg-[#3FA873] text-white dark:text-[#0F1210] flex items-center justify-center font-black text-5xl select-none">
                      {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                </div>

                {/* Contextual Dropdown Menu for Avatar */}
                {avatarMenuOpen && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-40">
                    <div className="w-48 bg-white dark:bg-[#181B18] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-xl shadow-xl py-1.5 animate-dropdown-enter origin-top">
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarMenuOpen(false);
                          console.log("[PublicProfile] Opening AvatarLightboxModal with imageSrc:", currentPicture);
                          setShowAvatarLightbox(true);
                        }}
                        className="w-full px-3.5 py-2 text-xs font-semibold text-[#16160F] dark:text-[#F2F1EC] hover:bg-[#F7F6F2] dark:hover:bg-[#202520] hover:text-[#1B4332] dark:hover:text-[#3FA873] transition-colors flex items-center gap-2 cursor-pointer text-left"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#1B4332] dark:text-[#3FA873]" />
                        <span>View Profile Picture</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Request Swap CTA Button */}
              <div className="w-full sm:w-auto flex justify-center sm:justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setSwapModalOpen(true)}
                  disabled={isSelf}
                  className="w-full sm:w-auto h-10 px-5 text-xs font-semibold text-white dark:text-[#0F1210] bg-[#1B4332] dark:bg-[#3FA873] hover:bg-[#143326] dark:hover:bg-[#348C5E] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all active:scale-[0.98] inline-flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
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
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#16160F] dark:text-[#F2F1EC]">
                  {profile.name}
                </h1>
                <p className="text-xs sm:text-sm font-bold text-[#1B4332] dark:text-[#3FA873] mt-0.5">
                  {usernameHandle}
                </p>
              </div>

              {/* Metadata Line */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-[#6B6858] dark:text-[#9C9A8C] pt-0.5">
                <div className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-[#1B4332] dark:text-[#3FA873]" />
                  <span>{profile.location || "Location not set"}</span>
                </div>

                <div className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-4 h-4 text-[#6B6858] dark:text-[#9C9A8C]" />
                  <span>Member since {memberSince}</span>
                </div>
              </div>

              {/* Read-Only Bio Presentation */}
              <div className="pt-1">
                <p className="text-xs sm:text-sm text-[#16160F]/95 dark:text-[#F2F1EC]/90 leading-relaxed font-normal max-w-2xl">
                  {profile.bio || "No bio added yet."}
                </p>
              </div>

              {/* Social Links Row */}
              <SocialLinksRow socialLinks={profile.socialLinks} className="pt-1" />

              {/* INTEGRATED COMPACT STATISTICS SUMMARY BAR */}
              <CompactProfileStats
                rating={profile.avgRating || 0.0}
                completedSwaps={profile.completedSwaps || 0}
                totalSkills={totalSkills}
                portfolioCount="0 items"
                className="mt-3"
              />
            </div>

          </div>
        </div>

        {/* ACTIVE SKILLS SECTION */}
        <SkillsSection
          userId={profile._id}
          isOwner={false}
          onSkillsLoaded={(skills) => {
            setTotalSkills(skills.length);
          }}
        />

        {/* PORTFOLIO SECTION */}
        <PortfolioSection
          isOwner={false}
          userId={profile._id}
          userName={profile.name}
        />

        {/* REVIEWS & RATINGS SECTION */}
        <ReviewsSection
          userId={profile._id}
          avgRating={profile?.avgRating || 0}
          isOwner={isSelf}
        />

      </main>

      {/* SWAP REQUEST MODAL */}
      {swapModalOpen && (
        <SwapRequestModal
          targetUser={profile}
          isOpen={swapModalOpen}
          onClose={() => setSwapModalOpen(false)}
        />
      )}

      {/* Profile Photo Lightbox Viewer Modal */}
      <AvatarLightboxModal
        isOpen={showAvatarLightbox}
        onClose={() => setShowAvatarLightbox(false)}
        imageSrc={currentPicture}
        userName={profile?.name || "User"}
      />
    </div>
  );
}
