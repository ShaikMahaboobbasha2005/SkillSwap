export default function CategoryBadge({ category }) {
  if (!category) return null;

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#E4EEE8] dark:bg-[#1C2E24] text-[#1B4332] dark:text-[#3FA873] border border-[#1B4332]/20 dark:border-[#3FA873]/30">
      {category}
    </span>
  );
}
