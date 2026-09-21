import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown } from "lucide-react";

/**
 * LandingSpatialHUD — Premium Product Storytelling Overlay
 *
 * Replaces the previous stage navigation bar / debug indicators with
 * product-focused typography and minimal scroll-driven annotations.
 *
 * Sections:
 * - Hero (0%-12%): Full viewport headline + CTAs
 * - Scroll stages (12%-85%): Minimal lower-left floating annotations
 * - Terminal CTA (85%+): Conversion card framed by community network
 *
 * No stage navigation bar. No depth counter. No hover indicators.
 * Typography is dominant. 3D scene supports the story.
 */

const STAGE_COPY = [
  { tag: "DISCOVER", text: "Find people who know what you want to learn." },
  { tag: "MATCH", text: "Connect through complementary skills." },
  { tag: "EXCHANGE", text: "Knowledge moves both ways." },
  { tag: "LEARN", text: "Build together, one session at a time." },
  { tag: "GROW", text: "Turn individual skills into community." },
];

export default function LandingSpatialHUD({ progress }) {
  let currentStageIdx = 0;
  if (progress >= 0.85) currentStageIdx = 4;
  else if (progress >= 0.62) currentStageIdx = 3;
  else if (progress >= 0.38) currentStageIdx = 2;
  else if (progress >= 0.15) currentStageIdx = 1;

  const currentStage = STAGE_COPY[currentStageIdx];
  const isHero = progress < 0.12;
  const isGrow = progress >= 0.86;

  return (
    <div className="fixed inset-0 pointer-events-none z-10 flex flex-col justify-between select-none">
      {/* ══════════════════════════════════════════════ */}
      {/* HERO — Full viewport cinematic headline        */}
      {/* ══════════════════════════════════════════════ */}
      {isHero && (
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pointer-events-auto">
          <div className="w-full max-w-3xl mx-auto text-center space-y-6">
            {/* Eyebrow */}
            <p
              className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-[#6B6858] dark:text-[#9C9A8C] animate-page-enter"
              style={{ animationDelay: "0ms" }}
            >
              The Peer-to-Peer Skill Network
            </p>

            {/* Main Headline */}
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] text-[#16160F] dark:text-[#F2F1EC] animate-page-enter"
              style={{
                fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                animationDelay: "80ms",
              }}
            >
              Share What You Know.
              <br />
              <span className="text-[#1B4332] dark:text-[#3FA873]">
                Master What You Do.
              </span>
            </h1>

            {/* Supporting copy */}
            <p
              className="text-sm sm:text-base text-[#6B6858] dark:text-[#9C9A8C] max-w-lg mx-auto leading-relaxed animate-page-enter"
              style={{ animationDelay: "160ms" }}
            >
              Exchange skills with people who want to learn what you know
              — and teach you what you want to master.
            </p>

            {/* CTAs */}
            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 animate-page-enter"
              style={{ animationDelay: "240ms" }}
            >
              <Link
                to="/signup"
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#1B4332] dark:bg-[#3FA873] text-white dark:text-[#0F1210] font-semibold text-sm shadow-[0_2px_12px_rgba(27,67,50,0.25)] dark:shadow-[0_2px_12px_rgba(63,168,115,0.2)] hover:shadow-[0_4px_20px_rgba(27,67,50,0.35)] hover:-translate-y-px active:translate-y-px active:scale-[0.99] transition-all duration-200"
              >
                <span>Start Swapping Free</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                to="/"
                onClick={(e) => {
                  e.preventDefault();
                  const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
                  window.scrollTo({ top: totalScroll * 0.25, behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-[#16160F] dark:text-[#F2F1EC] bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-[#E6E3DA] dark:border-[#2A2E29] hover:border-[#1B4332]/30 dark:hover:border-[#3FA873]/30 hover:-translate-y-px active:scale-[0.99] transition-all duration-200"
              >
                <span>Explore How It Works</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* SCROLL STAGES — Minimal floating annotations   */}
      {/* ══════════════════════════════════════════════ */}
      {!isHero && !isGrow && (
        <div className="flex-1 flex items-end p-4 sm:p-6 lg:p-8 pb-8 sm:pb-10 pointer-events-none">
          <div className="max-w-sm space-y-2">
            {/* Stage indicator — tiny dot + number */}
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1B4332] dark:bg-[#3FA873]" />
              <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#1B4332] dark:text-[#3FA873]">
                {currentStage.tag}
              </span>
            </div>

            {/* Stage copy */}
            <p className="text-lg sm:text-xl font-semibold text-[#16160F] dark:text-[#F2F1EC] leading-snug"
              style={{ fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
            >
              {currentStage.text}
            </p>

            {/* Compatibility hint during Match stage */}
            {currentStageIdx === 1 && (
              <div className="inline-flex items-center gap-2 mt-1 px-3 py-1.5 rounded-lg bg-[#F7F6F2]/80 dark:bg-[#141815]/80 backdrop-blur-md border border-[#E6E3DA]/60 dark:border-[#2A2E29]/60">
                <span className="text-xl font-bold text-[#1B4332] dark:text-[#3FA873]"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >92%</span>
                <span className="text-[11px] text-[#6B6858] dark:text-[#9C9A8C] font-medium">Skill Compatibility</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* TERMINAL CTA — Conversion at 100%              */}
      {/* ══════════════════════════════════════════════ */}
      {isGrow && (
        <div className="flex-1 flex items-end justify-center p-4 sm:p-6 pb-12 sm:pb-16 pointer-events-auto">
          <div className="w-full max-w-md text-center space-y-5 animate-page-enter">
            <div className="bg-[#F7F6F2]/85 dark:bg-[#141815]/85 backdrop-blur-2xl border border-[#E6E3DA]/80 dark:border-[#2A2E29]/80 rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
              <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#1B4332] dark:text-[#3FA873]">
                Join the Network
              </p>

              <h2
                className="text-2xl sm:text-3xl font-bold text-[#16160F] dark:text-[#F2F1EC] leading-tight"
                style={{ fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
              >
                Ready to exchange
                <br />
                your craft?
              </h2>

              <p className="text-sm text-[#6B6858] dark:text-[#9C9A8C] max-w-xs mx-auto leading-relaxed">
                One skill exchange becomes a network of knowledge.
              </p>

              <div className="flex items-center justify-center gap-3 pt-1">
                <Link
                  to="/signup"
                  className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1B4332] dark:bg-[#3FA873] text-white dark:text-[#0F1210] font-semibold text-sm shadow-md hover:shadow-lg hover:-translate-y-px active:scale-[0.99] transition-all duration-200"
                >
                  <span>Start Swapping Free</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  to="/login"
                  className="px-5 py-3 rounded-xl text-sm font-semibold text-[#16160F] dark:text-[#F2F1EC] bg-white/40 dark:bg-white/5 border border-[#E6E3DA] dark:border-[#2A2E29] hover:border-[#1B4332]/30 dark:hover:border-[#3FA873]/30 transition-all duration-200"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* SCROLL CUE — Bottom of hero                    */}
      {/* ══════════════════════════════════════════════ */}
      {isHero && (
        <div className="pb-6 sm:pb-8 text-center pointer-events-none">
          <p className="text-[11px] font-medium text-[#6B6858]/60 dark:text-[#9C9A8C]/60 tracking-wide">
            Scroll to explore
          </p>
          <ChevronDown className="w-4 h-4 mx-auto mt-1 text-[#6B6858]/40 dark:text-[#9C9A8C]/40" />
        </div>
      )}
    </div>
  );
}
