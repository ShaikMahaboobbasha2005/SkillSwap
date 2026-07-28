import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getPublicProfile } from "../services/profileService";
import logoImg from "../assets/logo.png";

export default function PublicProfile() {
  const { id } = useParams();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserProfile();
  }, [id]);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getPublicProfile(id);
      if (res.success) {
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
    return (
      <div className="min-h-screen bg-[#F7F6F2] text-[#16160F] antialiased">
        <nav className="border-b border-[#E6E3DA] bg-white sticky top-0 z-40 px-4 sm:px-8 py-3.5">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={logoImg} alt="SkillSwap" className="w-9 h-9 object-contain rounded-xl border border-[#E6E3DA] p-1 bg-white" />
              <span className="text-xl font-bold tracking-tight text-[#16160F]">
                Skill<span className="text-[#1B4332]">Swap</span>
              </span>
            </div>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fadeIn">
          <div className="bg-white rounded-[16px] border border-[#E6E3DA] p-6 animate-pulse space-y-4 shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full bg-[#E6E3DA]"></div>
              <div className="space-y-2 flex-1">
                <div className="h-6 bg-[#E6E3DA] rounded w-1/3"></div>
                <div className="h-4 bg-[#E6E3DA] rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#F7F6F2] text-[#16160F] antialiased flex flex-col animate-fadeIn">
        <nav className="border-b border-[#E6E3DA] bg-white sticky top-0 z-40 px-4 sm:px-8 py-3.5">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <img src={logoImg} alt="SkillSwap" className="w-9 h-9 object-contain rounded-xl border border-[#E6E3DA] p-1 bg-white" />
              <span className="text-xl font-bold tracking-tight text-[#16160F]">
                Skill<span className="text-[#1B4332]">Swap</span>
              </span>
            </Link>
          </div>
        </nav>

        <main className="max-w-md mx-auto px-4 py-16 text-center flex-1">
          <div className="bg-white rounded-[16px] border border-[#E6E3DA] p-8 shadow-sm">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full mx-auto flex items-center justify-center font-bold text-xl mb-3">
              !
            </div>
            <h2 className="text-base font-bold text-[#16160F]">{error || "User not found"}</h2>
            <p className="text-xs text-[#6B6858] mt-1 mb-5">
              The user profile you requested does not exist or may have been removed.
            </p>
            <Link
              to="/"
              className="px-4 py-2 bg-[#1B4332] text-white text-xs font-semibold rounded-[10px] hover:bg-[#143326] transition-all active:scale-[0.98]"
            >
              Return to Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#16160F] antialiased flex flex-col animate-fadeIn">
      {/* Top Navigation Header */}
      <nav className="border-b border-[#E6E3DA] bg-white sticky top-0 z-40 px-4 sm:px-8 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
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
          </Link>

          <div className="flex items-center space-x-3">
            <Link
              to="/"
              className="px-3.5 py-2 text-xs font-semibold text-[#16160F] hover:text-[#1B4332] bg-[#F7F6F2] hover:bg-[#E4EEE8] border border-[#E6E3DA] rounded-[10px] transition-all active:scale-[0.98] inline-flex items-center gap-1.5 shadow-2xs"
            >
              <span>←</span>
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1">
        {/* Profile Card Header */}
        <div className="bg-white rounded-[16px] border border-[#E6E3DA] p-5 sm:p-6 mb-6 shadow-sm hover:border-[#D8D4C8] transition-all">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            {/* Avatar */}
            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full border-2 border-[#E6E3DA] overflow-hidden bg-[#E4EEE8] flex items-center justify-center shrink-0 shadow-xs hover:scale-[1.02] transition-transform">
              {profile.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#1B4332] text-white flex items-center justify-center font-bold text-2xl">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
                </div>
              )}
            </div>

            {/* User Identity Info */}
            <div className="flex flex-col justify-center">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#16160F]">
                {profile.name}
              </h1>
              <p className="text-xs text-[#6B6858] mt-1 flex items-center justify-center sm:justify-start gap-1 font-medium">
                <svg className="w-3.5 h-3.5 text-[#6B6858]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{profile.location || "Location not set"}</span>
              </p>
              <p className="text-[11px] text-[#6B6858] mt-1">
                Member since {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "2026"}
              </p>
            </div>
          </div>
        </div>

        {/* Stat Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-[16px] border border-[#E6E3DA] p-5 flex items-center justify-between h-full hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
            <div>
              <span className="text-[11px] font-semibold text-[#6B6858] uppercase tracking-wider">Average Rating</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-extrabold text-[#16160F]">
                  {profile.avgRating ? profile.avgRating.toFixed(1) : "0.0"}
                </span>
                <span className="text-xs text-[#B8860B] font-semibold flex items-center gap-1">
                  ★ <span className="text-[#6B6858] font-normal">({profile.completedSwaps || 0} reviews)</span>
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#F7F6F2] border border-[#E6E3DA] flex items-center justify-center text-[#B8860B] text-base shrink-0">
              ★
            </div>
          </div>

          <div className="bg-white rounded-[16px] border border-[#E6E3DA] p-5 flex items-center justify-between h-full hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
            <div>
              <span className="text-[11px] font-semibold text-[#6B6858] uppercase tracking-wider">Completed Swaps</span>
              <div className="text-2xl font-extrabold text-[#16160F] mt-1">
                {profile.completedSwaps || 0}
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#E4EEE8] border border-[#1B4332]/20 flex items-center justify-center text-[#1B4332] font-semibold text-sm shrink-0">
              ⇄
            </div>
          </div>
        </div>

        {/* Read-Only Skills Offered & Skills Wanted */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Skills Offered */}
          <div className="bg-white rounded-[16px] border border-[#E6E3DA] p-5 sm:p-6 flex flex-col justify-between hover:border-[#D8D4C8] transition-all">
            <div>
              <h2 className="text-sm font-bold text-[#16160F] mb-1">Skills Offered</h2>
              <p className="text-[11px] text-[#6B6858] mb-4">Skills available to teach</p>
              
              <div className="flex flex-wrap gap-2">
                {profile.skillsOffered && profile.skillsOffered.length > 0 ? (
                  profile.skillsOffered.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-[#E4EEE8] text-[#1B4332] text-xs font-semibold rounded-full border border-[#1B4332]/20"
                    >
                      {typeof skill === "string" ? skill : skill.name}
                    </span>
                  ))
                ) : (
                  <div className="w-full text-center py-6 px-4 bg-[#F7F6F2] rounded-[12px] border border-dashed border-[#E6E3DA] flex flex-col items-center justify-center">
                    <span className="text-2xl mb-1">📚</span>
                    <p className="text-xs font-semibold text-[#16160F]">No skills added yet</p>
                    <p className="text-[11px] text-[#6B6858] mt-0.5">Start adding skills in Phase 4.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Skills Wanted */}
          <div className="bg-white rounded-[16px] border border-[#E6E3DA] p-5 sm:p-6 flex flex-col justify-between hover:border-[#D8D4C8] transition-all">
            <div>
              <h2 className="text-sm font-bold text-[#16160F] mb-1">Skills Wanted</h2>
              <p className="text-[11px] text-[#6B6858] mb-4">Skills looking to learn</p>
              
              <div className="flex flex-wrap gap-2">
                {profile.skillsWanted && profile.skillsWanted.length > 0 ? (
                  profile.skillsWanted.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-[#F7F6F2] text-[#16160F] text-xs font-semibold rounded-full border border-[#E6E3DA]"
                    >
                      {typeof skill === "string" ? skill : skill.name}
                    </span>
                  ))
                ) : (
                  <div className="w-full text-center py-6 px-4 bg-[#F7F6F2] rounded-[12px] border border-dashed border-[#E6E3DA] flex flex-col items-center justify-center">
                    <span className="text-2xl mb-1">📚</span>
                    <p className="text-xs font-semibold text-[#16160F]">No skills added yet</p>
                    <p className="text-[11px] text-[#6B6858] mt-0.5">Start adding skills in Phase 4.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Section Placeholder */}
        <div className="bg-white rounded-[16px] border border-[#E6E3DA] p-6 text-center shadow-2xs hover:border-[#D8D4C8] transition-all">
          <div className="max-w-sm mx-auto py-3 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#F7F6F2] border border-[#E6E3DA] flex items-center justify-center text-xl text-[#1B4332] mb-3">
              🎨
            </div>
            <h3 className="text-sm font-bold text-[#16160F]">Portfolio Grid</h3>
            <p className="text-xs text-[#6B6858] mt-1 max-w-xs">
              Showcase photos and video media proving skill expertise.
            </p>
            <div className="mt-3 px-3.5 py-1 bg-[#F7F6F2] border border-[#E6E3DA] text-[11px] font-semibold text-[#1B4332] rounded-full tracking-wide">
              Portfolio feature coming in Phase 10
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
