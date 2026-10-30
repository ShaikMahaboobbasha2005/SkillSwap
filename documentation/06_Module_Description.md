# 06 — Module Description

## SkillSwap — Implemented Modules

> This document describes each module as it exists in the current codebase.  
> Features not yet implemented are clearly marked.

---

## 1. Authentication and User Profiles

### Authentication (`server/src/controllers/authController.js`, `services/authService.js`)

**Status:** ✅ Complete

The authentication module handles user registration, login, logout, and identity verification.

- **Signup** (`POST /api/auth/signup`): Validates name/email/password with Zod. Checks for duplicate email (returns `409`). Hashes password with `bcryptjs` (10 salt rounds). Creates a `User` document. Returns a JWT signed with `process.env.JWT_SECRET`.
- **Login** (`POST /api/auth/login`): Finds user by email, verifies password with `bcrypt.compare`, issues a new JWT.
- **Logout** (`POST /api/auth/logout`): Returns success. The client is responsible for discarding the token; no server-side session exists to invalidate.
- **Get Current User** (`GET /api/auth/me`): Returns the authenticated user's document, protected by `authMiddleware`.

**JWT Format:** `{ id, role, iat, exp }` — signed with HS256 algorithm.  
**Token Delivery:** Bearer token in `Authorization` header. No cookie-based auth in the current implementation (logout doc notes httpOnly cookie support could be added later).

### Profiles (`server/src/controllers/profileController.js`, `services/profileService.js`)

**Status:** ✅ Complete

- **Edit Profile** (`PUT /api/users/me`): Updates `name`, `location`, `bio` (max 160 chars), and `socialLinks`. Server enforces a strict field whitelist — `avgRating` and `completedSwaps` cannot be patched.
- **Avatar/Banner Upload** (`POST /api/profile/upload-image`): Uses `multer` for in-memory multipart handling, then streams the buffer to `uploadToCloudinary`. On success, old Cloudinary assets are destroyed using the stored `publicId`. Both `profilePicturePublicId` and `profileBannerPublicId` are persisted to enable safe lifecycle cleanup.
- **Profile Completion Card:** Frontend computes a profile completeness percentage from filled fields and renders a `ProfileCompletionCard.jsx` as a visual guide.
- **Social Links Validation:** Server validates all social link URLs before persisting. Links are rendered as accessible icon buttons (`SocialLinksRow.jsx`) in the profile view with `target="_blank" rel="noopener noreferrer"` for security.
- **Image Cropping:** The frontend `ImageCropModal.jsx` uses `react-easy-crop` to let users crop their profile photo or banner before upload.

---

## 2. Skill Management

**Status:** ✅ Complete  
**Files:** `server/src/controllers/skillController.js`, `models/Skill.js`, `constants/skillConstants.js`

Each skill belongs to a specific user (`owner: ObjectId`). A skill is either type `"Offer"` (what the user can teach) or `"Learn"` (what the user wants to learn).

**Fields per skill:** name, normalizedName, category (20 options), level (Beginner/Intermediate/Advanced/Expert), type (Offer/Learn), description (max 250 chars), yearsOfExperience (0–50), status (Active/Inactive), displayOrder.

**Operations:**
- Add, edit, delete skills (with ownership verification)
- Toggle Active/Inactive without deleting historical records
- Duplicate prevention: compound unique index `{ owner, type, normalizedName }` at DB level

**Skill Normalization:** Before matching and searching, skill names are passed through `skillNormalization.js`, which resolves canonical aliases (e.g. `JS` → `javascript`, `ReactJS` → `react`, `NodeJS` → `node.js`). False-equivalence guards ensure `Java !== JavaScript`, `React !== React Native`, etc.

**Frontend components:** `SkillModal.jsx` (add/edit form with category and level selectors), `SkillCard.jsx`, `SkillsSection.jsx` (collapsible section showing first 2 skills with "+X more" toggle), `CategoryBadge.jsx`, `LevelBadge.jsx`, `DeleteSkillDialog.jsx`.

---

## 3. User Discovery

**Status:** ✅ Complete  
**Files:** `server/src/controllers/discoverController.js`, `services/discoverService.js`, `routes/discoverRoutes.js`

The Discover page (`/discover`) provides a paginated, filterable grid of other users.

