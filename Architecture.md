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
├── pages/          # route-level views (Login, Signup, Home, DiscoverPage, OwnProfile, PublicProfile, SwapRequestsPage)
├── components/     # reusable UI
│   ├── profile/    # CompactProfileStats, AvatarLightboxModal
│   ├── swaps/      # SwapRequestModal, SwapRequestCard, IncomingRequests, OutgoingRequests, StatusBadge, EmptySwapState, SwapRequestSkeleton
│   └── ...         # Navbar, ProfileBanner, Modal, ConfirmModal, ToastNotification, SkillsSection, etc.
├── context/         # AuthContext, SwapContext, SocketContext
├── hooks/           # useAuth, useDiscover, useSocket
├── services/        # API call wrappers (authService, skillService, discoverService, profileService, swapService)
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
├── models/           # Mongoose schemas: User, Skill, SwapRequest, Message, Rating, Notification
├── routes/           # /auth, /users, /skills, /search, /matches, /swaps, /chat, /ratings, /notifications
├── controllers/      # business logic per route group
├── middleware/        # authMiddleware (JWT verify), errorHandler, validateRequest (Zod/Joi)
├── services/          # matchingService, aiRecommendationService, notificationService
├── sockets/            # socket.io connection handler + chat event logic
└── server.js           # Express app + Socket.io server bootstrap
```

**Layering rule:** routes stay thin → controllers handle request/response → services hold the actual logic (matching algorithm, AI scoring, notification creation). This keeps matching/AI logic testable independent of HTTP.

## 5. Key Flows

**Auth**
Client → `/auth/login` → controller verifies credentials → issues JWT → client stores it → attached as `Authorization: Bearer` on every subsequent request → `authMiddleware` verifies on protected routes.

**Matching**
`matchingService` runs rule-based overlap (skills-offered ∩ target's skills-wanted, and vice versa) → returns a candidate list → `aiRecommendationService` re-scores and re-orders that same candidate list by compatibility → combined ranked result returned to client. AI never runs independently of the traditional match set — it's a ranking layer on top, not a replacement.

**Swap Request → Chat**
Swap request accepted → a `chatRoom` is created/linked between the two users → Socket.io room joined by both clients → messages persist to `Message` collection and broadcast in real time.

**Session Completion → Rating**
Either user marks the swap complete → triggers a notification to the other party → both users can submit a rating tied to that swap → `User.avgRating` and `User.completedSwaps` are recalculated (not manually editable fields).

**Portfolio Media**
Upload → multer (in-memory) → Cloudinary upload → returned URL stored in `User.portfolio[]` → displayed as a grid on the profile page, videos served via Cloudinary's video delivery.

## 6. Real-Time Layer
Socket.io runs on the same Express server (attached to the same HTTP server instance) — no separate service. Namespaces/rooms are keyed by swap/chat ID so messages only broadcast to the two relevant users.

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
