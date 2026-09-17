# Design.md — SkillSwap

## 1. Design Philosophy
The visual system is anchored to **Linear** — clean typography, generous whitespace, subtle borders, restrained color usage. Other product inspirations below are borrowed **only for layout and interaction patterns**, never for their own colors, fonts, or shadow styles. This keeps the app visually cohesive instead of looking like a patchwork of six different products.

**Rule of thumb:** if it's about *how something is structured or behaves*, borrow it. If it's about *color, type, or shadow*, it comes from SkillSwap's own system below.

## 2. Inspiration Reference

| Feature | Inspiration | What's actually borrowed |
|---|---|---|
| Entire Design System | Linear | Typography scale, spacing rhythm, subtle borders over heavy shadows, minimal color use |
| Profile | GitHub + LinkedIn | Layout structure: avatar + stats row + activity/skills sections beneath |
| Search | Airbnb | Filter bar placement, result-card grid layout |
| Chat | Discord | Message grouping, sidebar-style room list, timestamp placement |
| Portfolio | Instagram | Grid layout, tap-to-expand lightbox interaction |
| Forms | Notion | Inline, minimal-chrome form fields; clear field grouping |
| Notifications | GitHub | Dropdown/bell icon pattern, list grouped by recency |
| Cards | Linear | Flat cards, thin border instead of drop shadow, consistent padding |
| Typography | Linear | Type scale and weight hierarchy (see below) |
| Settings | Notion | Sidebar-navigated settings sections |

## 3. Color Palette

**Light mode**
| Token | Hex | Use |
|---|---|---|
| bg | `#F7F6F2` | Page background |
| surface | `#FFFFFF` | Cards, panels |
| border | `#E6E3DA` | Dividers, card borders |
| ink | `#16160F` | Primary text |
| ink-muted | `#6B6858` | Secondary text |
| accent (pine) | `#1B4332` | Primary actions, links, active states |
| accent-soft | `#E4EEE8` | Accent backgrounds, subtle highlights |
| gold | `#B8860B` | Ratings/stars only — never used for general UI |

**Dark mode**
| Token | Hex |
|---|---|
| bg | `#0F1210` |
| surface | `#181B18` |
| border | `#2A2E29` |
| ink | `#F2F1EC` |
| ink-muted | `#9C9A8C` |
| accent | `#3FA873` |
| accent-soft | `#1C2E24` |
| gold | `#D4A017` |

## 4. Spacing Tokens
```
xs  = 4px
sm  = 8px
md  = 16px
lg  = 24px
xl  = 32px
2xl = 48px
```
Maps directly to Tailwind's spacing scale — keeps padding/margin consistent across every component instead of ad-hoc values.

## 5. Border Radius Tokens
```
Cards:   16px
Buttons: 10px
Inputs:  10px
Badges:  fully rounded
Avatar:  fully circular
```

## 6. Typography (Linear-inspired)
- **Headings**: sans-serif, semi-bold to bold, tight letter-spacing, clear size hierarchy (e.g. 32/24/18/16px scale)
- **Body**: sans-serif, regular weight, comfortable line-height (~1.5)
- **Wordmark exception**: the SkillSwap logo/wordmark uses a serif typeface (Georgia) as a deliberate one-off brand accent — the rest of the app stays sans-serif

## 7. Component Patterns

**Cards** (Linear) — flat surface, 1px `border` token, consistent internal padding, no heavy drop shadows; hover state is a subtle border-color shift, not elevation.

**Profile Page** (GitHub + LinkedIn layout) — pfp + banner + name + location at top, short bio, clean horizontal social links icon button row (`SocialLinksRow` featuring accessible LinkedIn, GitHub, Instagram, YouTube, and Website icon buttons with Pine Green `#1B4332` hover states and safe `_blank` navigation), stats row (avg rating, completed swaps) beneath, independent collapsible skills-offered/wanted sections (initially displaying first 2 cards with header chevron and dynamic `+X more skills` / `Show less` toggles when ≥3 skills), portfolio preview section (`PortfolioSection`), and reviews & ratings list (`ReviewsSection`). If a user has no social links, no empty icon placeholders are rendered.

**Search** (Airbnb layout) — persistent filter bar at top (skill search input), result cards in a responsive grid below, card shows pfp, name, location, top skills, rating.