- **One user = one card**: Users are deduplicated even if they match multiple filter criteria.
- **Filters:** keyword search (skill name), category, skill type (Offer/Learn), proficiency level.
- **Sorting and pagination:** standard `page` and `limit` parameters with `meta` in response.
- **Frontend:** `DiscoverPage.jsx`, `DiscoverGrid.jsx`, `DiscoverCard.jsx`, `SearchBar.jsx`, `FilterPanel.jsx`, `FilterDrawer.jsx` (mobile slide-over), `ActiveFilterChips.jsx`, `LoadingSkeleton.jsx`, `Pagination.jsx`, `EmptyState.jsx`, `ErrorState.jsx`.

---

## 4. Smart Recommendations and AI Semantic Matching

**Status:** ✅ Complete  
**Files:** `server/src/services/recommendationService.js`, `services/geminiMatchingService.js`, `utils/skillNormalization.js`

### Deterministic Matching Engine

1. **Candidate Filtering:** Queries all users (excluding self) with at least one Active skill.
2. **Alias Resolution:** Applies `skillNormalization.js` to all skill names before comparison.
3. **Compatibility Analysis:** Computes `exactMatchesForYou` (their offered ∩ your wanted), `exactMatchesForThem` (your offered ∩ their wanted), `mutualMatch` (true when both directions have ≥1 exact match), `relatedMatches` (same category, no exact match).
4. **Progressive Diminishing-Returns Score (0–100):**
   - Per-direction exact matches: 0→0, 1→26, 2→36, 3→42, 4→45, 5+→46
   - Mutual exchange bonus: +20
   - Related category matches: +8 each (max +16)
   - Clamped strictly between 0 and 100
5. **Human-Readable Reasons:** Generated deterministically from actual match data using original skill names.
6. **Sorting:** `compatibilityScore DESC`, `mutualMatch DESC`, `exactMatchCount DESC`, `relatedMatchCount DESC`, `_id ASC`.

### Optional Gemini AI Layer

- **Triggered only when `?ai=true`** — zero Gemini calls otherwise.
- **`geminiMatchingService.js`** sends a single batched structured prompt to Google Gemini Flash (`@google/genai`) with anonymised skill metadata (no user PII) for up to 20 candidates.
- **Structured output:** Gemini returns `{ candidateId, semanticScore (0–100), explanation (max 2 sentences) }` per candidate.
- **Hybrid Score:** `round(traditionalScore * 0.70 + semanticScore * 0.30)`.
- **70% deterministic anchor:** Strong mutual matches cannot be displaced by weak candidates with high AI scores.
- **Graceful Fallback:** If `GEMINI_API_KEY` is absent, if Gemini times out, rate-limits (429), or returns malformed JSON — the system silently falls back to 100% deterministic scores. The response includes `meta.isAiEnhanced: false` to inform the client.

### Frontend
`RecommendationsPage.jsx`, `RecommendationCard.jsx`, `RecommendationSkeleton.jsx`, `RecommendationEmptyState.jsx`, `RecommendationErrorState.jsx`. Inline mode switcher (`All Matches` / `AI Recommendations`) without separate routing.

---

## 5. Swap Request and Swap History

**Status:** ✅ Complete  
**Files:** `server/src/controllers/swapController.js`, `services/swapService.js`, `models/SwapRequest.js`

**Swap lifecycle state machine:**
```
pending → accepted | rejected | cancelled
accepted → completed (two-party) | left
```

**Key behaviours:**
- Duplicate prevention: 409 if an active or pending swap already exists for the same skill pair between the same two users in either direction.
- **Skill snapshots:** At swap creation, `offeredSkillName`, `offeredSkillLevel`, `wantedSkillName`, `wantedSkillLevel` are snapshotted immutably so historical records are accurate even if skills are later deleted.
- **Two-party completion:** User A requests completion → partner User B sees a confirmation banner → User B confirms → both `completedSwaps` increment → chat becomes read-only.
- **Per-user soft controls:** `hiddenFor` (hides from active lists without deleting) and `chatDeletedFor` (removes from personal history).
- **Swap History:** `GET /api/swaps/history` with sub-filters (`?status=completed|left|cancelled`).

