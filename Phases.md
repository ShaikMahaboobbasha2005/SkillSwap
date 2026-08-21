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
- **Done =** Users can showcase their work with image and video media uploads, enjoy optimistic non-blocking uploads with live progress bars, react to portfolio work with 4 emojis, view who reacted in category tabs, and manage portfolio items.

## Phase 10 — Smart Recommendations
- **Goal:** Enhance candidate matching using an intelligent AI recommendation layer.
- **Features:**
  - Traditional rule-based matching
  - AI candidate ranking
  - Compatibility scoring
  - Graceful fallback when AI is unavailable
- **Architecture Decision:** AI enhances traditional matching and never replaces it.
- **Done =** AI recommendations work while traditional matching remains functional.

## Phase 11 — Notifications & Polish
- **Goal:** Add real-time/in-app notifications and elevate overall UI/UX quality.
- **Features:**
  - Notification center
  - Request notifications
  - Rating notifications
  - Loading states & skeleton loaders
  - Empty states
  - Micro-animations and transitions
  - Responsive verification across screen sizes
  - Accessibility improvements (a11y)
  - Design polish
- **Done =** Application feels production-ready.

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
