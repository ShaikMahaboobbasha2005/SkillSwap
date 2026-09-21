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
- Maintain sufficient contrast between `ink`/`ink-muted` and `bg`/`surface` per WCAG AA (≥ 4.5:1 for normal text, ≥ 3:1 for large text and UI components)
- Gold (`#B8860B` / `#D4A017`) reserved strictly for ratings — never used as a primary interactive color, avoiding confusion with action buttons
- Interactive surfaces in dark mode provide high contrast focus rings (`focus-visible:ring-2 focus-visible:ring-[#3FA873]`)

## 10. Dark Mode System Architecture & Specifications (Phase 12)

### 10.1 Theme Tokens & Color Palette
Dark mode preserves SkillSwap's classy, minimal, and premium aesthetic through carefully balanced warm charcoal tones and restrained Pine Green accents:

| Token | Light Hex | Dark Hex | Role / Implementation |
|---|---|---|---|
| Background (`bg`) | `#F7F6F2` | `#0F1210` | Deep warm charcoal page backdrop |
| Surface / Cards (`surface`) | `#FFFFFF` | `#181B18` | Elevated card surfaces, panels, modals |
| Elevated Surfaces | `#F7F6F2` | `#202520` | Secondary surfaces, input fields, dropdown menus |
| Interactive / Hover | `#E4EEE8` | `#242A24` / `#2A2E29` | Item hover states, pressed states, active chips |
| Borders / Dividers | `#E6E3DA` | `#2A2E29` | Crisp, low-contrast 1px architectural dividers |
| Primary Ink (`ink`) | `#16160F` | `#F2F1EC` | High-contrast off-white body text and headings |
| Muted Ink (`ink-muted`) | `#6B6858` | `#9C9A8C` | Secondary metadata, dates, labels, counters |
| Accent (Pine Green) | `#1B4332` | `#3FA873` | Interactive buttons, badges, highlights |
| Accent Soft (Badges) | `#E4EEE8` | `#1C2E24` | Green badge backgrounds with `#3FA873`/30 borders |
| Rating Gold | `#B8860B` | `#B8860B` | Strictly reserved for star ratings across both themes |

### 10.2 Technical Implementation & Anti-FOUC Architecture
1. **Synchronous Anti-FOUC Script (`index.html`)**:
   An inline `<script>` tags executes inside `<head>` synchronously prior to CSS parsing or React mounting:
   - Reads `localStorage.getItem("skillswap_theme") || "system"`
   - If `"dark"`, or if `"system"` and `window.matchMedia("(prefers-color-scheme: dark)").matches`, immediately adds the class `.dark` to `document.documentElement` (`<html>`).
   - Prevents white flashing on page refreshes and initial page loads.
2. **Tailwind CSS v4 Custom Variant (`index.css`)**:
   Declared `@custom-variant dark (&:where(.dark, .dark *));` to ensure `.dark` class targeting applies universally across nested components and React Portals.
3. **Reactive System Listener (`ThemeContext.jsx`)**:
   When set to `"system"`, a media query listener `window.matchMedia("(prefers-color-scheme: dark)")` listens for OS-level theme changes in real time and toggles the `dark` class automatically without user reload.
4. **Settings Page Appearance Selector (`SettingsPage.jsx`)**:
   Replaced "Coming soon" tiles with real interactive buttons for `System`, `Light`, and `Dark`. Displays active selection indicators, live preview feedback, and persists selection instantly to `localStorage`.
5. **Portalled Modals & Overlays**:
   All modals (`Modal.jsx`, `ConfirmModal.jsx`, `ImageCropModal.jsx`, `AvatarLightboxModal.jsx`, `SkillModal.jsx`, `DeleteSkillDialog.jsx`, `SwapRequestModal.jsx`, `RatingModal.jsx`, `MeetingOptionsModal.jsx`, `ScheduleMeetingModal.jsx`, `JitsiMeetingModal.jsx`, `PortfolioUploadModal.jsx`, `PortfolioEditModal.jsx`, `PortfolioReactionsModal.jsx`, `PortfolioReportModal.jsx`) inherit `.dark` from `document.documentElement`, ensuring zero theme mismatches.
6. **Authentication & Loading Gates**:
   Protected route verification screen (`ProtectedRoute.jsx`) is fully theme-aware, utilizing `ThemeContext` and Tailwind dark mode tokens (`dark:bg-[#0F1210]`, `dark:border-[#3FA873]`, `dark:text-[#F2F1EC]`). Paired with the synchronous `<head>` script in `index.html`, this eliminates white flashing during initial auth verification and page reloads.