**Frontend:** `SwapRequestsPage.jsx` with three main tabs (Incoming, Outgoing, History), `SwapRequestCard.jsx`, `SwapRequestModal.jsx`, `IncomingRequests.jsx`, `OutgoingRequests.jsx`, `StatusBadge.jsx`, `EmptySwapState.jsx`, `SwapRequestSkeleton.jsx`.

---

## 6. Real-Time Chat and Messaging

**Status:** ✅ Complete  
**Files:** `server/src/controllers/chatController.js`, `services/chatService.js`, `sockets/socketHandler.js`, `models/Message.js`

**Architecture:**
- Chat is strictly scoped to **accepted** swap requests.
- Socket.IO room key: `swap:<swapId>`.
- **Message persistence first:** The server persists messages to MongoDB before broadcasting to the room.
- **Deduplication:** The frontend tracks message `_id` to prevent duplicate renders from receiving both ACK and broadcast.

**Message Status:**
- `sent` — message persisted on server.
- `delivered` — recipient's socket is connected when message arrives.
- `read` — recipient opens the conversation (`mark_messages_read`).
- Status transitions are **unidirectional** — never downgraded.

**Features:**
- Reply-to support (`replyTo` field references another message in the same swap).
- Soft message delete (clears content to `""`, broadcasts `message_deleted`).
- WhatsApp-style date separators ("Today", "Yesterday", "D MMMM YYYY").
- Unread divider line showing the first unseen message on conversation open.
- Desktop two-panel layout (`ConversationList` sidebar + active conversation).
- Mobile: separate `/chats` list and `/swaps/:swapId/chat` full-screen views.
- Read-only mode for completed and left swaps — composer disabled, history preserved.

**Frontend:** `ChatsPage.jsx`, `ChatPage.jsx`, `ConversationList.jsx`, `ChatHeader.jsx`, `MessageList.jsx`, `MessageBubble.jsx`, `MessageInput.jsx`, `DateSeparator.jsx`, `UnreadDivider.jsx`, `EmojiPicker.jsx`, `SwapSelector.jsx`.

---

## 7. Video Meetings (Jitsi Meet Integration)

**Status:** ✅ Complete  
**Files:** `server/src/controllers/meetingController.js`, `services/meetingService.js`, `jobs/meetingReminderJob.js`, `models/MeetingSession.js`

Video meetings are integrated directly into the chat workspace — there is **no separate meetings page**.

**Workflow:**
1. Participant clicks the Video Call icon in `ChatHeader.jsx` (only available for accepted swaps).
2. `MeetingOptionsModal.jsx` offers "Start Now" or "Schedule for Later".
3. Creating a meeting: server generates a deterministic Jitsi room name (`skillswap-<swapId>-<meetingId>-<random>`), creates a `MeetingSession` record, posts a `meeting`-type message into the chat thread, and notifies the partner.
4. Clicking "Join Call Now" in the `MeetingMessageCard.jsx`: transitions session to `active`, opens `JitsiMeetingModal.jsx` with the Jitsi Meet External API embedded.
5. Jitsi sessions run on Jitsi's public `meet.jit.si` infrastructure — no self-hosted video server.

**Background reminder job** (`meetingReminderJob.js`):
- Polls every 30 seconds.
- Sends 15-minute advance and start-time notifications.
- Uses atomic `findOneAndUpdate` with `reminded15m: false` / `remindedStart: false` to guarantee idempotency.

**Frontend:** `MeetingMessageCard.jsx`, `MeetingOptionsModal.jsx`, `ScheduleMeetingModal.jsx`, `JitsiMeetingModal.jsx`.

---

## 8. Real-Time Notifications

**Status:** ✅ Complete  
**Files:** `server/src/controllers/notificationController.js`, `services/notificationService.js`, `models/Notification.js`

**Notification Types (12):**
`swap_request`, `swap_accepted`, `swap_rejected`, `swap_left`, `completion_request`, `completion_confirmed`, `completion_cancelled`, `meeting_scheduled`, `meeting_reminder`, `meeting_started`, `meeting_cancelled`, `rating_received`

**Delivery:**
1. Service creates a `Notification` document (`notificationService.createNotification`).
2. The persisted, populated document is immediately emitted to the recipient's personal Socket.IO room (`user:<userId>`).
3. An `unreadCount` is broadcast alongside each notification.

