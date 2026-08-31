# Architecture.md — SkillSwap

## 1. High-Level Architecture

SkillSwap uses a **monolithic backend** with a decoupled frontend — one Express.js server handling all REST routes, WebSocket connections, and third-party integrations, talking to a single MongoDB Atlas database. This keeps the system simple to build, debug, and deploy within the mini-project timeline, while still being organized in clean layers so it isn't a mess of spaghetti routes.

```
┌─────────────────────┐        HTTPS/REST         ┌──────────────────────────┐
│   React + Vite SPA  │ ─────────────────────────▶ │   Express.js Server      │
│  (Vercel, static)   │ ◀───────────────────────── │   (Render, monolith)     │
│                      │        WebSocket (chat)     │                          │
└─────────────────────┘ ◀────────────────────────▶ └──────────────────────────┘
                                                              │
                          ┌───────────────────────────────────┼───────────────────────┐
                          ▼                                   ▼                       ▼
                 ┌────────────────┐                 ┌──────────────────┐   ┌────────────────────┐
                 │ MongoDB Atlas  │                 │   Cloudinary      │   │  Jitsi Meet embed  │
                 │ (users, skills,│                 │ (pfp + portfolio  │   │  (video sessions)  │
                 │ swaps, chats,  │                 │  media)           │   │                    │
                 │ ratings)       │                 └──────────────────┘   └────────────────────┘
                 └────────────────┘
```

## 2. Architecture Principles
- **Simplicity over cleverness** — monolith over microservices; the team's build capacity, not theoretical scale, sets the bar
- **Thin routes, fat services** — controllers stay small; matching, AI ranking, and notification logic live in dedicated service modules so they're testable independent of HTTP
- **Stateless API** — JWT-based auth means no server-side session store, keeping the backend horizontally scalable later without redesign
- **External services for heavy lifting** — media storage (Cloudinary) and video calls (Jitsi) are offloaded to third parties rather than self-hosted, keeping the app server lightweight
- **Additive AI layer** — AI recommendation sits on top of traditional matching as a re-ranking step, never a replacement, so the system degrades gracefully if AI scoring fails or is delayed
- **Consistency over premature optimization** — given the timeline, correctness and a working end-to-end flow take priority over performance tuning

## 3. Frontend (React + Vite)

Single-page app, deployed as a static build on Vercel.

```
src/
├── pages/          # route-level views (Login, Signup, Home, DiscoverPage, RecommendationsPage, OwnProfile, PublicProfile, SwapRequestsPage, ChatPage, ChatsPage, NotificationsPage)
├── components/     # reusable UI
│   ├── chat/       # ChatHeader, MessageList, MessageBubble, MessageInput, ConversationList
│   ├── discover/   # DiscoverCard, FilterPanel, FilterDrawer, ActiveFilterChips, LoadingSkeleton, Pagination
│   ├── notifications/ # NotificationBell, NotificationItem, NotificationSkeleton
│   ├── profile/    # CompactProfileStats, AvatarLightboxModal, SocialLinksRow, ProfileBanner
│   ├── recommendations/ # RecommendationCard, RecommendationSkeleton, RecommendationEmptyState, RecommendationErrorState
│   ├── swaps/      # SwapRequestModal, SwapRequestCard, IncomingRequests, OutgoingRequests, StatusBadge, EmptySwapState, SwapRequestSkeleton
│   └── ...         # Navbar, Modal, ConfirmModal, ToastNotification, SkillsSection, etc.
├── context/         # AuthContext, SwapContext, SocketContext, NotificationContext
├── hooks/           # useAuth, useDiscover, useSocket, useNotifications
├── services/        # API call wrappers (authService, skillService, discoverService, recommendationService, profileService, swapService, chatService, ratingService, notificationService, portfolioService)
├── utils/           # validation helpers, formatters
└── App.jsx
```

- Responsive layout via CSS breakpoints (mobile-first), matching the fixed color palette
- AuthContext holds JWT + current user, persisted in memory + a single refresh check on load
- SocketContext establishes ONE authenticated Socket.io connection per session (using the restored JWT token). Derived socket URL resolves from `VITE_SOCKET_URL` or `VITE_API_URL` origin. Keeps the raw socket internal, exposing clean states (`isConnected`, `connectionError`) and helper operations (`joinSwapChat`, `sendMessage`, `subscribeToMessages`, `unsubscribeFromMessages`) with duplicate-listener protection and message deduplication handling.

## 4. Backend (Express.js — Monolith)

```
server/
├── config/          # db connection, cloudinary config, env loader
├── models/           # Mongoose schemas: User, Skill, SwapRequest, Message, Rating, Notification, Portfolio, PortfolioReport
├── routes/           # /auth, /profile, /users, /skills, /discover, /swaps, /chat, /ratings, /notifications, /portfolio, /recommendations
├── controllers/      # business logic per route group
├── middleware/        # authMiddleware (JWT verify), errorHandler, validateRequest (Zod/Joi), uploadMiddleware
├── services/          # recommendationService, authService, discoverService, swapService, chatService, ratingService, notificationService, portfolioService
├── utils/             # skillNormalization (canonical alias matching), portfolioValidation, formatters
├── sockets/            # socket.io connection handler + chat event logic
└── server.js           # Express app + Socket.io server bootstrap
```

