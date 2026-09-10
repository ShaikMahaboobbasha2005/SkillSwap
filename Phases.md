# Phases.md — SkillSwap

12 phases, each scoped to a single deliverable with a clear "Done =" criterion — small enough to complete in one focused session, and unambiguous enough for an AI coding tool (Antigravity) to build without guessing.

## Phase 1 — Project Foundation
- **Goal:** Set up the initial project environment and backend/frontend infrastructure.
- **Features:**
  - React + Vite frontend setup
  - Express backend setup
  - MongoDB Atlas database connection
  - Layered folder structure
  - Environment variables (`.env`)
  - Initial configuration
- **Done =** Frontend and backend run successfully and MongoDB Atlas is connected.

## Phase 2 — Authentication
- **Goal:** Implement secure authentication and route protection middleware.
- **Features:**
  - User signup
  - User login
  - JWT token management
  - Password hashing with bcrypt
  - Protected routes
  - Authentication middleware
- **Done =** Users can authenticate and access protected resources.

## Phase 3 — User Profiles
- **Goal:** Support profile creation, modification, public viewing, and automatic Cloudinary media lifecycle cleanup.
- **Features:**
  - Profile CRUD operations
  - Profile picture & banner management
  - Safe Cloudinary asset cleanup for replaced or removed profile pictures and banners (`profilePicturePublicId`, `profileBannerPublicId`)
  - Bio management
  - Location setting
  - Social Links management (LinkedIn, GitHub, Instagram, YouTube, Personal Website with server-side validation, safe external links, and accessible icon row presentation)
  - Public profile view
  - Placeholder fields for `avgRating` and `completedSwaps`
- **Architecture Decisions:** Cloudinary deletion triggers strictly post-database update (`findByIdAndUpdate`). Legacy assets without stored `publicId` use unambiguous URL parsing (`skillswap/profiles/`), skipping deletion if ambiguous or default. Before destroying assets, the latest User document is re-read to prevent race conditions during rapid updates. Failed DB updates attempt orphan cleanup on newly uploaded `publicId`s while preserving old active assets. Cleanup failures log silently without rolling back or failing user profile updates.
- **Done =** Users can manage their profile and obsolete Cloudinary profile assets are automatically and safely cleaned up.

## Phase 4 — Skills Management
- **Goal:** Provide full skill lifecycle management and categorization.
- **Features:**
  - Skill CRUD operations
  - Active / Inactive status toggle
  - Skill categories
  - Skill ownership verification
  - Public filtering by skill
- **Architecture Decision:** Skill is the source of truth.
- **Done =** Skills are fully manageable.

## Phase 5 — Discover
- **Goal:** Enable user discovery through card-based search and filter interfaces.
- **Features:**
  - Search by skill and keyword
  - Multi-parameter filters
  - Pagination support
  - User grouping
  - User-centric discover cards
  - Public profile integration
- **Architecture Decision:** One User = One Discover Card.
- **Done =** Discover is fully functional.

## Phase 6 — Skill Swap Workflow
- **Goal:** Orchestrate the complete swap request lifecycle across the platform.
- **Features:**
  - Create swap requests
  - Select offered skill
  - Select requested skill
  - Optional request message
  - Incoming requests management
  - Outgoing requests management
  - Accept request
  - Reject request
  - Cancel request
  - Validation and permission checks
  - Dashboard integration
  - Discover integration
  - Public profile integration
- **Done =** Users can complete the entire swap request lifecycle.

## Phase 7 — Communication (Completed)
- **Goal:** Provide real-time chat between matched users with full conversation workspace, read receipts, and unread badges.
- **Features:**
  - Socket.io setup attached to HTTP server (Phase 7.1)
  - Per-swap chat rooms (`swap:<swapId>`) and centralized authorization (Phase 7.1)
  - Message persistence in MongoDB Atlas (Phase 7.1)
  - SocketContext & useSocket frontend infrastructure with single-socket session lifecycle (Phase 7.2)
  - Real-time Chat UI at `/swaps/:swapId/chat` with race-safe Map deduplication (Phase 7.3)
  - Pine Green `#1B4332` Accept Swap button styling (Phase 7.4)
  - First-class `/chats` route & Navbar link with live unread badge count (Phase 7.4)
  - Desktop two-panel chat workspace layout (`ConversationList` sidebar + active conversation) (Phase 7.4)
  - Persistent message status tracking (`sent` `✓` → `delivered` `✓✓` → `read` `✓✓` emerald) (Phase 7.4)
  - Clean container focus border & panel-edge scrollbar layout (Phase 7.4)
  - Maximized desktop chat vertical workspace height (`h-[100dvh]`) & compact header/composer paddings (Phase 7.4 Batch 2)
  - Authenticated user-specific Socket.io rooms (`user:<userId>`) derived strictly from verified JWT (Phase 7.4 Batch 2)
  - Real-time `swap_request_created` and `swap_request_updated` socket events with live Navbar & page badge sync (Phase 7.4 Batch 2)
  - Compact stacked mobile hamburger menu with right-aligned badges and subtle logout divider (Phase 7.4 Batch 2)
  - Full-screen mobile chat view (`/swaps/:swapId/chat`) with explicit header back-navigation to `/chats` (Phase 7.4 Batch 2)
  - WhatsApp-style chat date boundary separators (`DateSeparator`) rendering local calendar day headings ("Today", "Yesterday", "D MMMM YYYY") with inline time-only message bubble timestamps
