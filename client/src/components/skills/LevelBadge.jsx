export default function LevelBadge({ level = "Intermediate", yearsOfExperience = null }) {
  const getLevelStyle = (lvl) => {
    switch (lvl) {
      case "Beginner":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "Intermediate":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "Advanced":
        return "bg-indigo-50 text-indigo-800 border-indigo-200";
      case "Expert":
        return "bg-purple-50 text-purple-800 border-purple-200";
      default:
        return "bg-[#F7F6F2] text-[#16160F] border-[#E6E3DA]";
    }
  };

  const expLabel =
    yearsOfExperience !== null && yearsOfExperience !== undefined && yearsOfExperience >= 0
      ? ` • ${yearsOfExperience} ${yearsOfExperience === 1 ? "Year" : "Years"}`
      : "";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${getLevelStyle(
        level
      )}`}
    >
      {level}
      {expLabel}
    </span>
  );
}
