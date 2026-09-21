import { useEffect, useRef, useState } from "react";
import LandingNavbar from "../components/landing/LandingNavbar";
import Cinematic3DScene from "../components/landing/Cinematic3DScene";
import LandingSpatialHUD from "../components/landing/LandingSpatialHUD";

/**
 * LandingPage — Premium 3D Product Landing
 *
 * Full-viewport scroll-driven 3D experience for unauthenticated visitors.
 * The scroll container (500vh) drives a continuous camera journey through:
 * Discover → Match → Exchange → Learn → Grow
 *
 * Architecture:
 * - LandingNavbar: translucent top bar (logo, links, auth CTAs)
 * - Cinematic3DScene: fixed WebGL canvas driven by scrollProgressRef
 * - LandingSpatialHUD: fixed overlay with typography & CTAs
 */
export default function LandingPage() {
  const scrollProgressRef = useRef(0);
  const [progress, setProgress] = useState(0);

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

  return (
    <div className="relative w-full h-[500vh] bg-[#F7F6F2] dark:bg-[#0F1210] text-[#16160F] dark:text-[#F2F1EC] selection:bg-[#1B4332] selection:text-white transition-colors duration-200">
      {/* 1. Translucent Navbar */}
      <LandingNavbar />

      {/* 2. Full-Viewport Persistent 3D Canvas */}
      <Cinematic3DScene scrollProgressRef={scrollProgressRef} />

      {/* 3. Typography & Storytelling Overlay */}
      <LandingSpatialHUD progress={progress} />

      {/* 4. Footer Anchor (visible at 100%) */}
      <div className="absolute bottom-0 w-full z-20 py-6 px-4 text-center pointer-events-auto">
        <div className="inline-flex items-center gap-3 text-[11px] text-[#6B6858] dark:text-[#9C9A8C] bg-[#F7F6F2]/70 dark:bg-[#0F1210]/70 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#E6E3DA]/50 dark:border-[#2A2E29]/50">
          <span className="font-semibold text-[#16160F] dark:text-[#F2F1EC]">SkillSwap</span>
          <span className="opacity-40">·</span>
          <span>Peer-to-Peer Knowledge Network</span>
          <span className="opacity-40">·</span>
          <span>© 2026</span>
        </div>
      </div>
    </div>
  );
}