**Layering rule:** routes stay thin → controllers handle request/response → services hold the actual logic (matching algorithm, recommendation engine, notification creation) → utils handle reusable deterministic transformations (skill normalization & alias resolution). This keeps recommendation logic testable independent of HTTP.

## 5. Key Flows

**Auth**
Client → `/auth/login` → controller verifies credentials → issues JWT → client stores it → attached as `Authorization: Bearer` on every subsequent request → `authMiddleware` verifies on protected routes.

**Matching & Recommendations (Phase 10.3 User-Triggered Enhancement)**
`recommendationService` executes a two-tier hybrid matching pipeline combining deterministic compatibility with optional, user-triggered Gemini AI semantic ranking:
1. **Candidate Filtering:** Queries users with active skills, excluding the authenticated user (`owner: { $ne: currentUserId }`).
2. **Canonical Skill Normalization & Alias Resolution:** Dynamically cleans and resolves skill names using a centralized, deterministic alias dictionary (`skillNormalization.js`) before compatibility scoring (e.g., `JS` → `javascript`, `NodeJS` → `node.js`, `ReactJS` → `react`, `UI UX` → `ui/ux design`). Guarantees false equivalence protection (`Java !== JavaScript`, `React !== React Native`, `Python !== Django`, `Figma !== UI/UX Design`). Original user-entered skill names are preserved for human-readable reasons and UI display (`"They offer JS, which you want to learn."`).
3. **Skill Compatibility Analysis:** Evaluates exact canonical matches (what you want vs what they offer, and what they want vs what you offer), detects mutual two-way exchanges, and checks related category overlaps for non-exact skills.
4. **Progressive Diminishing-Returns Scoring (0–100):** Directional exact match scores computed independently per direction with diminishing returns (0: 0, 1: 26, 2: 36, 3: 42, 4: 45, 5+: 46) + mutual exchange bonus (+20) + related category matches (+8 each, max 16), clamped strictly between 0 and 100 with zero influence from reputation or popularity metrics. Eliminates premature 100% saturation and maintains meaningful ranking differences (1↔1 = 72%, 2↔1 = 82%, 2↔2 = 92%, 3↔2 = 98%, 3↔3 = 100%). Candidates with `traditionalScore > 0` form the candidate pool.
5. **Deterministic Match Explanations:** Generates human-readable, deterministic reasons based exclusively on actual match data using preserved original skill names.
6. **Default Execution Flow (Fast & Deterministic):** On regular recommendation requests (`/recommendations` without `ai=true`), candidates are immediately sorted and paginated using deterministic compatibility scoring. Zero Gemini API calls are made, keeping response times ultra-fast and free of API quota usage.
7. **User-Triggered Gemini Semantic Ranking (`?ai=true`):** When the user explicitly requests AI recommendations inside the Matches view, the top bounded candidate pool ($\le 20$ candidates) is evaluated by Google Gemini via `geminiMatchingService.js`. Gemini analyzes domain affinities (e.g. `Web Development` ↔ `React` + `Node.js`) and returns structured JSON with numeric `semanticScore` (0–100) and concise explanation sentences.
8. **Hybrid Scoring & Guardrails:** Combines scores via `hybridScore = round(traditionalScore * 0.70 + semanticScore * 0.30)`. The 70% deterministic weight acts as a heavy anchor, ensuring strong mutual exact matches cannot be easily displaced by weak candidates with high AI scores. AI reasons are merged with deterministic reasons without duplication.
9. **Graceful Fallback:** If `GEMINI_API_KEY` is missing, or the Gemini API times out, rate-limits, or returns invalid schema, the system logs a sanitized warning and transparently serves deterministic matches and scores with zero client disruption.
10. **Final Skill-Compatibility Sorting:** Sorted strictly by `compatibilityScore DESC`, `mutualMatch DESC`, `exactMatchCount DESC`, `relatedMatchCount DESC`, and `_id ASC` (deterministic tie-breaker).


