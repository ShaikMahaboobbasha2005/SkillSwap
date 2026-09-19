import { useEffect, useRef, useState } from "react";
import LandingNavbar from "../components/landing/LandingNavbar";
import Cinematic3DScene from "../components/landing/Cinematic3DScene";
import LandingSpatialHUD from "../components/landing/LandingSpatialHUD";

/**
 * LandingPage — Cinematic 3D Interactive Film
 *
 * The entire landing page is an immersive 3D world driven by camera flight,
 * physical 3D skill objects, dynamic lighting, particle streams, and continuous
 * scroll depth across:
 * Discover (0%) -> Match (25%) -> Exchange (50%) -> Learn (75%) -> Grow (100%).
 */
export default function LandingPage() {
  const scrollProgressRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [hoveredSkill, setHoveredSkill] = useState(null);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
          if (totalScroll > 0) {
            const p = Math.max(0, Math.min(1, window.scrollY / totalScroll));
            scrollProgressRef.current = p;
            setProgress(p);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const jumpToStage = (percentage) => {
    const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({
      top: (percentage / 100) * totalScroll,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative w-full h-[550vh] bg-[#F7F6F2] dark:bg-[#0F1210] text-[#16160F] dark:text-[#F2F1EC] selection:bg-[#1B4332] selection:text-white transition-colors duration-200">
      {/* 1. Ultra-Minimal Spatial Navbar */}
      <LandingNavbar />

      {/* 2. Full-Viewport Persistent 3D Cinematic Canvas */}
      <Cinematic3DScene
        scrollProgressRef={scrollProgressRef}
        onSkillHover={setHoveredSkill}
      />

      {/* 3. Minimal Floating Spatial HUD */}
      <LandingSpatialHUD
        progress={progress}
        hoveredSkill={hoveredSkill}
        onJumpToStage={jumpToStage}
      />

      {/* 4. Minimalist Terminal Footer Anchor (Revealed at 100%) */}
      <div className="absolute bottom-0 w-full z-20 py-6 px-4 text-center pointer-events-auto">
        <div className="inline-flex items-center gap-4 text-xs text-[#6B6858] dark:text-[#9C9A8C] bg-[#F7F6F2]/75 dark:bg-[#0F1210]/75 backdrop-blur-md px-5 py-2 rounded-full border border-[#E6E3DA]/60 dark:border-[#2A2E29]/60">
          <span className="font-bold text-[#16160F] dark:text-[#F2F1EC]">SkillSwap</span>
          <span>•</span>
          <span>Peer-to-Peer Knowledge Network</span>
          <span>•</span>
          <span>© 2026</span>
        </div>
      </div>
    </div>
  );
}