**Features:**
- Navbar bell badge with live pulse animation and unread count.
- Popover dropdown with recent notifications and "Mark all as read".
- Deep-linking: clicking a notification routes to the specific swap card, chat message, or profile and **visually highlights** the target element with a 2.5-second ambient animation.
- Full `/notifications` page with All/Unread filter tabs, load-more pagination, bulk mark-read.

**Frontend:** `NotificationBell.jsx`, `NotificationItem.jsx`, `NotificationSkeleton.jsx`, `NotificationsPage.jsx`, `NotificationContext.jsx`, `useNotifications.js`.

---

## 9. Portfolio Showcase

**Status:** ✅ Complete  
**Files:** `server/src/controllers/portfolioController.js`, `services/portfolioService.js`, `models/Portfolio.js`, `models/PortfolioReport.js`

**Upload:**
- Images: jpg, jpeg, png, webp — up to 10 MB.
- Videos: mp4, webm — up to 50 MB, max 60 seconds.
- Limits: 20 images, 10 videos, 30 total items per user.
- `multer` handles in-memory multipart; `uploadPortfolioToCloudinary` streams to Cloudinary.
- Video duration is validated server-side after upload; if exceeded, the Cloudinary asset is immediately destroyed and a 400 error is returned.

**Reactions:**
- 4 types: `like` (👍), `impressive` (🔥), `great_work` (👏), `creative` (💡).
- 1 active reaction per user per item (toggle same type to remove; click different type to change).
- Optimistic UI updates with rollback on error.

**Undo system:**
- Edit and delete operations display a 5-second countdown toast (`"Portfolio updated [ Undo ] 5s"`).
- Delete: item is immediately hidden from UI; Cloudinary and database deletion happen only after the 5-second window closes without an undo click.

**Moderation:**
- `moderationStatus` enum: `active` | `reported` | `hidden` | `removed`.
- `active` and `reported` items are publicly visible; `hidden` and `removed` are excluded from public responses.
- Reports are stored in the `PortfolioReport` collection with a reason, optional description, and `status` (`pending` → `reviewed` → `dismissed` / `action_taken`).

> **Note:** Admin moderation panel to process reports is **not implemented**. Reports are stored and the portfolio item status is set to `"reported"`, but manual admin review requires direct database access in the current version.

**Frontend:** `PortfolioPage.jsx`, `PortfolioCard.jsx`, `PortfolioLightbox.jsx`, `PortfolioUploadModal.jsx`, `PortfolioEditModal.jsx`, `PortfolioReactionsModal.jsx`, `PortfolioReportModal.jsx`, `PortfolioSection.jsx` (profile preview), `ReactionPicker.jsx`.

---

## 10. Ratings and Reviews

**Status:** ✅ Complete  
**Files:** `server/src/controllers/ratingController.js`, `services/ratingService.js`, `models/Rating.js`

**Rules:**
- Only `completed` swaps unlock rating.
- Each participant can rate the other once (compound unique index `{ swapRequest, reviewer }` at DB level).
- Self-rating is blocked (403).
- Stars: required integer 1–5. Review text: optional, max 500 chars.

**Reputation calculation:**
- `User.avgRating` is computed via MongoDB aggregation after each new rating: `$avg: "$stars"` across all ratings where `ratedUser = userId`, rounded to 1 decimal place.
- Only the **rated user's** `avgRating` is updated, not the reviewer's.
- `User.completedSwaps` is separate and unchanged by rating events.

**Swap association:** Each rating record references its `swapRequest`, and the populated response includes the skill names exchanged (e.g. `React ↔ Node.js`), displayed as context chips in `ReviewCard.jsx`.

**Frontend:** `RatingModal.jsx` (star selector, textarea, character counter), `ReviewCard.jsx`, `ReviewsSection.jsx` (with load-more pagination, displayed on both own and public profiles).

---

## 11. Personal Dashboard

**Status:** ✅ Complete  
**Files:** `client/src/pages/Home.jsx`, `components/dashboard/`

The authenticated Home page (`/`) is a personal dashboard answering "What's happening with my SkillSwap account right now?"

