export default function LevelBadge({ level = "Intermediate", yearsOfExperience = null }) {
  const getLevelStyle = (lvl) => {
    switch (lvl) {
      case "Beginner":
        return "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800/50";
      case "Intermediate":
        return "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50";
      case "Advanced":
        return "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50";
      case "Expert":
        return "bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-400 border-purple-200 dark:border-purple-800/50";
      default:
        return "bg-[#F7F6F2] dark:bg-[#202520] text-[#16160F] dark:text-[#F2F1EC] border-[#E6E3DA] dark:border-[#2A2E29]";
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
