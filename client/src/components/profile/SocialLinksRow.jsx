import { Linkedin, Github, Instagram, Youtube, Globe } from "./SocialIcons";

const PLATFORMS = [
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: Linkedin,
  },
  {
    key: "github",
    label: "GitHub",
    icon: Github,
  },
  {
    key: "instagram",
    label: "Instagram",
    icon: Instagram,
  },
  {
    key: "youtube",
    label: "YouTube",
    icon: Youtube,
  },
  {
    key: "website",
    label: "Personal Website",
    icon: Globe,
  },
];

/**
 * Validates whether a URL is a safe http/https web link.
 * Prevents javascript:, data:, vbscript:, and malformed URIs.
 */
const isSafeWebUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

export default function SocialLinksRow({ socialLinks, className = "" }) {
  if (!socialLinks || typeof socialLinks !== "object") return null;

  const validLinks = PLATFORMS.map((p) => {
    const rawUrl = socialLinks[p.key];
    const url = typeof rawUrl === "string" ? rawUrl.trim() : "";
    return {
      ...p,
      url,
      isValid: isSafeWebUrl(url),
    };
  }).filter((item) => item.isValid);

  if (validLinks.length === 0) return null;

  return (
    <div
      className={`flex flex-wrap items-center justify-center sm:justify-start gap-2 ${className}`}
      role="list"
      aria-label="Social links"
    >
      {validLinks.map(({ key, label, icon: Icon, url }) => (
        <a
          key={key}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          role="listitem"
          aria-label={`Visit ${label} (opens in a new tab)`}
          title={label}
          className="w-9 h-9 sm:w-8.5 sm:h-8.5 rounded-xl border border-[#E6E3DA] bg-[#F7F6F2] hover:bg-[#E4EEE8] text-[#6B6858] hover:text-[#1B4332] hover:border-[#1B4332]/40 transition-all flex items-center justify-center shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332] active:scale-95 cursor-pointer"
        >
          <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
        </a>
      ))}
    </div>
  );
}