- **Architecture Decisions:** Chat is strictly scoped to accepted SwapRequests. Message persistence precedes room broadcast. Socket authentication reuses JWT token (`auth: { token }`). Map deduplication by MongoDB `_id` prevents duplicate renders. Message status transitions (`sent` → `delivered` → `read`) are unidirectional and explicit. User personal rooms (`user:<userId>`) sync real-time swap creation and status updates without client-supplied identity overrides. Date separators are presentation-only components rendered dynamically inside `MessageList` using local browser timezone comparisons. Message bubbles render time-only timestamps (`7:42 PM`) inline at the bottom-right of message content to maximize thread compactness.
- **Done =** Accepted users can chat in real time with a complete conversation list, persistent read receipts, and live swap request updates across desktop and mobile.

## Phase 8 — Sessions & Reviews
- **Goal:** Handle swap completions, swap history, archived read-only chats, reviews, and automated reputation scoring.
- **Sub-Phases:**
  - **Phase 8.1 — Swap History & Archived Chats (Completed):**
    - Extended `SWAP_STATUS` enum: `["pending", "accepted", "rejected", "cancelled", "completed", "left"]`.
    - Implemented **Two-Party Swap Completion Confirmation**:
      - Requester clicks "Mark Completed" → swap remains status `"accepted"` while recording `completionRequestedBy: UserA` and `completionRequestedAt`.
      - Real-time Socket event (`swap_request_updated`) and in-app Notification created for `UserB`.
      - Partner (`UserB`) sees dynamic UI banner (`"[User A] marked this swap as completed"`) with `[ Confirm Completion ]` and `[ Not Yet ]` action buttons in both Swap Request cards and Chat workspace.
      - Clicking `[ Confirm Completion ]` transitions status to `"completed"`, sets `completedAt`/`endedAt`, archives conversation, moves swap to Swap History, and increments `completedSwaps` exactly once for both users.
      - Clicking `[ Not Yet ]` or `[ Cancel Request ]` clears `completionRequestedBy` while keeping swap status `"accepted"`.
    - Created MongoDB `Notification` model, service, controllers, and `/api/notifications` routes.
    - Active chats page (`/chats`) filtered strictly to `accepted` swaps where `chatDeletedFor` does not include user.
    - Archived read-only chat access (`/swaps/:swapId/chat`) as a standalone conversation (without active chats sidebar) for `completed` and `left` swaps with read-only banner ("This swap was completed/ended on [date]"), disabled message composer/write actions, back navigation to Swap History, and backend write protection.
    - Swap History API (`GET /api/swaps/history`) with sub-filtering (`completed`, `left`, `cancelled`) and pagination.
    - Per-user history deletion (`DELETE /api/chat/:swapId/history` appending `userId` to `chatDeletedFor`).
    - Swap Requests UI with 3 main tabs (`[ Incoming Requests ] [ Outgoing Requests ] [ Swap History ]`), responsive 2-column desktop/tablet grid layout (`grid-cols-1 md:grid-cols-2`), priority status sorting (`accepted` → `pending` → `completed` → `rejected` → `cancelled`), per-user list hiding (`hiddenFor` array via `PATCH /api/swaps/:id/hide` with confirmation modal), status sub-filters synced to URL (`?tab=history&status=...`), and status badges (`StatusBadge`).
    - `CompactProfileStats` "Swaps Done" card made clickable to navigate directly to completed swap history.
  - **Phase 8.2 — Ratings & Reviews:**
    - **Phase 8.2.1 — Ratings & Reviews Backend Foundation (Completed):**
      - Created `Rating` Mongoose model with compound unique index `{ swapRequest: 1, reviewer: 1 }` enforcing max 1 rating per reviewer per swap at database level while allowing both participants to rate each other.
      - Implemented `POST /api/ratings/:swapId` endpoint with Zod validation schema (`stars` required integer 1–5, `review` optional max 500 chars). Derives `reviewer` from `req.user.id` and `ratedUser` from `SwapRequest`. Restricts rating creation strictly to `completed` swaps and blocks self-rating.
      - Implemented `GET /api/ratings/user/:userId` endpoint fetching ratings received by `userId` sorted newest first, paginated, with safe reviewer public profile fields (`name profilePicture location`). Validates ObjectId format (`400 Bad Request`) and user existence (`404 Not Found`), returning empty `data: []` array for existing users with 0 ratings (`200 OK`).
      - Enforced strict phase boundary: `User.avgRating` and `User.completedSwaps` are NOT modified during rating creation.
    - **Phase 8.2.2 — Reputation Calculation (Completed):**
      - Implemented automatic server-side reputation recalculation (`recalculateUserRating`) inside `ratingService.js`.
      - Computes `User.avgRating` exclusively from ratings RECEIVED matching `{ ratedUser: userId }` using MongoDB aggregation (`$avg: "$stars"`).
      - Rounds `avgRating` to 1 decimal place (`Math.round(rawAvg * 10) / 10`) and defaults to `0` for users with 0 ratings received.
      - Updates **ONLY** the `ratedUser`'s reputation upon successful `Rating` persistence; reviewer reputation remains untouched.
      - Returns `{ rating, updatedAvgRating }` in `POST /api/ratings/:swapId` response payload.
    - **Phase 8.2.3 — Ratings & Reviews Frontend UI (Completed):**
      - Created `RatingModal.jsx` component leveraging `Modal.jsx` portal overlay with 5 interactive star buttons (hover preview, selection fill, accessible labels), optional review textarea (max 500 chars, character counter), inline star validation, loading spinner, and error alert.
      - Added `client/src/services/ratingService.js` client service supporting `createRating`, `getRatingsForUser`, and `getRatingStatusForSwap`.
      - Registered `GET /api/ratings/swap/:swapId/status` protected endpoint on backend.
      - Updated `SwapRequestCard.jsx` to safely fetch rating status strictly for `status === "completed"` swaps, rendering `[ Rate Partner ]` for unrated completed swaps and `✓ Review Submitted` for rated swaps.
    - **Phase 8.2.4 — Reviews Display & Profile Integration (Completed):**
      - Created `ReviewCard.jsx` displaying reviewer avatar, name, location, 1-5 gold star rating (`#B8860B`), formatted date, and conditional review text block (omitting quotation block when text is empty).
      - Created `ReviewsSection.jsx` fetching ratings received by `userId` using `ratingService.getRatingsForUser(userId, { page, limit: 5 })`. Displays overall `avgRating` from user profile data, total reviews count, initial skeleton loader, error retry state, clean empty state ("No reviews yet"), and `Load More Reviews` button appending subsequent pages without duplicate items.
      - Integrated `ReviewsSection` into own profile (`OwnProfile.jsx`) and public user profiles (`PublicProfile.jsx`).
      - Confirmed Discover cards (`DiscoverCard.jsx`) and stats bars (`CompactProfileStats.jsx`) render current server-managed `avgRating` correctly.
