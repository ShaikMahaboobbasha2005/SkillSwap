import { useState, useEffect } from "react";

function useCountUp(endValue, duration = 1000, isDecimal = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const numericEnd = typeof endValue === "number" ? endValue : parseFloat(endValue) || 0;
    
    if (numericEnd === 0) {
      setCount(0);
      return;
    }

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentCount = easedProgress * numericEnd;

      setCount(currentCount);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    const animFrame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animFrame);
  }, [endValue, duration]);

  if (isDecimal) {
    return count.toFixed(1);
  }
  return Math.floor(count);
}

export default function AnimatedStatCard({ label, value, icon, badgeText, isDecimal = false, isPlaceholder = false }) {
  const animatedValue = useCountUp(value, 1000, isDecimal);

  return (
    <div className="bg-white dark:bg-[#181B18] rounded-2xl border border-[#E6E3DA] dark:border-[#2A2E29] p-5 flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-1 hover:scale-[1.02] transition-all duration-200 group">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6858] dark:text-[#9C9A8C]">
          {label}
        </span>
        <div className="w-9 h-9 rounded-xl bg-[#F7F6F2] dark:bg-[#202520] group-hover:bg-[#E4EEE8] dark:group-hover:bg-[#1C2E24] border border-[#E6E3DA] dark:border-[#2A2E29] group-hover:border-[#1B4332]/30 dark:group-hover:border-[#3FA873]/30 flex items-center justify-center text-[#1B4332] dark:text-[#3FA873] transition-colors shrink-0">
          {icon}
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        {isPlaceholder ? (
          <div className="text-xl font-extrabold tracking-tight text-[#1B4332] dark:text-[#3FA873]">
            Coming Soon
          </div>
        ) : (
          <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#16160F] dark:text-[#F2F1EC]">
            {animatedValue}
          </div>
        )}

        {badgeText && (
          <span className="text-[10px] font-semibold text-[#6B6858] dark:text-[#9C9A8C] bg-[#F7F6F2] dark:bg-[#202520] px-2 py-0.5 rounded-full border border-[#E6E3DA] dark:border-[#2A2E29]">
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
}