**Chat** (Linear + SkillSwap Pine identity) — Two-panel desktop layout (sidebar list + active workspace) utilizing full remaining viewport height (`h-[100dvh]`) below Navbar. Left sidebar features a compact real-time conversation search bar matching by counterpart name or offered/wanted skills. Compact header and composer paddings maximize vertical message thread space. No avatars/usernames on individual message bubbles (identity in header/sidebar). Incoming messages left-aligned with white background; outgoing messages right-aligned with Pine `#1B4332` surface. Message status indicators: sent `✓`, delivered `✓✓`, read `✓✓` (emerald accent). Message input uses single container focus border with shift+enter multiline support and focus retention after sending. Floating scroll-to-bottom pill button with real-time incoming message counter appears when scrolled up. WhatsApp-style centered date boundary pills (`DateSeparator`) group messages by local calendar day ("Today", "Yesterday", "D MMMM YYYY"), with individual `MessageBubble` timestamps displayed inline (`h:mm A`) at the bottom-right of message content to maximize thread compactness and eliminate unnecessary vertical bubble height on mobile. Primary Accept modal button uses Pine Green `#1B4332`; red reserved for destructive actions (Reject/Cancel).

**Integrated Video Meetings & Swap Session Scheduling** (Phase 10.3) — Integrated directly into the chat workspace (no separate Meetings page):
- **Header Action Trigger (`ChatHeader`)**: When `swap.status === "accepted"` and not read-only, a discrete Video Call action button (`<Video />`) renders in the right header action bar. Clicking it opens `MeetingOptionsModal`.
- **Options Modal (`MeetingOptionsModal`)**: Presents two clear actions: "Start Video Call Now" (instant session with emerald badge) and "Schedule for Later" (calendar icon leading to date/time scheduler).
- **Session Scheduler (`ScheduleMeetingModal`)**: Clean, responsive modal with Date (min: today), Time, Duration selector (15, 30, 45, 60 mins), and optional Session Topic/Goal text input (300 chars max) with Pine Green `#1B4332` submit action.
- **In-Chat Meeting Cards (`MeetingMessageCard`)**: Rendered directly in the message stream with Linear-inspired styling. Shows Video Session header, scheduled date & time with relative badges ("Starts in 10 mins", "Live / Ready", "Completed", "Cancelled"), topic quote, and prominent `[ Join Call Now ]` button alongside an inline `[ Cancel ]` trigger with confirm state for participants.
- **Embedded Video Overlay (`JitsiMeetingModal`)**: High-contrast dark modal overlay (`#181B18`) utilizing Jitsi Meet External API with custom toolbar controls, loading spinner, connection error handling, full-screen toggle, and red `[ Leave Call ]` button that cleanly disposes the session and returns the user back to the chat.

**Navbar & Mobile Navigation** — Sticky top bar with logo, main links (Home, Discover Skills, Matches [`MatchesIcon` - circular connection orbit], Swap Requests, Chats with real-time numeric badges), and clean avatar trigger. Dedicated 5-item mobile bottom navigation bar (`MobileBottomNav` with Home, Matches [`MatchesIcon`], Discover, Swaps, Chats). Desktop profile dropdown is simplified to My Profile, Settings (placeholder), divider, and Logout (red styling).

**Core Iconography System (Phase 11.2)** — Standardized, reusable vector icon components (`client/src/components/icons/`):
- **Offered Skill Icon (`OfferedSkillIcon`)**: Line art hand holding/presenting document with pencil. Used for Skills Offered, offering sections, and swap offered context.
- **Wanted / Requested Skill Icon (`WantedSkillIcon`)**: Line art hand holding document sheets with bookmark. Used for Skills Wanted, requested skills, and swap requested context. Visually paired with `OfferedSkillIcon`.
- **Matches Icon (`MatchesIcon`)**: Standardized on a 24x24 vector grid with Lucide-compatible stroke styling (`strokeWidth={2}`, overridable via Tailwind `stroke-[...]`). Features two upright user profile nodes in reciprocal circular connection orbit with directional flow arrowheads. Guarantees optical balance and matching bold stroke weight alongside `Home`, `Compass`, `Handshake`, and `MessageSquare` in both desktop navbar and mobile bottom nav. Replaces previous generic Sparkles icon.

**Personal Dashboard (Phase 12.1)** — Actionable, editorial SaaS home experience answering "What's happening with my SkillSwap account right now?":
- **Welcome & Hero (`DashboardHero`)**: Flat white surface (`#FFFFFF`), 1px border (`#E6E3DA`), 16px radius (`rounded-2xl`), uppercase pine badge (`DASHBOARD`), real authenticated name greeting, and a 4-button quick action toolbar (Discover Skills, View Matches, Swap Requests, My Profile).
- **Snapshot Metrics (`DashboardStats`)**: 5-card responsive metric row (Skills Offered with `OfferedSkillIcon`, Skills Wanted with `WantedSkillIcon`, Active Swaps with `MessageSquare`, Completed Swaps with `Trophy`, Average Rating with gold `Star`). Each card provides deep links directly to relevant management tabs.
- **2-Column Operational Grid**:
  - **Left Column (Operational Workflows)**: Active Swaps (`ActiveSwapsSection`) with partner avatars, reciprocal exchange chips (`OfferedSkillIcon` ↔ `WantedSkillIcon`), and direct `[ Open Chat → ]` action; Recommended Matches (`RecommendedMatchesSection`) showing top match previews, compatibility scores, and quick profile links.
  - **Right Column (Triage & Feed)**: Pending Requests (`PendingRequestsSection`) clearly distinguishing incoming (`bg-[#E4EEE8] text-[#1B4332]`) vs outgoing (`bg-[#F7F6F2] text-[#6B6858]`) requests with status chips and highlight deep-links; Recent Activity (`RecentActivitySection`) rendering the top 5 notification events via `NotificationItem compact={true}` with full deep-linking.