**Swap Request → Chat → Video Meetings**
- **Active Chats (`/chats` & `/chats/:userId`):** Swap request accepted → appears in active conversations list (`/chats`). Multi-swap conversations with the same counterpart are grouped by counterpart user ID with the `SwapSelector` dropdown. Socket.io room (`swap:<swapId>`) joined for real-time messaging, read receipts, and live typing.
- **Integrated Video Meetings (Phase 10.3):** Video meeting functionality is integrated directly into the chat header and conversation stream (no separate Meetings page). Participants can launch an instant session or schedule a future session. Creating a session persists a `MeetingSession`, generates a deterministic room ID (`skillswap-<swapId>-<meetingId>-<random>`), posts a dedicated interactive `MeetingMessageCard` directly into the chat thread, broadcasts `new_message` to the swap room, and delivers notifications to the counterpart. Clicking Join opens an embedded, responsive `JitsiMeetingModal` (powered by Jitsi Meet External API) with in-call controls and seamless exit back to the chat.
- **Background Meeting Reminders:** A lightweight periodic scheduler (`meetingReminderJob.js`) runs every 30 seconds on the backend. It uses atomic MongoDB updates (`findOneAndUpdate` with `reminded15m: false` and `remindedStart: false`) to guarantee zero duplicate notifications across server restarts or multi-instance deployments for 15-minute advance alerts and start-time reminders.
- **Historical Read-Only Chats (`/swaps/:swapId/chat`):** When a swap is `completed` or `left`, it is archived and removed from active `/chats`. Historical conversations remain directly accessible via `/swaps/:swapId/chat` as a standalone read-only view without the active conversation sidebar. Write operations and message composers are disabled while full message history, date separators, counterpart details, and history deletion (`chatDeletedFor`) remain accessible.

**Session Completion → Rating**
Either user marks the swap complete → triggers a notification to the other party → both users can submit a rating tied to that swap → `User.avgRating` and `User.completedSwaps` are recalculated (not manually editable fields).

**Portfolio Media**
Upload → multer (in-memory) → Cloudinary upload → returned URL stored in `User.portfolio[]` → displayed as a grid on the profile page, videos served via Cloudinary's video delivery.

**Notification Center & Real-Time Synchronization (Phase 11.1)**
- **Centralized Event Dispatch:** Whenever key actions occur across the platform (swap request created/accepted/rejected/ended, completion requested/confirmed/cancelled, meeting scheduled/started/cancelled, meeting reminders, or ratings submitted), the relevant backend service dispatches `notificationService.createNotification` inside a non-blocking try/catch block.
- **Immediate Socket.io Room Broadcast:** The persisted and populated notification document is broadcast instantly to the recipient's personal room `user:<recipientId>` via the `notification` event alongside the updated `unreadCount`.
- **Race-Safe State & Deduplication:** The frontend `NotificationContext` merges incoming notifications with MongoDB `_id` deduplication, updates live badge counts in `Navbar.jsx` (desktop bell badge & mobile menu badge), and maintains unread filtering in `NotificationsPage.jsx`.
- **Instant Unread Sync:** Marking notifications read individually (`PATCH /api/notifications/:id/read`) or in bulk (`PATCH /api/notifications/read-all`) synchronizes real-time `notification_unread_update` events across all active client tabs.

## 6. Real-Time Layer
Socket.io runs on the same Express server (attached to the same HTTP server instance) — no separate service. Rooms are keyed by:
- `swap:<swapId>`: Isolated chat communications, real-time message cards, and meeting updates (`meeting_created`, `meeting_updated`).
- `user:<userId>` (derived strictly from verified JWT identity): Real-time swap request updates (`swap_request_created`, `swap_request_updated`), in-app notifications (`notification`), and live unread badge synchronization (`notification_unread_update`, `chat_unread_update`).

## 7. Scalability Notes (mini-project scope, but designed sensibly)
- Stateless REST layer — JWT means no server-side session store, so the API layer could scale horizontally behind a load balancer later without rework
- MongoDB indexes on `skillsOffered`, `skillsWanted`, and user location fields to keep search/matching performant as user count grows
- Socket.io scoped to per-swap rooms rather than broadcasting globally, avoiding unnecessary message fan-out
- Cloudinary and Jitsi are both externally hosted, so media/video load never touches the app server

## 8. Deployment Topology
- **Frontend**: Vercel (static build, auto-deploy from repo)
- **Backend**: Render (Express + Socket.io server, single service)
- **Database**: MongoDB Atlas (free-tier cluster)
- **Media**: Cloudinary (free-tier)
- Environment variables (JWT secret, Mongo URI, Cloudinary keys) managed via `.env` locally and Render/Vercel's environment settings in production

## 9. Security Considerations
- Passwords hashed with bcrypt before storage — never stored or logged in plaintext
- JWT signed with a secret from environment variables, never hardcoded; short-lived tokens preferred over long-lived ones
- All protected routes pass through `authMiddleware` — no route trusts a client-supplied user ID without verifying the token first
- Input validation (Zod/Joi) on every route accepting user input, to block malformed or malicious payloads before they hit the database
- CORS restricted to the deployed frontend origin only, not left wide open
- File uploads (portfolio media, pfp) validated for file type and size before reaching Cloudinary, to prevent abuse
- No sensitive data (passwords, JWT secret, API keys) ever committed to the repo — all in `.env`, excluded via `.gitignore`
- Rate limiting on auth routes (login/signup) to reduce brute-force risk, even at basic mini-project scope
