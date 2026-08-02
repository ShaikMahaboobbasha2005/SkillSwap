import { Check, CheckCheck } from "lucide-react";

/**
 * Helper to format timestamp cleanly for chat messages without third-party dependencies.
 */
function formatMessageTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  const timeStr = `${formattedHours}:${minutes} ${ampm}`;

  if (isToday) return timeStr;
  if (isYesterday) return `Yesterday, ${timeStr}`;

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${monthNames[date.getMonth()]} ${date.getDate()}, ${timeStr}`;
}

/**
 * MessageBubble Component
 *
 * Renders individual chat message bubble with distinct styling for current user vs counterpart.
 * NO avatar or username is shown above/beside individual message bubbles.
 */
export default function MessageBubble({ message, currentUserId }) {
  if (!message) return null;

  const senderId = message.sender?._id || message.sender?.id || message.sender;
  const isMine = senderId?.toString() === currentUserId?.toString();
  const timeString = formatMessageTime(message.createdAt);

  const status = message.status || "sent";

  return (
    <div
      className={`flex flex-col ${
        isMine ? "items-end" : "items-start"
      } my-1 px-1`}
    >
      {/* Bubble Box */}
      <div
        className={`max-w-[85%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed break-words shadow-2xs ${
          isMine
            ? "bg-[#1B4332] text-white rounded-tr-xs"
            : "bg-white text-[#16160F] border border-[#E6E3DA] rounded-tl-xs"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>

        <div
          className={`flex items-center justify-end gap-1.5 text-[10px] mt-1 select-none ${
            isMine ? "text-white/75" : "text-[#6B6858]"
          }`}
        >
          <span>{timeString}</span>

          {/* Status Ticks for Current User's Outgoing Messages */}
          {isMine && (
            <span className="inline-flex items-center ml-0.5">
              {status === "sent" && <Check className="w-3 h-3 text-white/70" />}
              {status === "delivered" && (
                <CheckCheck className="w-3.5 h-3.5 text-white/75" />
              )}
              {status === "read" && (
                <CheckCheck className="w-3.5 h-3.5 text-emerald-300 font-bold" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
