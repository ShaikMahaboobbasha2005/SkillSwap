import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Compass } from "lucide-react";
import MatchesIcon from "../icons/MatchesIcon";

export default function RecommendationEmptyState() {
  return (
    <div className="bg-white dark:bg-[#181B18] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-xs">
      <div className="w-14 h-14 rounded-2xl bg-[#E4EEE8] dark:bg-[#1C2E24] text-[#1B4332] dark:text-[#3FA873] flex items-center justify-center mx-auto mb-4 border border-[#1B4332]/20 dark:border-[#3FA873]/30">
        <MatchesIcon className="w-7 h-7 text-[#1B4332] dark:text-[#3FA873]" />
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-[#16160F] dark:text-[#F2F1EC] mb-2">
        No strong matches yet
      </h3>

      <p className="text-xs sm:text-sm text-[#6B6858] dark:text-[#9C9A8C] leading-relaxed mb-6">
        Try adding more skills you can teach or want to learn to improve your recommendations and connect with ideal swap partners.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/profile"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1B4332] dark:bg-[#3FA873] text-white dark:text-[#0F1210] text-xs font-bold rounded-xl hover:bg-[#143326] dark:hover:bg-[#338d60] transition-all shadow-xs cursor-pointer active:scale-[0.98]"
        >
          <BookOpen className="w-4 h-4" />
          <span>Manage My Skills</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        <Link
          to="/discover"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#F7F6F2] dark:bg-[#202520] text-[#16160F] dark:text-[#F2F1EC] border border-[#E6E3DA] dark:border-[#2A2E29] text-xs font-semibold rounded-xl hover:bg-[#E6E3DA]/60 dark:hover:bg-[#2A2E29] transition-colors"
        >
          <Compass className="w-4 h-4 text-[#6B6858] dark:text-[#9C9A8C]" />
          <span>Explore All Skills</span>
        </Link>
      </div>
    </div>
  );
}