- **Done =** Completed swaps increment reputation, move conversations to archived read-only chat history, and allow submission of ratings & reviews.

## Phase 9 — Portfolio & Media
- **Goal:** Enable portfolio uploads to display user work samples.
- **Sub-Phases:**
  - **Phase 9.1 — Portfolio Backend & Cloudinary Foundation (Completed):**
    - Created `Portfolio` Mongoose model (`user`, `media: { url, publicId, type, thumbnailUrl, duration }`, `caption`, `skill`, `moderationStatus`, `reportCount`).
    - Cloudinary configuration extended with `uploadPortfolioToCloudinary` for images (`skillswap/portfolio/images`) and videos (`skillswap/portfolio/videos`).
    - Multer middleware `handlePortfolioUploadMiddleware` configured for images (jpg, jpeg, png, webp ≤ 10MB) and videos (mp4, webm ≤ 50MB).
    - Portfolio limits enforced: max 20 images, 10 videos, 30 total items per user.
    - Video duration validation enforced: max 60 seconds with immediate Cloudinary media cleanup on violation.
    - Full CRUD API routes mounted at `/api/portfolio` (`POST /`, `GET /user/:userId`, `GET /:id`, `PATCH /:id`, `DELETE /:id`).
    - Ownership verification, linked skill ownership check, and moderation-ready schema fields.
  - **Phase 9.2 — Portfolio Frontend & Grid (Completed):**
    - Created `PortfolioSection.jsx` compact profile preview with up to 3 thumbnails, video play badges, and "View all →" entry point on own and public profiles.
    - Created dedicated `PortfolioPage.jsx` route (`/portfolio` and `/portfolio/user/:userId`) with 3-column desktop / 2-column mobile grid, filter tabs (`All`, `Images`, `Videos`), and header info.
    - Created `PortfolioCard.jsx` with square aspect ratio, video play badges, linked skill pill overlays, hover owner actions, optimistic upload overlay with real-time percentage progress bar, processing state, and failure retry/remove controls.
    - Implemented optimistic upload lifecycle: dispatches temporary preview card immediately into grid upon validation, tracks real byte progress with Axios `onUploadProgress`, displays `Processing video...` state at 100%, seamlessly replaces with real server item upon completion, and manages blob URL cleanups.
    - Created full-screen `PortfolioLightbox.jsx` media viewer with native video controls, previous/next keyboard and click navigation, caption display, and body scroll lock.
    - Created `PortfolioUploadModal.jsx` with drag-and-drop file upload, client-side format/size/duration and portfolio count checks, optional caption (500 chars), optional skill link, and non-blocking optimistic delegation.
    - Created `PortfolioEditModal.jsx` for caption and linked skill editing.
    - Implemented permanent delete with `ConfirmModal` and clear explanation.
  - **Phase 9.4 — Portfolio Reactions (Completed):**
    - Added `reactions` subdocument array to Portfolio schema (`user`, `type`, `createdAt`) with strict 1 active reaction per user rule.
    - Supported 4 lightweight reaction types: `👍 Like`, `🔥 Impressive`, `👏 Great Work`, `💡 Creative`.
    - Added backend endpoints: `POST /api/portfolio/:id/reaction` (toggle/change/remove) and `GET /api/portfolio/:id/reactions` (sanitized public users list: `_id`, `name`, `profilePicture`).
    - Added `optionalAuthMiddleware` so public viewers can retrieve portfolio items while authenticated users receive populated `currentUserReaction`.
    - Implemented instant optimistic reaction updates on frontend with rollback on error and rapid-click concurrency prevention.
    - Updated `PortfolioCard.jsx` with persistent reaction summary badge on thumbnail (`[ 👍🔥 4 ]`) and 4 quick reaction controls in the action bar with Pine Green active highlighting (`#1B4332`).
    - Created `PortfolioReactionsModal.jsx` displaying list of users who reacted, category filtering tabs (`All`, `👍 Like`, `🔥 Impressive`, `👏 Great Work`, `💡 Creative`), user avatars, and profile links.
    - Integrated reaction bar into `PortfolioLightbox.jsx` with synchronized state across grid, lightbox, and profile previews.
    - Isolated temporary uploading and failed upload cards from reaction interactions.
  - **Phase 9.5 — Portfolio Undo & Moderation Foundation (Completed):**
    - **Portfolio Edit Undo:** Snapshots previous caption and linked skill state, displays 5-second countdown Undo toast (`"Portfolio updated [ Undo ] 5s"`), and atomically restores/persists previous data with version/action token guards to prevent race conditions during rapid edits.
    - **Portfolio Delete Undo & Delayed Finalization:** Optimistically hides deleted items from the visible UI, opens a 5-second Undo window (`"Portfolio item deleted [ Undo ] 5s"`), restores item immediately if Undo is clicked, and finalizes permanent MongoDB deletion and Cloudinary media asset cleanup only after window expiration without conflicts across multiple simultaneous deletions.
    - **Enhanced ToastNotification:** Extended `ToastNotification.jsx` to support customizable action buttons (`[ Undo ]`), countdown ticker, and Pine `#1B4332` / `#3FA873` design system tokens while remaining 100% backward compatible.
    - **Moderation Status Support:** Updated `Portfolio.moderationStatus` enum to `["active", "reported", "hidden", "removed"]`. `active` and `reported` items remain publicly visible; `hidden` and `removed` items are excluded from public responses.
    - **Dedicated PortfolioReport Model:** Created `PortfolioReport` schema with reporter, portfolioItem, reason enum (`nudity`, `violence`, `illegal`, `hate_harassment`, `spam`, `copyright`, `other`), optional description (max 500 chars), and compound unique index `{ portfolioItem: 1, reporter: 1 }` preventing duplicate active reports at the database level.
    - **Report API:** Implemented protected endpoint `POST /api/portfolio/:id/report` with Zod validation, self-reporting prevention (`403 Forbidden`), duplicate report protection (`409 Conflict`), and automatic status update to `reported`.
    - **PortfolioReportModal & Lightbox Integration:** Created `PortfolioReportModal.jsx` and added secondary visitor `[ Report ]` action to `PortfolioLightbox.jsx` with real-time feedback toasts and owner exclusion.
