import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { getPublicProfile } from "../services/profileService";
import Navbar from "../components/Navbar";
import ProfileSkeleton from "../components/ProfileSkeleton";
import ProfileBanner from "../components/ProfileBanner";
import CompactProfileStats from "../components/profile/CompactProfileStats";
import AvatarLightboxModal from "../components/profile/AvatarLightboxModal";
import SkillsSection from "../components/skills/SkillsSection";
import SwapRequestModal from "../components/swaps/SwapRequestModal";
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

  const currentPicture =
    profile?.profilePicture ||
    profile?.avatar ||
    profile?.profilePhoto ||
    profile?.avatarUrl ||
    "";

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
              
              {/* HERO AVATAR WITH CONTEXTUAL DROPDOWN / LIGHTBOX */}
              <div className="relative shrink-0 z-20" ref={avatarMenuRef}>
                <div
                  onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
                  className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full border-[5px] border-white bg-[#E4EEE8] flex items-center justify-center shadow-xl shadow-black/10 overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-2xl hover:scale-[1.02]"
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
                    <div className="w-full h-full bg-[#1B4332] text-white flex items-center justify-center font-black text-5xl select-none">
                      {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                </div>

                {/* Contextual Dropdown Menu for Avatar */}
                {avatarMenuOpen && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-48 bg-white border border-[#E6E3DA] rounded-xl shadow-xl py-1.5 z-40 animate-fadeIn">
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarMenuOpen(false);
                        console.log("[PublicProfile] Opening AvatarLightboxModal with imageSrc:", currentPicture);
                        setShowAvatarLightbox(true);
                      }}
                      className="w-full px-3.5 py-2 text-xs font-semibold text-[#16160F] hover:bg-[#F7F6F2] hover:text-[#1B4332] transition-colors flex items-center gap-2 cursor-pointer text-left"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#1B4332]" />
                      <span>View Profile Picture</span>
                    </button>
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
                  <MapPin className="w-4 h-4 text-[#1B4332]" />
                  <span>{profile.location || "Location not set"}</span>
                </div>

                <div className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-4 h-4 text-[#6B6858]" />
                  <span>Member since {memberSince}</span>
                </div>
              </div>

              {/* INTEGRATED COMPACT STATISTICS SUMMARY BAR */}
              <CompactProfileStats
                rating={profile.avgRating || 0.0}
                completedSwaps={profile.completedSwaps || 0}
                totalSkills={totalSkills}
                portfolioCount="0 items"
                className="mt-4"
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

        {/* PORTFOLIO PLACEHOLDER CARD */}
        <div className="bg-white rounded-2xl border border-[#E6E3DA] p-6 text-center shadow-xs hover:shadow-md transition-all">
          <div className="max-w-md mx-auto py-2 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-[#E4EEE8] border border-[#1B4332]/20 flex items-center justify-center text-xl text-[#1B4332] mb-3 shadow-2xs">
              🎨
            </div>
            <h3 className="text-sm font-bold text-[#16160F]">Portfolio Grid</h3>
            <p className="text-xs text-[#6B6858] mt-1 max-w-sm">
              Showcase photos, project media, and proof of work demonstrating your skill expertise.
            </p>
            <div className="mt-4 px-4 py-1.5 bg-[#F7F6F2] border border-[#E6E3DA] text-[11px] font-bold text-[#1B4332] rounded-full tracking-wide inline-flex items-center gap-1.5 shadow-2xs">
              <span>✨</span>
              <span>Portfolio Grid — Coming Soon</span>
            </div>
          </div>
        </div>

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