**Sections:**
- **`DashboardHero.jsx`**: Authenticated user's real name greeting, `DASHBOARD` badge, 4 quick-action buttons (Discover Skills, View Matches, Swap Requests, My Profile).
- **`DashboardStats.jsx`**: 5-metric snapshot — Skills Offered, Skills Wanted, Active Swaps, Completed Swaps, Average Rating. All from real server data.
- **`ActiveSwapsSection.jsx`**: Current ongoing exchanges with partner avatar, reciprocal skill chips, and direct "Open Chat →" action.
- **`PendingRequestsSection.jsx`**: Incoming vs outgoing pending requests with status chips and deep-link highlight navigation.
- **`RecommendedMatchesSection.jsx`**: Top deterministic match previews with compatibility scores.
- **`RecentActivitySection.jsx`**: Last 5 notifications rendered via `NotificationItem compact={true}` with full deep-linking.

**Layout:** 2-column desktop grid (7-col operational + 5-col triage) stacking to single-column on mobile.

---

## 12. Settings and Theme Switcher

**Status:** ✅ Complete  
**Files:** `client/src/pages/SettingsPage.jsx`, `context/ThemeContext.jsx`, `hooks/useTheme.js`

**Theme System:**
- Three modes: `System` (follows OS preference), `Light`, `Dark`.
- Persisted to `localStorage` under key `skillswap_theme`.
- **Anti-FOUC:** A synchronous inline script in `index.html` `<head>` reads the saved preference and applies `.dark` to `<html>` before React renders, preventing white flashes on reload.
- **OS listener:** In `system` mode, a `matchMedia` listener dynamically updates the theme when the OS preference changes.
- **Tailwind v4:** Custom variant `@custom-variant dark (&:where(.dark, .dark *))` ensures dark styles reach all nested components and React portals.

**Settings Page:** Interactive theme selector (Monitor/Sun/Moon icons) with active selection indicators. Profile dropdown (top-right avatar) provides access to Settings and Logout.

> **Note:** Settings currently offers only the Appearance (theme) section. Other settings sections (Account, Privacy, Notifications preferences) are placeholders not yet implemented.

---

## 13. 3D Landing Page

**Status:** ✅ Complete  
**Files:** `client/src/pages/LandingPage.jsx`, `components/landing/Cinematic3DScene.jsx`, `components/landing/LandingSpatialHUD.jsx`, `components/landing/LandingNavbar.jsx`

Served only to **unauthenticated** visitors at `/`. Authenticated users see the dashboard instead (`RootRoute` in `App.jsx`).

**Three.js Scene (`Cinematic3DScene.jsx`):**
- Full-viewport persistent WebGL canvas.
- Two sculptural capsule avatars with PBR materials.
- 6 skill capsules (frosted glass `MeshPhysicalMaterial`) with canvas-rendered text labels.
- 5-stage scroll-driven choreography: Discover → Match → Exchange → Learn → Grow.
- Adaptive performance: mobile (shadows disabled, lower pixel ratio, touch scroll passthrough), tablet, desktop.
- `prefers-reduced-motion` compliance.

**HUD (`LandingSpatialHUD.jsx`):** Hero headline, CTAs, scroll-stage annotations, terminal conversion card.

**Landing Navbar (`LandingNavbar.jsx`):** Translucent with backdrop blur. "Sign In" and "Get Started" CTAs.

---

## 14. Mobile Navigation

**Status:** ✅ Complete  
**Files:** `client/src/components/layout/MobileBottomNav.jsx`, `components/layout/AppLayout.jsx`

**5-destination bottom navigation bar** (visible on mobile, hidden on desktop):

| Position | Destination | Icon | Badges |
|---|---|---|---|
| 1 | `/` (Home/Dashboard) | `Home` | — |
| 2 | `/recommendations` (Matches) | `MatchesIcon` | — |
| 3 | `/discover` | `Compass` | — |
| 4 | `/swaps` | `Handshake` | Pending swap count |
| 5 | `/chats` | `MessageSquare` | Unread conversation count |

Profile is accessed via the top-right avatar trigger, which opens an account menu (My Profile, Settings, Logout). The three-line hamburger menu has been replaced.

Safe-area bottom padding (`pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))]`) is applied in `AppLayout.jsx` to prevent content from being obscured by the nav bar.

---

*All module descriptions verified against source files in `client/src/` and `server/src/` — October 2026.*