## 11. Motion Foundation & Micro-Interactions (Phase 13.2)

### 11.1 Motion Principles
- **Restrained & Intentional**: Motion exists strictly to orient users, communicate state transitions, and provide tactile interactive feedback. No continuous decorative bouncing or distracting loops.
- **Compositor-Only Properties**: Animations animate only `opacity`, `transform` (`translateY`, `scale`), `box-shadow`, and `border-color`. Never animate layout triggers (`width`, `height`, `margin`, `padding`, `top`, `left`, grid dimensions) to guarantee 60fps across desktop and mobile.
- **Linear-Inspired Easing**: Smooth decelerated ease-out curves (`cubic-bezier(0.16, 1, 0.3, 1)`) with calibrated movement distances (14px page, 12px section, 3px tab).
- **Navigation Lifecycle Synchronization**: Page entrance animations are triggered reliably across client-side router navigation (`Home` → `Discover` → `Matches` → `Swaps` → `Chats` → `Profile` → `Settings`) using React route keys (`key={location.pathname}`).

### 11.2 Keyframe & Utility Tokens (`index.css`)
- **Page Entrance (`.animate-page-enter`)**: `opacity: 0 -> 1`, `translateY: 14px -> 0`, `420ms cubic-bezier(0.16, 1, 0.3, 1)` with `animation-fill-mode: both`. Applied to top-level `<main>` page containers.
- **Section Entrance (`.animate-section-enter`)**: `opacity: 0 -> 1`, `translateY: 12px -> 0`, `380ms cubic-bezier(0.16, 1, 0.3, 1)` with `animation-fill-mode: both`. Applied to primary cards and layout sections.
- **Progressive Staggers**:
  - `.stagger-1`: `animation-delay: 60ms`
  - `.stagger-2`: `animation-delay: 120ms`
  - `.stagger-3`: `animation-delay: 180ms`
  - `.stagger-4`: `animation-delay: 240ms`
  - All stagger classes enforce `animation-fill-mode: both` to prevent initial content popping and retain the 100% visible completion state.
- **Dropdown & Popover Entrance (`.animate-dropdown-enter`)**: `opacity: 0 -> 1`, `scale: 0.96 -> 1`, `translateY: -6px -> 0`, `190ms cubic-bezier(0.16, 1, 0.3, 1)` with `animation-fill-mode: both; transform-origin: top right`. Applied to navbar user dropdown, notification bell popover, avatar contextual menus, and emoji pickers without transform matrix conflicts.
- **Tab Panel Transition (`.animate-tab-fade`)**: `opacity: 0 -> 1`, `translateY: 3px -> 0`, `200ms cubic-bezier(0.16, 1, 0.3, 1)` with `animation-fill-mode: both`. Applied to tab content sections with contextual keys to transition tab content without full-page re-renders.
- **Subtle Pulse (`.animate-subtle-pulse`)**: Gentle breathing animation (`opacity: 1 -> 0.65 -> 1`) across 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite.

### 11.3 Interaction Tokens
- **Interactive Card Lift (`.motion-card-interactive`)**: `transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s, border-color 0.2s`, `hover:-translate-y-0.5 hover:shadow-md`, `active:scale-[0.99]`. Applied to dashboard widgets, quick actions, discover cards, recommendation cards, and swap cards.
- **Tactile Button Click (`.motion-btn-interactive`)**: `transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s, border-color 0.15s, color 0.15s, box-shadow 0.15s`, `active:scale-[0.98]`. Standard tactile micro-feedback on primary actions and icon buttons.

### 11.4 Reduced Motion Compliance
All motion utilities respect user accessibility settings via `@media (prefers-reduced-motion: reduce)`. Durations and delays automatically collapse to `0.01ms` with `animation-delay: 0s !important` and `scroll-behavior: auto !important`, ensuring an accessible, motion-free experience for users with vestibular sensitivities.

