import { useState } from "react";
import { Link } from "react-router-dom";
import { Sun, Moon, ArrowRight, Menu, X } from "lucide-react";
import useTheme from "../../hooks/useTheme";
import logoImg from "../../assets/logo.png";

/**
 * LandingNavbar — Translucent, minimal navigation for the landing page.
 *
 * Structure:
 * - Logo (left)
 * - How it works / The Exchange / Community (center)
 * - Theme toggle + Sign In + Get Started (right)
 *
 * Design: subtle backdrop blur, thin border, elegant spacing.
 */
export default function LandingNavbar() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const scrollToSection = (fraction = 0) => {
    const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: totalScroll * fraction, behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { label: "How it works", fraction: 0 },
    { label: "The Exchange", fraction: 0.5 },
    { label: "Community", fraction: 1 },
  ];

  return (
    <header className="fixed top-0 z-50 w-full bg-[#F7F6F2]/60 dark:bg-[#0F1210]/60 backdrop-blur-xl border-b border-[#E6E3DA]/30 dark:border-[#2A2E29]/30 transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src={logoImg}
            alt="SkillSwap Logo"
            className="w-7 h-7 rounded-lg object-contain border border-[#1B4332]/10 dark:border-[#3FA873]/15 group-hover:scale-105 transition-transform duration-200"
          />
          <span
            className="font-brand-serif text-base font-bold tracking-tight text-[#16160F] dark:text-[#F2F1EC]"
          >
            SkillSwap
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-[#6B6858] dark:text-[#9C9A8C]">
          {navLinks.map((link) => (
            <button
              key={link.label}
              type="button"
              onClick={() => scrollToSection(link.fraction)}
              className="hover:text-[#16160F] dark:hover:text-[#F2F1EC] transition-colors duration-150 cursor-pointer"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="p-2 rounded-lg text-[#6B6858] dark:text-[#9C9A8C] hover:text-[#16160F] dark:hover:text-[#F2F1EC] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-all duration-150 cursor-pointer"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {/* Sign In */}
          <Link
            to="/login"
            className="px-3 py-1.5 text-[13px] font-medium text-[#6B6858] dark:text-[#9C9A8C] hover:text-[#16160F] dark:hover:text-[#F2F1EC] transition-colors duration-150"
          >
            Sign In
          </Link>

          {/* Get Started CTA */}
          <Link
            to="/signup"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold rounded-lg bg-[#1B4332] dark:bg-[#3FA873] text-white dark:text-[#0F1210] hover:bg-[#163a2b] dark:hover:bg-[#35926a] transition-all duration-150 shadow-sm hover:shadow-md"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile: Theme + Hamburger */}
        <div className="flex md:hidden items-center gap-1">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-[#6B6858] dark:text-[#9C9A8C]"
          >
            {resolvedTheme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
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
        <div className="md:hidden border-t border-[#E6E3DA]/30 dark:border-[#2A2E29]/30 bg-[#F7F6F2]/95 dark:bg-[#0F1210]/95 backdrop-blur-xl px-4 py-3 space-y-1 animate-fadeIn">
          {navLinks.map((link) => (
            <button
              key={link.label}
              type="button"
              onClick={() => scrollToSection(link.fraction)}
              className="block w-full text-left py-2 text-sm font-medium text-[#16160F] dark:text-[#F2F1EC] hover:text-[#1B4332] dark:hover:text-[#3FA873] transition-colors"
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 border-t border-[#E6E3DA]/30 dark:border-[#2A2E29]/30 flex items-center gap-2.5">
            <Link
              to="/login"
              className="flex-1 py-2.5 text-center text-sm font-medium border border-[#E6E3DA] dark:border-[#2A2E29] rounded-lg text-[#16160F] dark:text-[#F2F1EC]"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="flex-1 py-2.5 text-center text-sm font-semibold bg-[#1B4332] dark:bg-[#3FA873] text-white dark:text-[#0F1210] rounded-lg"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