- **Done =** Users can showcase their work with image and video media uploads, enjoy optimistic non-blocking uploads with live progress bars, react to portfolio work with 4 emojis, undo edits and deletions within a 5-second window, and safely report objectionable content to lay the foundation for future moderation.

## Phase 10 — Smart Recommendations
- **Goal:** Enhance candidate matching using an intelligent AI recommendation layer built on top of a deterministic, rule-based matching foundation.
- **Features & Subphases:**
  - **Phase 10.1 — Traditional Matching, Compatibility Foundation & Skill Normalization (Completed):**
    - Built a deterministic, rule-based recommendation service (`recommendationService.js`) and API endpoint `GET /api/recommendations` protected by JWT `authMiddleware`.
    - **Smart Skill Normalization & Canonical Alias Resolution:** Created centralized `skillNormalization.js` utility that standardizes skill casing, spacing, and punctuation variations, and maps common synonyms/aliases to canonical skill identifiers (e.g., `JS` ↔ `JavaScript`, `NodeJS` ↔ `Node.js`, `ReactJS` ↔ `React`, `UI UX` ↔ `UI/UX Design`, `cpp` ↔ `c++`, `ts` ↔ `typescript`). Ensures strict false equivalence protection (`Java !== JavaScript`, `React !== React Native`, `Python !== Django`, `Figma !== UI/UX Design`, `Frontend !== React`).
    - **Display Name Preservation:** Preserves original user-entered skill names in the database, API response objects, and human-readable explanation sentences (`"They offer JS, which you want to learn."`).
    - **Candidate Filtering & Visibility Pipeline:** Evaluates skill normalization before candidate scoring, ensuring candidate users with alias skills are accurately matched, scored, and retained in recommendations rather than excluded. Self-exclusion strictly removes only the authenticated user (`owner: { $ne: currentUserId }`), allowing valid compatible partners across distinct skills to be recommended.
    - **Skill Compatibility Analysis:** Computes exact matches for user (`exactMatchesForYou`), exact matches for candidate (`exactMatchesForThem`), detects two-way mutual exchanges (`mutualMatch`), and calculates related category matches (`relatedMatches`).
    - **Progressive Diminishing-Returns Compatibility Scoring (0–100):** Directional exact match scoring with diminishing returns per direction (0: 0, 1: 26, 2: 36, 3: 42, 4: 45, 5+: 46) + two-way mutual bonus (+20) + related category matches (+8 each, max 16), strictly clamped between 0 and 100 with zero influence from reputation/popularity metrics. Eliminates premature 100% saturation (1↔1 = 72%, 2↔1 = 82%, 2↔2 = 92%, 3↔2 = 98%, 3↔3 = 100%) and maintains meaningful ranking differences for multi-skill matches.
    - **Deterministic Match Reasons:** Generates human-readable explanations based exclusively on real match data.
    - **Pure Skill-Compatibility Sorting:** Sorted deterministically by `compatibilityScore DESC`, `mutualMatch DESC`, `exactMatchCount DESC`, `relatedMatchCount DESC`, and `_id ASC`.
    - **Pagination:** Supports `?page=&limit=` pagination with standard `{ data: { recommendations }, meta: { page, limit, total, totalPages } }` response format.
    - Verified with comprehensive test suite and zero AI dependencies.
  - **Phase 10.2 — Recommendation UI & Match Discovery (Completed):**
    - Built authenticated `RecommendationsPage.jsx` view mounted on `/recommendations` (with `/matches` alias) and added "Matches" (`Sparkles` icon) navigation link with active state indicator in desktop Navbar and mobile drawer.
    - Implemented `RecommendationCard.jsx` displaying user identity, location, rating & swaps, bounded 0–100% compatibility badge with tier levels ("Excellent Match", "Strong Match", "Potential Match", "Related Skills"), and smooth progress bar.
    - Designed distinct Pine Green `#E4EEE8` banner and accent border for strong mutual two-way skill exchanges (`mutualMatch === true`).
    - Visualized partitioned skill exchange directions: "They Can Teach You" (`exactMatchesForYou` green-tinted chips), "You Can Teach Them" (`exactMatchesForThem` chips), and "Related Category Interests".
    - Rendered deterministic match explanations with checkmark bullet points and expandable `+X more reasons` toggle.
    - Integrated direct "View Profile" link (`/profile/:id`) and secondary "Request Swap" action opening `SwapRequestModal`.
    - Created `RecommendationSkeleton.jsx` pulsing layout, `RecommendationEmptyState.jsx` with "Manage My Skills" profile link, and `RecommendationErrorState.jsx` with retry action.
  - **Phase 10.3 — Gemini AI Semantic Match Ranking (Completed with User-Triggered Controls):**
    - **User-Triggered Execution Architecture:** Default recommendation requests (`GET /api/recommendations`) execute 100% deterministically with zero Gemini API calls, keeping the default Matches view instantaneous, cost-free, and quota-friendly. Gemini AI semantic ranking is strictly opt-in, triggered only when the user explicitly requests AI recommendations via `?ai=true` (`[ ✨ AI Recommendations ]`).
    - **Google Gemini Flash Semantic Layer:** Built a dedicated `geminiMatchingService.js` leveraging `@google/genai` to evaluate deeper semantic taxonomy relationships between skills (e.g., `Web Development` ↔ `React` + `Node.js` + `Express`, `Frontend` ↔ `React` + `CSS`, `Backend` ↔ `Node.js` + `MongoDB`).
    - **Privacy-Safe & Bounded Candidate Pool:** Passes only sanitized skill metadata (names, categories, levels) for bounded candidate pools ($\le 20$ candidates) in a single batched structured prompt. Enforces candidate ID verification to prevent fabricated candidates and strips sensitive user data (passwords, JWTs, chats, emails).
    - **Structured AI Output & Validation:** Enforces structured JSON output parsing, validates score bounds (0–100 integer clamping), and constrains human-readable AI explanations to $\le 2$ concise sentences.
    - **70/30 Hybrid Scoring Formula & Guardrails:** Combines deterministic score ($70\%$) with Gemini semantic score ($30\%$) via `round(traditionalScore * 0.70 + semanticScore * 0.30)`. The 70% deterministic anchor guarantees that strong mutual exact matches are protected from being displaced by weak candidates with high AI scores.
    - **Resilient Fallback Mechanism:** Transparently defaults to deterministic scoring and explanations if `GEMINI_API_KEY` is missing or if the API experiences timeouts, rate limits (429), or malformed output, with non-blocking user feedback and zero client disruption.
    - **Unified In-Page UI Experience:** Integrated seamless mode switcher (`[ All Matches ]` / `[ ✨ AI Recommendations ]`) inside `RecommendationsPage.jsx` without adding extra navbar items or routes, visual AI explanation badges in `RecommendationCard.jsx`, lightweight AI loading indicators, and dedicated AI empty/fallback states.
    - **Comprehensive Automated Test Suite:** Verified with 12 automated tests in `server/test/gemini_matching_test.js` covering default vs user-triggered execution, fallback behaviors, 70/30 math, score bounds, candidate isolation, and anti-hallucination.
  - **Phase 10.4 — Integrated Video Meetings & Swap Session Scheduling (Completed):**
    - **Integrated Chat Workflow (No Separate Page):** Built video calling and scheduling directly inside the chat experience (`ChatHeader`, `MessageList`, `ChatPage`), preserving the single conversation hub design.
    - **Strict Accepted Swap Access Requirement:** Implemented multi-layered backend validation (`verifyAcceptedSwapParticipant`) ensuring only active participants on an `accepted` swap request can create, join, or cancel video meetings. Blocked for unauthorized users, pending swaps, and ended swaps.
    - **Instant & Scheduled Session Creation:** Created `MeetingSession` Mongoose schema and endpoints `POST /api/meetings/instant` and `POST /api/meetings` supporting instant launches and future session scheduling with duration (15, 30, 45, 60 mins) and optional topic/goal notes.
    - **Deterministic Collision-Resistant Rooms:** Implemented deterministic room name generator (`skillswap-<swapId>-<meetingId>-<random>`) for isolated, private Jitsi rooms.
    - **Interactive In-Chat Meeting Message Cards:** Extended `Message` model with `type: "meeting"` and `meetingSession` reference. Created `MeetingMessageCard.jsx` to render live status ("Live / Ready", "Scheduled", "Completed", "Cancelled"), formatted date/time, topic, and `[ Join Call Now ]` & `[ Cancel ]` buttons in the chat stream.
    - **Embedded Jitsi Video Conference Overlay:** Created `JitsiMeetingModal.jsx` utilizing Jitsi Meet External API with custom toolbar options, responsive full-screen toggling, and clean `[ Leave Call ]` hangup action returning users safely back to their chat.
    - **Atomic Background Reminder Job:** Built background scheduler worker (`meetingReminderJob.js`) polling every 30s with atomic MongoDB `findOneAndUpdate` idempotency guards to deliver 15-minute advance and start-time in-app notifications with zero duplicate alerts.
    - **Real-Time Synchronization:** Emitted `new_message` and `meeting_updated` socket events to room `swap:<swapId>` and user notifications to partner rooms.
    - **Automated Verification:** Implemented and verified all 10 core test cases in `server/test/meeting_test.js` (Accepted Swap Access, Unauthorized Access Blocked, Pending Swap Blocked, Instant Meeting, Schedule Meeting, Participant Access, Cancellation, Reminder Eligibility, Duplicate Reminder Prevention, Chat Integration).