### 11.5 Animated Hero System (Phase 13.3)
- **Concept & Purpose**: The SkillSwap Animated Hero visually communicates the platform's core exchange mechanic: `LEARN ↔ SHARE`. Embedded seamlessly into `DashboardHero.jsx` on the Home dashboard without disrupting existing user identity or quick actions.
- **Hierarchy & Staggered Timing (<650ms total entrance)**:
  - `Identity Cue`: 0ms (`.animate-hero-fade-up`, `.hero-delay-0`, translateY 10px -> 0)
  - `Headline`: 60ms (`.animate-hero-fade-up`, `.hero-delay-1`, translateY 10px -> 0)
  - `Description`: 120ms (`.animate-hero-fade-up`, `.hero-delay-2`, translateY 10px -> 0)
  - `Skill Exchange Visual`: 180ms
    - Offered Skill Card (`.animate-hero-slide-left`, `.hero-delay-3`, translateX -14px -> 0)
    - Center Exchange Arrow (`.animate-hero-exchange-in`, `.hero-delay-3`, scale 0.92 -> 1, with calm 4s ambient breathing `.animate-hero-pulse`)
    - Wanted Skill Card (`.animate-hero-slide-right`, `.hero-delay-3`, translateX 14px -> 0)
  - `Quick Actions Grid`: 240ms–300ms (`.hero-delay-4`, `.hero-delay-5`, staggered micro-entrances)
- **Dynamic Content & Iconography**: Integrates real user skills dynamically from `skillsList` and renders official `OfferedSkillIcon` and `WantedSkillIcon` with graceful fallback links to `/profile` and `/discover`.
- **Restrained Ambient Idle**: Single calm 4s breathing cycle (`.animate-hero-pulse`) on the central swap badge. Zero bouncing, spinning, or continuous distracting scaling.
- **Theme & Responsiveness**: Fully integrated with Light (`#F7F6F2` / `#FFFFFF` / `#1B4332`) and Dark (`#0F1210` / `#181B18` / `#3FA873`) themes. Verified zero horizontal overflow across 320px, 375px, 414px, 768px, and 1024px+ viewports.

## 12. Premium 3D Landing Page Architecture (Phase 13.3 Redesign)

### 12.1 Philosophy & Design Direction
The public landing page (`LandingPage.jsx`) at `/` serves as the pre-login entry for unauthenticated visitors. Designed to feel like a premium SaaS product page (inspired by the visual restraint of Linear, Stripe, Apple, Vercel), not a Three.js demo. The 3D scene supports the product story rather than dominating it. Typography is dominant; 3D is atmospheric.

**Visual identity**: Monochromatic palette (charcoal, matte white, warm off-white) with SkillSwap emerald as a restrained accent. No rainbow colors, no candy-colored primitives, no excessive glow.

### 12.2 Three.js Cinematic Engine (`Cinematic3DScene.jsx`)
- **Persistent WebGL Canvas**: Single full-viewport canvas (`fixed inset-0`) with ACES Filmic tone mapping, PCF soft shadows (desktop), fog (`FogExp2`), and cinematic studio multi-point lighting (warm key light, cool emerald fill, rim light, center accent glow).
- **Minimal Abstract Cylindrical Avatars**:
  - **Sculptural Geometry**: Two elegant, minimal 3D forms representing two people exchanging knowledge. Each avatar consists of a sleek rounded capsule body (`CapsuleGeometry`), a metallic separation accent ring (`CylinderGeometry`), a smooth upper head dome (`SphereGeometry`), an inner luminescent core sphere (`SphereGeometry`), and a soft base contact shadow disc.
  - **Person A**: Sleek deep-slate/charcoal profile (`radius: 0.155, length: 0.52`, `roughness: 0.72, metalness: 0.12`), emerald separation accent ring (`metalness: 0.65, roughness: 0.35`), and an emerald inner luminous core (`emissive: 0x1a4030`).
  - **Person B**: Warm graphite profile (`radius: 0.170, length: 0.46`, `roughness: 0.72, metalness: 0.12`), warm gold separation accent ring, and an amber-gold inner luminous core (`emissive: 0x5a4a08`).
  - **PBR Studio Quality**: Pure architectural forms with zero literal anatomy, facial features, or clothing. Grounded on the shadow plane ($y = -0.65$) with soft contact shadows.
  - **Subtle Motion**: Vertical harmonic floating oscillation (`Math.sin(time * 0.8) * 0.02`), subtle respiration breathing scale (`1 + Math.sin(time * 1.2) * 0.008`), gentle axial rotation, and inward tilt during Match/Exchange.
- **Unified Skill Capsules** (6 skills desktop / 4 on mobile):
  - All use the same beveled `BoxGeometry` capsule shape with `MeshPhysicalMaterial` (frosted, `clearcoat: 0.3`, `transmission`-enabled).
  - Clean Inter font labels rendered via `CanvasTexture` sprites.
  - Mobile: Python and JavaScript hidden to reduce visual clutter; exchanging skills (React, Figma) and representative skills (Node.js, UI/UX) preserved.
  - Hover (desktop only): subtle scale 1.06x + faint emissive glow.