- **Empty States**: Every section implements dedicated, helpful empty states with custom icons and targeted call-to-action buttons. Stacks into a clean single-column layout on mobile viewports with centralized safe-area bottom clearance.

**Recommendations & Matches** (Linear + SkillSwap Pine identity) — Dedicated authenticated matching page (`/recommendations` / `/matches`) with 3-column desktop, 2-column tablet, and 1-column mobile grid.
- **Mode Toggle & Header Controls**: Compact header with subtitle ("Find people to learn from and skills to share.") and an inline pill switcher (`[ All Matches ]` [`MatchesIcon`] / `[ AI Recommendations ]` [`Sparkles`]) allowing users to seamlessly toggle between default fast matches and optional AI-enhanced recommendations without page navigation. When AI mode is active, a sleek status bar explains the domain matching with a direct "← Back to All Matches" button. Non-blocking alerts notify the user if AI is temporarily unavailable without breaking the page.
- **Compact Card Structure (`RecommendationCard`)**: Flat surface (`#FFFFFF`), 1px border (`#E6E3DA`), 12px radius (`rounded-xl`), optimized padding (`p-3.5 sm:p-4`), and zero unnecessary vertical space. Header features a 40px avatar, real display name, combined inline location + star rating + swap count meta row, compatibility score pill with `MatchesIcon`, and a sleek 1px progress bar.
- **Mutual Match Treatment**: When `mutualMatch === true`, displays a compact top Pine Green `#E4EEE8` banner with `ArrowLeftRight` icon (`Mutual Skill Match • Two-way Exchange`) and subtle accent ring (`ring-1 ring-[#1B4332]/10`).
- **Skill Exchange Flow**: Compact partitioned badges for "They Can Teach You" (green-tinted `#E4EEE8` chips with `OfferedSkillIcon`), "You Can Teach Them" (neutral `#F7F6F2` chips with `WantedSkillIcon`), and "Related Category Interests" (when no direct match exists).
- **Match Reasons & AI Insights**: Compact, tight line-height reason items. Deterministic reasons render with standard green checkmark (`CheckCircle2`). In AI mode, concise semantic reasons render with a sparkling icon (`Sparkles`), highlighted ink, and an inline `AI` badge, with an expandable `+X more` toggle.
- **Card Actions**: Compact bottom row with primary "View Profile" link (`/profile/:id`) and secondary "Request Swap" action opening `SwapRequestModal`.
- **Skeleton & Empty States**: Pulsing skeleton grid matching the compact card layout and friendly empty state (`MatchesIcon`) with direct "Manage My Skills" profile action (or "Back to All Matches" in AI mode).

**Portfolio** (Instagram layout) — 3-column grid on desktop/tablet, 2-column on mobile, square thumbnails, tap opens a lightbox with caption and linked skill tag. Optimistic upload cards render immediately upon selection with local preview, semi-transparent backdrop overlay (`bg-black/65`), live percentage text (`Uploading... X%`), and smooth progress bar using Pine accent token (`#3FA873`). Transitions to `Processing video...` / `Processing media...` when bytes reach 100% until Cloudinary confirms. Failed uploads render an `Upload failed` overlay with accessible `[ Retry ]` (Pine Green `#1B4332`) and `[ Remove ]` buttons.

**Portfolio Reactions** — Confirmed portfolio items display a minimal, subtle reaction indicator on thumbnail bottom-left (e.g. `🔥 👍 12`) when total reactions > 0. Inside `PortfolioLightbox`, users interact with an elegant, modern **Appreciate system**:
- **Default State**: Compact `✨ Appreciate` trigger button with Pine accent (`#1B4332`), or active selected chip (`🔥 Impressive`) with soft Pine glow.
- **Reaction Burst**: Clicking the trigger playfully expands a staggered animated burst of 4 reactions (`👍 Like`, `🔥 Impressive`, `👏 Great Work`, `💡 Creative`) with scale-up, bounce pop, and smooth collapse upon selection.
- **Reaction Summary**: When total reactions > 0, renders below the trigger as overlapping circular reaction bubbles (`◯🔥 ◯👍 ◯👏  12 reactions →`) that gently spread apart on hover.
- **Who Reacted Modal**: Clicking the reaction summary opens `PortfolioReactionsModal` as an overlay above the active lightbox, displaying filter tabs (`All`, `🔥`, `👍`, `👏`, `💡`) and clickable user rows with real avatars, usernames, subtitles (location), and reaction badges that navigate directly to user profiles. Temporary uploading and failed cards are strictly isolated from reactions.

