import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, Compass, Sparkles, RefreshCw, Award, Globe } from "lucide-react";

const STAGES = [
  { id: "discover", percent: 0, tag: "01 // DISCOVER", title: "Two Creators. Infinite Potential.", desc: "Skills float at varying depths. Person A & B flank the boundless 3D space.", icon: Compass },
  { id: "match", percent: 25, tag: "02 // MATCH", title: "Algorithmic Synergy Found", desc: "Avatars converge. A rotating 3D gyroscope locks a 92% mutual compatibility hub.", icon: Sparkles },
  { id: "exchange", percent: 50, tag: "03 // EXCHANGE", title: "Knowledge Crossing Paths", desc: "Skills launch along dual 3D Catmull-Rom splines with glowing particle trails.", icon: RefreshCw },
  { id: "learn", percent: 75, tag: "04 // LEARN", title: "Collaborative Mastery Resonance", desc: "Skills settle into new orbits. Synchronized energy rings and harmonic light pulse.", icon: Award },
  { id: "grow", percent: 100, tag: "05 // GROW", title: "The Decentralized Ecosystem", desc: "Camera pulls back into deep space, revealing 24+ interconnected community peers.", icon: Globe },
];

export default function LandingSpatialHUD({ progress, hoveredSkill, onJumpToStage }) {
  let currentStageIdx = 0;
  if (progress >= 0.85) currentStageIdx = 4;
  else if (progress >= 0.62) currentStageIdx = 3;
  else if (progress >= 0.38) currentStageIdx = 2;
  else if (progress >= 0.15) currentStageIdx = 1;

  const currentStage = STAGES[currentStageIdx];
  const isHero = progress < 0.12;
  const isGrow = progress >= 0.86;

  return (
    <div className="fixed inset-0 pointer-events-none z-10 flex flex-col justify-between p-4 sm:p-6 lg:p-8 select-none">
      {/* 1. TOP SPATIAL SCRUBBER TIMELINE */}
      <div className="w-full max-w-4xl mx-auto pt-16 flex items-center justify-between pointer-events-auto">
        <div className="bg-[#F7F6F2]/75 dark:bg-[#121613]/75 backdrop-blur-xl border border-[#E6E3DA]/80 dark:border-[#2A2E29]/80 rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1.5 sm:gap-3">
          {STAGES.map((stg, idx) => {
            const isActive = currentStageIdx === idx;
            const isPassed = currentStageIdx > idx;

            return (
              <button
                key={stg.id}
                type="button"
                onClick={() => onJumpToStage(stg.percent)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#1B4332] dark:bg-[#3FA873] text-white dark:text-[#0F1210] shadow-sm scale-105"
                    : isPassed
                    ? "text-[#1B4332] dark:text-[#3FA873] hover:bg-black/5 dark:hover:bg-white/5"
                    : "text-[#6B6858] dark:text-[#9C9A8C] hover:text-[#16160F] dark:hover:text-[#F2F1EC]"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                <span className="hidden md:inline">{stg.tag.split(" // ")[1]}</span>
                <span className="md:hidden">{stg.percent}%</span>
              </button>
            );
          })}
        </div>

        {/* Live Hovered 3D Skill Indicator & Depth Counter */}
        <div className="hidden sm:flex items-center gap-3">
          {hoveredSkill && (
            <div className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[#1B4332] dark:text-[#4ade80] text-xs font-mono font-bold animate-fadeIn">
              ✦ {hoveredSkill}
            </div>
          )}
          <div className="px-2.5 py-1 rounded-full bg-[#F7F6F2]/75 dark:bg-[#121613]/75 backdrop-blur-md border border-[#E6E3DA] dark:border-[#2A2E29] text-[11px] font-mono font-bold text-[#6B6858] dark:text-[#9C9A8C]">
            {Math.round(progress * 100)}% DEPTH
          </div>
        </div>
      </div>

      {/* 2. HERO SPATIAL TYPOGRAPHY (0% ONLY) — Positioned in the upper region so center 3D field stays open */}
      {isHero && (
        <div className="w-full max-w-3xl mx-auto text-center flex flex-col items-center pointer-events-auto transition-all duration-500 animate-page-enter pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#1B4332]/10 dark:bg-[#3FA873]/15 text-[#1B4332] dark:text-[#3FA873] border border-[#1B4332]/20 dark:border-[#3FA873]/30 backdrop-blur-md shadow-xs mb-3">
            <Sparkles className="w-3 h-3" />
            <span>Interactive 3D Skill Exchange Film</span>
          </div>

          <h1 className="font-brand-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#16160F] dark:text-[#F2F1EC] leading-tight drop-shadow-sm">
            Share What You Know. <br />
            <span className="text-[#1B4332] dark:text-[#3FA873] drop-shadow-[0_0_24px_rgba(74,222,128,0.3)]">
              Master What You Don&apos;t.
            </span>
          </h1>

          <p className="mt-2.5 text-xs sm:text-sm text-[#6B6858] dark:text-[#9C9A8C] max-w-lg leading-relaxed">
            Hover over floating 3D skills. Scroll slowly to drive the camera and witness knowledge physically cross between creators.
          </p>

          {/* 3D Physical Interactive Buttons */}
          <div className="mt-6 flex items-center gap-3.5">
            <Link
              to="/signup"
              className="group relative inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-linear-to-r from-[#1B4332] to-[#2d6a4f] dark:from-[#3FA873] dark:to-[#22c55e] text-white dark:text-[#0F1210] font-bold text-xs shadow-[0_6px_16px_rgba(27,67,50,0.3)] dark:shadow-[0_6px_16px_rgba(74,222,128,0.25)] hover:shadow-[0_10px_24px_rgba(27,67,50,0.4)] hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.98] transition-all duration-200"
            >
              <span>Start Swapping Free</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button
              type="button"
              onClick={() => onJumpToStage(25)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/70 dark:bg-[#161816]/70 backdrop-blur-md text-[#16160F] dark:text-[#F2F1EC] font-bold text-xs border border-[#E6E3DA] dark:border-[#2A2E29] hover:border-[#1B4332]/40 dark:hover:border-[#3FA873]/40 shadow-xs hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Explore Story</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#1B4332] dark:text-[#3FA873] animate-bounce" />
            </button>
          </div>
        </div>
      )}

      {/* 3. CINEMATIC LOWER-THIRD SPATIAL HUD (25% -> 85%) — Non-intrusive, leaves 3D center stage open */}
      {!isHero && !isGrow && (
        <div className="w-full max-w-6xl mx-auto flex items-end justify-between pointer-events-none pb-4 transition-all duration-400">
          <div className="bg-[#F7F6F2]/80 dark:bg-[#121613]/80 backdrop-blur-xl border border-[#E6E3DA]/80 dark:border-[#2A2E29]/80 rounded-2xl p-4 shadow-xl max-w-sm">
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold tracking-wider text-[#1B4332] dark:text-[#3FA873]">
              <currentStage.icon className="w-3.5 h-3.5" />
              <span>{currentStage.tag}</span>
            </div>
            <h2 className="mt-1 font-brand-serif text-lg font-bold text-[#16160F] dark:text-[#F2F1EC]">
              {currentStage.title}
            </h2>
            <p className="mt-1 text-xs text-[#6B6858] dark:text-[#9C9A8C] leading-relaxed">
              {currentStage.desc}
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-[#6B6858] dark:text-[#9C9A8C] bg-[#F7F6F2]/60 dark:bg-[#121613]/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#E6E3DA]/60 dark:border-[#2A2E29]/60">
            <span>Scroll controls 3D flight</span>
            <ChevronDown className="w-3 h-3 animate-bounce" />
          </div>
        </div>
      )}

      {/* 4. FINAL GLOBAL GUILD REVEAL (100% GROW) */}
      {isGrow && (
        <div className="w-full max-w-md mx-auto mb-10 text-center pointer-events-auto transition-all duration-500 animate-page-enter">
          <div className="bg-linear-to-b from-[#F7F6F2]/90 to-[#EDE9DF]/90 dark:from-[#141815]/90 dark:to-[#0F1210]/90 backdrop-blur-2xl border border-[#1B4332]/30 dark:border-[#3FA873]/30 rounded-3xl p-6 shadow-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[#1B4332] dark:text-[#4ade80] text-[11px] font-mono font-bold">
              <Globe className="w-3.5 h-3.5" />
              <span>THE GLOBAL ECOSYSTEM</span>
            </div>
            <h2 className="font-brand-serif text-2xl sm:text-3xl font-bold text-[#16160F] dark:text-[#F2F1EC]">
              Ready to exchange your craft?
            </h2>
            <p className="text-xs text-[#6B6858] dark:text-[#9C9A8C] max-w-sm mx-auto leading-relaxed">
              Two creators start a swap. Multiplied across thousands, it forms a decentralized global guild.
            </p>
            <div className="pt-1 flex items-center justify-center gap-2.5">
              <Link
                to="/signup"
                className="px-6 py-2.5 rounded-xl bg-[#1B4332] dark:bg-[#3FA873] text-white dark:text-[#0F1210] font-bold text-xs shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all"
              >
                Join Network Free
              </Link>
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-xl bg-white/40 dark:bg-white/5 border border-[#E6E3DA] dark:border-[#2A2E29] text-[#16160F] dark:text-[#F2F1EC] font-bold text-xs hover:border-[#1B4332]/40 transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 5. BOTTOM SCROLL CUE */}
      {isHero && (
        <div className="w-full text-center pb-2 pointer-events-none">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#6B6858] dark:text-[#9C9A8C] opacity-80">
            <span>Scroll down to navigate 3D camera</span>
            <ChevronDown className="w-3 h-3 animate-bounce" />
          </div>
        </div>
      )}
    </div>
  );
}