- **Architecture Decision:** Video meetings are integrated directly into chat as message cards and embedded overlays without a standalone meetings page. Pure skill compatibility and verified swap acceptance govern access.
- **Done =** Users with accepted swaps can start instant video calls or schedule future sessions directly within their chat, receive automated reminders, and join video rooms seamlessly via Jitsi Meet.

## Phase 11 — Notifications & Polish
- **Goal:** Add real-time/in-app notifications and elevate overall UI/UX quality.
- **Sub-Phases:**
  - **Phase 11.1 — Notification Center & Real-Time Notifications (Completed):**
    - **Unified Backend Notification Pipeline:** Standardized `Notification` Mongoose model with full enum types (`swap_request`, `swap_accepted`, `swap_rejected`, `swap_left`, `completion_request`, `completion_confirmed`, `completion_cancelled`, `meeting_scheduled`, `meeting_reminder`, `meeting_started`, `meeting_cancelled`, `rating_received`), optional swap reference (`required: false`), and compound index `{ user: 1, read: 1, createdAt: -1 }`.
    - **Automatic Service-Level Notification Producers:** Integrated non-blocking `createNotification` calls across `swapService.js` (requests, acceptances, rejections, leaves, completion mark/confirmation/cancellation), `meetingService.js` (scheduling, instant start, cancellation), `meetingReminderJob.js` (advance alerts and start-time reminders), and `ratingService.js` (rating received).
    - **Socket.IO Centralized Broadcast:** Attached `io` instance to `notificationService.setIO(io)` in `server.js`. Persisted notifications automatically emit `notification` events with populated documents and live recipient `unreadCount` to personal rooms `user:<userId>`, as well as `notification_unread_update` events on mark-as-read and mark-all-as-read.
    - **Frontend Notification Infrastructure:** Created `NotificationContext.jsx` and `useNotifications.js` managing live notifications and unread counts with race-safe MongoDB `_id` deduplication, optimistic mark-read operations, and pagination support.
    - **Interactive Navbar Notification Bell:** Built `NotificationBell.jsx` featuring dynamic unread badge with live pulse animations, accessible popover dropdown displaying recent activity, quick "Mark all as read" button, skeleton loading (`NotificationSkeleton.jsx`), empty state, and keyboard Escape / click-outside dismissal.
    - **Notification Row Presentation:** Built `NotificationItem.jsx` with distinct type icons (`lucide-react`), sender avatars, relative timestamps ("Just now", "2m ago", "1h ago", "Yesterday"), unread left-accent borders (`#1B4332`), and intelligent click routing to `/swaps`, `/swaps/:swapId/chat`, or `/profile`.
    - **Dedicated Notification Center:** Built full-page `NotificationsPage.jsx` at `/notifications` featuring All / Unread filter tabs, total unread badge, bulk mark-read action, "Load More" pagination, and empty/error states with retry.
    - **Navbar & Mobile Integration:** Integrated `NotificationBell` in desktop navigation and mobile header, with a live badge notification link in the mobile drawer.
    - **Automated Verification:** Implemented 12 comprehensive automated tests in `server/test/notification_test.js` covering pagination, isolation, mark-read, mark-all-read, unread count accuracy, Socket.IO broadcast, swap/rating producers, missing swap handling, and deduplication.
  - **Phase 11.2 — Bug Fixes & UX Polish (In Progress):**
    - **Bug #1 (Bio Persistence — Completed):** Fixed inconsistent bio persistence across browser reloads and public profile views. Added persistent `bio` field (`maxlength: 160`) to `User` Mongoose schema, Joi schema validation, and `profileService.js` whitelist. Removed temporary browser `localStorage` workaround and verified persistence across MongoDB, authenticated profile editing, and public profile views.
    - **Bug #2 (Notification Navigation, Deep-Linking & Exact Entity Highlighting — Completed):** Resolved inconsistent notification click navigation where terminal or outgoing swap events routed to generic `/swaps` (Incoming tab). Implemented deterministic target routing with deep-link query parameters (`/swaps?tab=incoming&highlight=<swapId>`, `/swaps?tab=history&highlight=<swapId>`, `/swaps/:swapId/chat?highlight=completion`, `/swaps/:swapId/chat?highlight=meeting`, `/profile?highlightSwap=<swapId>`), dynamic swap skill context derivation (`React ↔ Node.js`), smooth auto-scrolling to exact targeted elements, temporary visual highlight animations (`2.5s` duration with `prefers-reduced-motion` compliance), and redesigned `NotificationItem.jsx` with Lucide type badges, micro-animations, compact bell mode, and full page mode.
    - **Polish #1 (Profile Cleanup — Completed):** Removed redundant Notifications entry from the User Profile dropdown menu to eliminate clutter and keep the Profile experience focused strictly on identity, skills, swaps, portfolio, and reviews while preserving the global NotificationBell and `/notifications` center.
    - **Polish #2 (Ratings & Reviews Exact Skill Swap Association — Completed):** Established explicit rating-to-swap association across backend and frontend. Populated safe `swapRequest` metadata (`offeredSkill` ↔ `wantedSkill`) in `ratingService.js` (`getRatingsForUser`, `createRating`, `getRatingStatusForSwap`). Enhanced `ReviewCard.jsx` with compact, elegant skill swap context pills (`React ↔ Node.js`), deep-link navigation to completed swap conversations for authorized participants, and stable DOM targets with temporary visual highlighting for `rating_received` notifications.
    - **Polish #3 (Discover Skills Copy & Header Polish — Completed):** Replaced generic Discover copy with crisp SkillSwap value proposition ("Discover people who can teach what you want to learn—and skills you can share in return."), added a subtle `Learn ↔ Share` micro-cue pill in the header, and polished the empty state messaging while preserving all search, multi-parameter filtering, socket invalidation, and swap request flows.
    - **Polish #4 (Smart Recommendations UI & UX Polish — Completed):** Redesigned `RecommendationCard.jsx` to clearly present the core SkillSwap relationship: user identity with ratings and completed swaps, dedicated Match Score Box with tier label, percentage (`92% Match`), and smooth progress bar, partitioned skill exchange directions (`THEY CAN TEACH YOU` vs `YOU CAN TEACH THEM`), "Why this match" reasons block with deterministic/AI indicators and expandable toggle, and primary `[ Swap Skills → ]` with secondary `[ View Profile ]` CTAs. Synchronized `RecommendationSkeleton.jsx` and updated `RecommendationEmptyState.jsx`.
    - **Mobile Navigation Redesign (Completed):** Replaced the multi-tap mobile hamburger menu with a persistent mobile bottom navigation bar (`MobileBottomNav.jsx`) aligned strictly with the mobile navigation architecture sketch. Features 5 primary destinations in exact order: Home (`/`), Matches (`/recommendations`), Discover (`/discover`), Swaps (`/swaps`), and Chats (`/chats`). Profile is intentionally excluded from bottom navigation and accessed exclusively through the top-right profile avatar trigger, which opens a dedicated account menu (User info, My Profile, Settings Soon, Logout), completely replacing and eliminating the redundant three-line hamburger menu. Implemented deterministic active route detection (ensuring nested swap routes `/swaps/:swapId/chat` maintain Swaps context while `/profile` does not falsely highlight bottom items), real-time numeric badges for pending swaps and unread conversations, subtle active micro-dot indicators, and full accessibility (`aria-label`, `aria-current`, `focus-visible`). Centralized mobile safe-area clearance at the shared application layout shell (`AppLayout.jsx`) applying `pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0` to protect all content from being obscured while preserving existing desktop layouts and full-screen chat rooms (`ChatsPage`, `ChatPage`). Repositioned the Profile "Edit Banner" control (`ProfileBanner.jsx`) to the top-right corner to permanently prevent collision with the hero avatar while preserving natural banner overlap. Preserved global `NotificationBell` in mobile and desktop headers, and maintained untouched desktop top navigation.
    - **SkillSwap Icon System Update (Completed):** Established a unified, standardized icon family across the entire platform based on the three provided source reference designs:
      - **Offered Skill Icon (`OfferedSkillIcon.jsx`)**: Hand holding/presenting document with pencil writing. Replaced old generic `GraduationCap` in Profile Skills Offered header (`SkillsSection.jsx`), Skill creation/editing modal (`SkillModal.jsx`), Swap Request cards offered skill row (`SwapRequestCard.jsx`), Swap Request modal ("I'll Offer"), Discover card ("Offering Skills"), Recommendation card ("They Can Teach You"), and compact profile stats ("Total Skills").
      - **Wanted / Requested Skill Icon (`WantedSkillIcon.jsx`)**: Hand holding document sheets with bookmark. Replaced old generic `Target`/`BookOpen`/`Sparkles` in Profile Skills Wanted header (`SkillsSection.jsx`), Skill modal learning type (`SkillModal.jsx`), Swap Request cards requested skill row (`SwapRequestCard.jsx`), Swap Request modal ("I'm Requesting"), Discover card ("Learning Skills"), and Recommendation card ("You Can Teach Them").
      - **Matches Icon (`MatchesIcon.jsx`)**: Circular orbit with two user profile nodes and connection dots. Replaced generic Sparkles/AI-style icon across Mobile Bottom Navigation (`MobileBottomNav.jsx`), Desktop Navigation bar (`Navbar.jsx`), Matches page header badge & All Matches button (`RecommendationsPage.jsx`), Match Score Box in recommendation cards (`RecommendationCard.jsx`), Recommendation empty state (`RecommendationEmptyState.jsx`), Swap selector in chat (`SwapSelector.jsx`), Conversation list skill context (`ConversationList.jsx`), and Discover/Swap request buttons.
      - **Reusable Icon Components Architecture (`client/src/components/icons/`)**: Scalable, accessible React SVG components supporting `currentColor`, dynamic sizing, and zero duplicated SVG markup across individual views.
