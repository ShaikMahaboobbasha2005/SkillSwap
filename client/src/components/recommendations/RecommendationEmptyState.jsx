import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, BookOpen, Compass } from "lucide-react";

export default function RecommendationEmptyState() {
  return (
    <div className="bg-white border border-[#E6E3DA] rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-xs">
      <div className="w-14 h-14 rounded-2xl bg-[#E4EEE8] text-[#1B4332] flex items-center justify-center mx-auto mb-4 border border-[#1B4332]/20">
        <Sparkles className="w-7 h-7 text-[#3FA873]" />
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-[#16160F] mb-2">
        No strong matches yet
      </h3>

      <p className="text-xs sm:text-sm text-[#6B6858] leading-relaxed mb-6">
        Try adding more skills you can teach or want to learn to improve your recommendations and connect with ideal swap partners.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/profile"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1B4332] text-white text-xs font-bold rounded-xl hover:bg-[#143326] transition-all shadow-xs cursor-pointer active:scale-[0.98]"
        >
          <BookOpen className="w-4 h-4" />
          <span>Manage My Skills</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        <Link
          to="/discover"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#F7F6F2] text-[#16160F] border border-[#E6E3DA] text-xs font-semibold rounded-xl hover:bg-[#E6E3DA]/60 transition-colors"
        >
          <Compass className="w-4 h-4 text-[#6B6858]" />
          <span>Explore All Skills</span>
        </Link>
      </div>
    </div>
  );
}
