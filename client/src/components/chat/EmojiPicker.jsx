import { useState, useRef, useEffect } from "react";
import { Smile, Hand, Heart, Sparkles, Laptop } from "lucide-react";

/**
 * Lightweight, zero-dependency native Unicode EmojiPicker Component.
 *
 * Renders categorized emoji tabs in a compact popover that floats cleanly
 * above the chat composer without page scroll or viewport overflow.
 */

const EMOJI_CATEGORIES = [
  {
    id: "smileys",
    label: "Smileys & Emotions",
    icon: Smile,
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "😉",
      "😌", "😍", "🥰", "😘", "😋", "😛", "😜", "🤪", "🤨", "🧐", "🤓", "😎",
      "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "😣", "😩", "🥺", "😢",
      "😭", "😤", "😠", "😡", "🤯", "😳", "😱", "😨", "😰", "😥", "😓", "🤗",
      "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😴", "🤤",
      "😷", "🤒", "🤕", "🤑", "🤠"
    ],
  },
  {
    id: "gestures",
    label: "People & Gestures",
    icon: Hand,
    emojis: [
      "👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙",
      "👈", "👉", "👆", "🖕", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜",
      "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✍️", "💅", "🤳", "💪", "👀", "🧠",
      "👄"
    ],
  },
  {
    id: "hearts",
    label: "Hearts & Love",
    icon: Heart,
    emojis: [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕",
      "💞", "💓", "💗", "💖", "💘", "💝", "💟", "👥", "🫂", "💑", "💏"
    ],
  },
  {
    id: "activities",
    label: "Activities & Objects",
    icon: Sparkles,
    emojis: [
      "🔥", "✨", "🌟", "💫", "💥", "💦", "💧", "🎉", "🎊", "🎈", "🎁", "🏆",
      "🥇", "🎯", "⚽", "🏀", "🏈", "⚾", "🎾", "🎮", "🕹️", "🎲", "🎨", "🎭",
      "🎬", "🎤", "🎧", "🎵", "🎶"
    ],
  },
  {
    id: "work",
    label: "Work & Skills",
    icon: Laptop,
    emojis: [
      "💻", "🖥️", "📱", "⌨️", "🖱️", "📚", "📖", "✏️", "📝", "📅", "📌", "📍",
      "💡", "🔍", "🛠️", "🔧", "⚙️", "📐", "🧪", "🔬", "🎓", "🚀", "☕"
    ],
  },
];

export default function EmojiPicker({ onSelectEmoji, onClose }) {
  const [activeTab, setActiveTab] = useState("smileys");
  const containerRef = useRef(null);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        if (typeof onClose === "function") onClose();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (typeof onClose === "function") onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const currentCategory =
    EMOJI_CATEGORIES.find((cat) => cat.id === activeTab) || EMOJI_CATEGORIES[0];

  return (
    <div
      ref={containerRef}
      className="absolute right-0 bottom-full mb-2 z-40 w-[min(320px,calc(100vw-24px))] bg-white border border-[#E6E3DA] rounded-2xl shadow-xl p-2 sm:p-2.5 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[260px] overflow-hidden"
    >
      {/* Category Tabs Header */}
      <div className="flex items-center justify-between border-b border-[#E6E3DA] pb-1.5 mb-1.5 shrink-0 gap-1 overflow-x-auto scrollbar-none">
        {EMOJI_CATEGORIES.map((cat) => {
          const IconComp = cat.icon;
          const isActive = activeTab === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveTab(cat.id)}
              title={cat.label}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center justify-center ${
                isActive
                  ? "bg-[#1B4332] text-white"
                  : "text-[#6B6858] hover:text-[#16160F] hover:bg-[#F7F6F2]"
              }`}
            >
              <IconComp className="w-3.5 h-3.5" />
            </button>
          );
        })}
      </div>

      {/* Emoji Grid Container */}
      <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-300">
        <div className="grid grid-cols-7 gap-1 text-center">
          {currentCategory.emojis.map((emoji, index) => (
            <button
              key={`${activeTab}-${index}`}
              type="button"
              onClick={() => onSelectEmoji(emoji)}
              className="h-8 w-8 flex items-center justify-center text-lg sm:text-xl rounded-lg hover:bg-[#F7F6F2] active:scale-95 transition-all cursor-pointer select-none"
              aria-label={`Insert ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
