export default function CategoryBadge({ category }) {
  if (!category) return null;

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#E4EEE8] text-[#1B4332] border border-[#1B4332]/20">
      {category}
    </span>
  );
}