- **Done =** Users receive real-time notifications for all platform events with live Navbar bell badge synchronization, popover dropdown, dedicated `/notifications` management page, deterministic deep-link entity navigation and auto-scrolling with visual highlighting, polished Discover & Recommendations workflows, persistent mobile bottom navigation strictly matching the architectural sketch with centralized safe-area spacing, profile avatar account menu, resolved banner collision, unified three-icon SkillSwap iconography system across mobile/desktop navigation, skill cards, swap requests, and matches, and zero regressions across existing chat, swap, and meeting workflows.

## Phase 12 — Testing & Deployment
- **Goal:** Thoroughly test the application and deploy both frontend and backend services.
- **Features:**
  - Comprehensive API testing
  - Manual flow testing
  - Error handling verification
  - Authentication verification
  - Production deployment (Render backend & Vercel frontend)
  - MongoDB Atlas & Cloudinary integration checks
  - Production checklist execution
- **Done =** Application is successfully deployed and works end-to-end.

---

### Production Checklist
- [ ] Environment variables configured correctly on Vercel/Render
- [ ] MongoDB Atlas connected from the deployed backend
- [ ] Cloudinary uploads working (pfp + portfolio media)
- [ ] JWT authentication working end-to-end in production
- [ ] Socket.io chat working (real-time, not just on localhost)
- [ ] AI recommendations working with graceful fallback
- [ ] All frontend routes load correctly
- [ ] No console errors on any page
- [ ] Mobile layout verified on the deployed URL