- **Depth Layers** (foreground/midground/background):
  - Background: 8 subtle distant spheres (4 on mobile) at z=-3 to -7, low opacity, for depth perception.
  - Foreground (desktop): 5 tiny near-camera motes at z=2 to 4 for parallax depth.
  - Midground: human characters and skill capsules at z=0.
- **Continuous 5-Stage Scroll Choreography** ($0.0 \to 1.0$):
  - **0% (Discover)**: Characters wide apart ($x=\pm 2.6$ desktop / $\pm 1.45$ mobile), skill capsules orbit slowly near their owners.
  - **25% (Match)**: Characters smoothly rotate toward each other, thin luminous connection arc fades in, center glow intensifies.
  - **50% (Exchange)**: React & Figma travel along smooth cubic Bezier curves with 8-particle emerald trails as characters observe trajectory.
  - **75% (Learn)**: Exchanged skills settle near new owners, collaborative pulse ring activates.
  - **100% (Grow)**: Camera pulls back; constellation of miniature stylized 3D human figures on pedestals appears with interconnected network lines.
- **Mobile Responsive Composition** (< 768px):
  - Wider FOV (50° vs 40° desktop) with dedicated camera waypoints closer to the scene.
  - Characters brought closer together ($x=\pm 1.45$ wide → $\pm 0.45$ settle) and offset downward (`y-0.22`) to leave room for hero text.
  - Shadows disabled, antialiasing disabled, pixel ratio capped at 1.5× for mobile GPU performance.
  - Reduced particle counts (12 dust, 4 background nodes, 0 foreground motes, 6 community figures).
  - Raycasting and pointer parallax disabled on touch devices.
  - `touchAction: pan-y` on canvas for proper scroll passthrough.
- **Tablet Composition** (768–1024px): Intermediate FOV (44°), halved parallax intensity.
- **Performance & Polish**: Shadow map bias optimization, resource disposal, no GC pressure in loop, target smooth 60fps.
- **Accessibility**: Full `prefers-reduced-motion` compliance — disables respiration, head drift, camera parallax, and continuous particle rotation.

### 12.3 Product Storytelling Overlay (`LandingSpatialHUD.jsx`)
- **Hero Section (0%–12%)**: Full-viewport centered typography with Inter font headline:
  - Eyebrow: `THE PEER-TO-PEER SKILL NETWORK` (11px, tracking-wide, muted)
  - Headline: `Share What You Know. / Master What You Do.` (4xl–7xl, bold, emerald accent on second line)
  - Supporting copy: `Exchange skills with people who want to learn what you know — and teach you what you want to master.`
  - Primary CTA: `Start Swapping Free →` (emerald button)
  - Secondary CTA: `Explore How It Works` (ghost button with backdrop blur)
  - Bottom cue: `Scroll to explore` (subtle, no bouncing animation)
- **Scroll Annotations (12%–85%)**: Minimal lower-left floating text — tiny emerald dot + stage tag (`DISCOVER`, `MATCH`, `EXCHANGE`, `LEARN`, `GROW`) + one-line product copy. Match stage shows an integrated `92% / Skill Compatibility` badge. No stage navigation bar, no depth counter, no hover indicators.
- **Terminal CTA (85%+)**: Glassmorphic conversion card with `Ready to exchange your craft?` headline, `Start Swapping Free →` + `Sign In` CTAs, framed by the community network above.

### 12.4 Landing Navbar (`LandingNavbar.jsx`)
- Translucent (`bg/60`, `backdrop-blur-xl`), thin border (`border/30`), `h-14`.
- Left: Logo + "SkillSwap" wordmark.
- Center: `How it works` / `The Exchange` / `Community` (scroll-to-section buttons).
- Right: Theme toggle, `Sign In` link, `Get Started` CTA button.
- Mobile: Hamburger drawer with same links and auth CTAs.

### 12.5 Routing & Auth Separation (`App.jsx`)
- `RootRoute` intelligently dispatches `/`:
  - If `isAuthenticated`: Renders `<Home />` (authenticated dashboard with `Navbar`, `DashboardHero`, and `MobileBottomNav`).
  - If `!isAuthenticated`: Renders `<LandingPage />` (premium 3D product landing).
  - If `loading`: Renders theme-aware verification spinner with zero FOUC.
- All protected routes (`/discover`, `/swaps`, `/chats`, etc.) remain guarded by `ProtectedRoute`.



