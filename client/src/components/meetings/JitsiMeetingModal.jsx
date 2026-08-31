import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PhoneOff, Video, Maximize2, Minimize2, Sparkles, Loader2, AlertCircle } from "lucide-react";

/**
 * Loads the Jitsi Meet External API script once globally
 * @returns {Promise<void>}
 */
const loadJitsiScript = () => {
  return new Promise((resolve, reject) => {
    if (window.JitsiMeetExternalAPI) {
      return resolve();
    }
    const existingScript = document.getElementById("jitsi-external-api-script");
    if (existingScript) {
      existingScript.addEventListener("load", resolve);
      existingScript.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");
    script.id = "jitsi-external-api-script";
    script.src = "https://meet.jit.si/external_api.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Jitsi Meet script."));
    document.body.appendChild(script);
  });
};

/**
 * JitsiMeetingModal Component
 *
 * Provides a responsive, immersive video conference overlay embedded with Jitsi Meet.
 */
export default function JitsiMeetingModal({
  isOpen,
  onClose,
  meetingData,
  currentUser,
}) {
  const containerRef = useRef(null);
  const jitsiApiRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const roomName = meetingData?.roomName;
  const displayName = currentUser?.name || "SkillSwap Member";
  const userEmail = currentUser?.email || "";

  useEffect(() => {
    if (!isOpen || !roomName) {
      if (jitsiApiRef.current) {
        try {
          jitsiApiRef.current.dispose();
        } catch (_) {}
        jitsiApiRef.current = null;
      }
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);

    loadJitsiScript()
      .then(() => {
        if (!isMounted || !containerRef.current) return;

        // Clean up any existing api instance
        if (jitsiApiRef.current) {
          try {
            jitsiApiRef.current.dispose();
          } catch (_) {}
          jitsiApiRef.current = null;
        }

        const domain = meetingData?.jitsiDomain || "meet.jit.si";
        const options = {
          roomName: roomName,
          parentNode: containerRef.current,
          width: "100%",
          height: "100%",
          userInfo: {
            displayName: displayName,
            email: userEmail,
          },
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            enableClosePage: false,
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              "microphone",
              "camera",
              "closedcaptions",
              "desktop",
              "fullscreen",
              "fodeviceselection",
              "hangup",
              "chat",
              "recording",
              "livestreaming",
              "etherpad",
              "sharedvideo",
              "settings",
              "raisehand",
              "videoquality",
              "filmstrip",
              "feedback",
              "stats",
              "shortcuts",
              "tileview",
              "videobackgroundblur",
              "download",
              "help",
              "mute-everyone",
            ],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
          },
        };

        const api = new window.JitsiMeetExternalAPI(domain, options);
        jitsiApiRef.current = api;

        api.addEventListener("videoConferenceJoined", () => {
          if (isMounted) setIsLoading(false);
        });

        api.addEventListener("videoConferenceLeft", () => {
          if (isMounted) onClose();
        });

        api.addEventListener("readyToClose", () => {
          if (isMounted) onClose();
        });

        setIsLoading(false);
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Jitsi initialization failed:", err);
          setLoadError("Unable to initialize video session. Please check your internet connection and try again.");
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
      if (jitsiApiRef.current) {
        try {
          jitsiApiRef.current.dispose();
        } catch (_) {}
        jitsiApiRef.current = null;
      }
    };
  }, [isOpen, roomName, displayName, userEmail, onClose, meetingData]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleHangup = () => {
    if (jitsiApiRef.current) {
      try {
        jitsiApiRef.current.executeCommand("hangup");
      } catch (_) {}
    }
    onClose();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full bg-[#181B18] border border-[#2A2E29] rounded-2xl overflow-hidden shadow-2xl flex flex-col transition-all duration-200 ${
          isFullscreen ? "h-full max-h-full rounded-none" : "h-[92vh] max-w-6xl"
        }`}
      >
        {/* Meeting Modal Header Bar */}
        <div className="px-4 py-2.5 bg-[#0F1210] border-b border-[#2A2E29] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#1B4332] text-white flex items-center justify-center shrink-0">
              <Video className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-extrabold text-white truncate flex items-center gap-2">
                <span>SkillSwap Video Session</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              </h2>
              {meetingData?.note && (
                <p className="text-[11px] text-[#9C9A8C] truncate">
                  "{meetingData.note}"
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Fullscreen toggle button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg text-[#9C9A8C] hover:text-white hover:bg-white/10 transition-colors cursor-pointer hidden sm:flex items-center justify-center"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            {/* Leave / Exit Meeting Button */}
            <button
              type="button"
              onClick={handleHangup}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Leave call and return to chat"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>Leave Call</span>
            </button>
          </div>
        </div>

        {/* Video Area */}
        <div className="relative flex-1 w-full bg-black flex items-center justify-center overflow-hidden">
          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0F1210] text-white z-10">
              <Loader2 className="w-8 h-8 text-[#3FA873] animate-spin" />
              <p className="text-xs sm:text-sm font-semibold text-[#9C9A8C]">
                Connecting to video room…
              </p>
            </div>
          )}

          {/* Error Message */}
          {loadError && (
            <div className="p-6 text-center text-white max-w-md">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <h3 className="text-sm font-bold mb-1">Connection Error</h3>
              <p className="text-xs text-[#9C9A8C] mb-4">{loadError}</p>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Back to Chat
              </button>
            </div>
          )}

          {/* Jitsi iframe container target */}
          <div ref={containerRef} className="w-full h-full" />
        </div>
      </div>
    </div>,
    document.body
  );
}
