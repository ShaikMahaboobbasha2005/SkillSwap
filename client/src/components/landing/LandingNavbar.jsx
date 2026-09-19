import { useState } from "react";
import { Link } from "react-router-dom";
import { Sun, Moon, ArrowRight, Menu, X } from "lucide-react";
import useTheme from "../../hooks/useTheme";
import logoImg from "../../assets/logo.png";

export default function LandingNavbar() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const scrollToStory = (stagePercentage = 0) => {
    const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: totalScroll * stagePercentage, behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 z-50 w-full bg-[#F7F6F2]/60 dark:bg-[#0F1210]/60 backdrop-blur-xl border-b border-[#E6E3DA]/40 dark:border-[#2A2E29]/40 transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src={logoImg}
            alt="SkillSwap Logo"
            className="w-8 h-8 rounded-lg object-contain border border-[#1B4332]/10 dark:border-[#3FA873]/20 shadow-2xs group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <span className="font-brand-serif text-lg font-bold tracking-tight text-[#16160F] dark:text-[#F2F1EC]">
              SkillSwap
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#6B6858] dark:text-[#9C9A8C]">
          <button
            type="button"
            onClick={() => scrollToStory(0)}
            className="hover:text-[#1B4332] dark:hover:text-[#3FA873] transition-colors cursor-pointer"
          >
            How it works
          </button>
          <button
            type="button"
            onClick={() => scrollToStory(0.5)}
            className="hover:text-[#1B4332] dark:hover:text-[#3FA873] transition-colors cursor-pointer"
          >
            The Exchange
          </button>
          <button
            type="button"
            onClick={() => scrollToStory(1)}
            className="hover:text-[#1B4332] dark:hover:text-[#3FA873] transition-colors cursor-pointer"
          >
            Community
          </button>
        </nav>

        {/* Desktop Right Actions: Theme Toggle + Auth */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="p-2 rounded-xl text-[#6B6858] dark:text-[#9C9A8C] hover:text-[#16160F] dark:hover:text-[#F2F1EC] hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-[#E6E3DA] dark:hover:border-[#2A2E29] transition-all cursor-pointer motion-btn-interactive"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-[#1B4332]" />
            )}
          </button>

          {/* Sign In Link */}
          <Link
            to="/login"
            className="px-3.5 py-1.5 text-xs font-bold text-[#16160F] dark:text-[#F2F1EC] hover:text-[#1B4332] dark:hover:text-[#3FA873] transition-colors"
          >
            Sign In
          </Link>

          {/* Get Started CTA */}
          <Link
            to="/signup"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#1B4332] dark:bg-[#3FA873] text-white dark:text-[#0F1210] hover:bg-[#143326] dark:hover:bg-[#338d60] transition-all shadow-2xs hover:shadow-xs motion-btn-interactive"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Hamburger & Theme Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-[#6B6858] dark:text-[#9C9A8C]"
          >
            {resolvedTheme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#1B4332]" />}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="p-2 text-[#16160F] dark:text-[#F2F1EC]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E6E3DA] dark:border-[#2A2E29] bg-[#F7F6F2] dark:bg-[#0F1210] px-4 py-4 space-y-3 animate-fadeIn">
          <button
            type="button"
            onClick={() => scrollToStory(0)}
            className="block w-full text-left py-2 text-xs font-semibold text-[#16160F] dark:text-[#F2F1EC]"
          >
            How it works
          </button>
          <button
            type="button"
            onClick={() => scrollToStory(0.5)}
            className="block w-full text-left py-2 text-xs font-semibold text-[#16160F] dark:text-[#F2F1EC]"
          >
            The Exchange
          </button>
          <button
            type="button"
            onClick={() => scrollToStory(1)}
            className="block w-full text-left py-2 text-xs font-semibold text-[#16160F] dark:text-[#F2F1EC]"
          >
            Community
          </button>
          <div className="pt-2 border-t border-[#E6E3DA] dark:border-[#2A2E29] flex items-center gap-3">
            <Link
              to="/login"
              className="flex-1 py-2 text-center text-xs font-bold border border-[#E6E3DA] dark:border-[#2A2E29] rounded-xl text-[#16160F] dark:text-[#F2F1EC]"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="flex-1 py-2 text-center text-xs font-bold bg-[#1B4332] dark:bg-[#3FA873] text-white dark:text-[#0F1210] rounded-xl"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