**Portfolio Undo & Moderation** —
- **5-Second Undo Toast**: When an owned portfolio item is edited or deleted, a non-blocking toast renders at fixed top-right with `#FFFFFF` background, `#E6E3DA` border, `#16160F` ink, `#1B4332` Pine action button, visible `5s` countdown ticker, and `#3FA873` smooth linear progress bar. Clicking `[ Undo ]` restores the previous caption/skill state for edits or restores the temporarily-hidden item for deletes. If 5 seconds elapse without Undo, deletions permanently finalize database and Cloudinary asset removal. Respects `prefers-reduced-motion`.
- **Report System & Modal**: Visitors viewing another user's portfolio media in `PortfolioLightbox` can trigger a visually secondary `[ Report ]` action opening `PortfolioReportModal` with 7 radio categories (`nudity`, `violence`, `illegal`, `hate_harassment`, `spam`, `copyright`, `other`), optional 500-char explanation, character counter, and duplicate protection. Owner items never display report controls.

**Forms & Modals** (Notion layout) — minimal borders, label above field, inline validation messages, grouped sections with subtle dividers rather than boxed panels. Request Skill Swap modal allows selecting any active offered skill belonging to the recipient user alongside requester's offered skill, preserving initial pre-selected skill as default.

**Notifications & Notification Center (Phase 11.1)** — Linear & GitHub-inspired notification experience:
- **Navbar Notification Bell (`NotificationBell`)**: Interactive bell trigger in the desktop navigation bar and mobile header. Features a floating Pine Green `#1B4332` unread badge (with white text and subtle ping/pulse) that updates in real time and hides when `unreadCount === 0`.
- **Popover Dropdown Panel**: Clicking the bell opens an accessible floating popover (`w-80 sm:w-96`, rounded-2xl, shadow-xl) with a header bar (unread count badge, quick "Mark all as read" button), recent activity stream (top 6 items with relative timestamps and type badges), skeleton loading state (`NotificationSkeleton`), friendly empty state (`Inbox` icon), and a "View all notifications →" footer link. Accessible via keyboard Escape dismissal and click-outside handling.
- **Notification Item (`NotificationItem`)**: Rich notification rows with distinct type icons (`Handshake` for swap requests, `CheckCircle2` for acceptances, `XCircle` for declines, `UserMinus` for departures, `Clock` for completion requests, `Trophy` for completed swaps, `Video` for video sessions, `Bell` for reminders, `Star` for reviews), sender avatar with fallback initial, title, message body, relative time ("Just now", "2m ago", "1h ago", "Yesterday", "MMM D"), unread accent border (`border-l-4 border-l-[#1B4332]`) and unread indicator dot. Clicking a notification marks it as read and automatically routes to the relevant destination (`/swaps`, `/swaps/:swapId/chat`, `/profile`). Includes an inline checkmark button for quick mark-read.
- **Dedicated Notifications Page (`NotificationsPage` at `/notifications`)**: Full-page notification center featuring page title with total unread pill, All / Unread filter tabs, bulk "Mark all as read" action, load more pagination, pulsing skeleton loaders, and empty/error states.


**Settings** (Notion layout) — left sidebar with section links (Account, Privacy, Notifications), content panel on the right.

## 8. Responsive Behavior
- **Desktop (≥1024px):** multi-column layouts (search grid, chat sidebar + thread)
- **Tablet (768–1023px):** reduced grid columns, sidebar patterns collapse to a toggle where needed
- **Mobile (<768px):** single-column stacking, chat room list (`/chats`) and active chat thread (`/swaps/:swapId/chat`) render on separate views with an explicit header back arrow link. Expanded hamburger menu renders a compact stacked list (Home, Discover Skills, Swap Requests [badge right], Chats [badge right], My Profile, subtle Logout divider) closing automatically upon navigation. Portfolio grid drops to 2 columns.

## 9. Accessibility Notes
- Maintain sufficient contrast between `ink`/`ink-muted` and `bg`/`surface` per WCAG AA
- Gold (`#B8860B` / `#D4A017`) reserved strictly for ratings — never used as a primary interactive color, avoiding confusion with action buttons
