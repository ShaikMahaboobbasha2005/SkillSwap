# 12 — Viva Questions and Answers

## SkillSwap — BTech Mini-Project Viva Preparation

*35 questions with concise, technically accurate answers based on the actual implementation.*

---

## Section A: Project Overview and Motivation

---

**Q1. What is SkillSwap and what problem does it solve?**

SkillSwap is a peer-to-peer skill exchange web platform where users barter skills instead of paying for courses. The problem it solves: millions of people have skills worth teaching but no easy channel to trade them with someone who has what they want to learn in return. SkillSwap removes the money layer and creates a community-driven knowledge barter economy.

---

**Q2. Why did you choose a skill-exchange platform specifically?**

Learning a new skill typically requires paying for a course or a tutor. Yet most people already possess expertise that others would pay to learn. SkillSwap addresses this asymmetry — if you can teach React and want to learn guitar, you find someone who teaches guitar and wants to learn React, and you swap. It democratises learning without requiring money.

---

**Q3. What are the core user flows in SkillSwap?**

1. Register/Login → 2. Set up profile with offered and wanted skills → 3. Discover other users or view AI-powered matches → 4. Send a swap request → 5. Accept request → 6. Chat in real time → 7. Schedule and join a video call → 8. Mark the swap as complete (both parties confirm) → 9. Rate and review each other → 10. Reputation updates automatically.

---

**Q4. What features make SkillSwap different from a regular skill marketplace?**

- **Barter model** — no money exchanges, purely skill-for-skill.
- **Two-party completion confirmation** — ensures accountability before reputation is affected.
- **Integrated chat + Jitsi video** — no need for external tools.
- **70/30 hybrid AI matching** — deterministic foundation with opt-in Gemini AI.
- **Portfolio gallery** — Instagram-style media showcase with social reactions.
- **Cinematic 3D landing page** built with Three.js.
- **Full dark mode** with anti-FOUC architecture.

---

## Section B: Technology Stack

---

**Q5. What is the technology stack of SkillSwap?**

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS v4, Three.js, Axios, React Router v7, Socket.IO client |
| Backend | Node.js, Express.js v5, Mongoose v9, Socket.IO v4, Zod, Multer, bcryptjs, jsonwebtoken |
| Database | MongoDB Atlas (cloud-hosted, free tier) |
| Media | Cloudinary (image and video uploads) |
| AI | Google Gemini Flash via `@google/genai` |
| Video | Jitsi Meet External API (WebRTC) |
| Deployment | Vercel (frontend), Render (backend) |

---

**Q6. Why did you choose MongoDB over a relational database like MySQL?**

MongoDB's document model suits SkillSwap's flexible, evolving schema — user skills, swap requests, and portfolio items have nested or variable structures that would require complex join tables in SQL. MongoDB also scales horizontally with sharding and integrates naturally with Node.js via Mongoose. The free-tier Atlas cluster provided a ready cloud deployment without infrastructure management.

---

**Q7. Why React 19 and Vite instead of older versions?**

React 19 introduced the React Compiler (used in the build via `babel-plugin-react-compiler`) which automatically memoises components, reducing unnecessary re-renders without manual `useMemo`/`useCallback`. Vite 8 provides near-instant HMR (Hot Module Replacement) and fast production builds using Rolldown/ESBuild, far outperforming Create React App's Webpack pipeline.

---

**Q8. Why Express.js v5?**

Express v5 added async error handling by default — unhandled promise rejections in route handlers propagate to the error middleware without needing explicit try/catch or `asyncHandler` wrappers. It maintains full backward compatibility with v4 middleware.

---

**Q9. What is Tailwind CSS v4 and how is it different from v3?**

Tailwind CSS v4 moves from a PostCSS plugin model to a Vite-native plugin (`@tailwindcss/vite`). It introduces `@custom-variant` for custom variants like dark mode, CSS-first configuration (no `tailwind.config.js` needed for most settings), and a new `@theme` directive for design tokens directly in CSS. Startup and build times are also significantly faster.

---

**Q10. What is Three.js and why was it used?**

Three.js is a WebGL library that provides a JavaScript API for 3D graphics in the browser. It was used to build the cinematic 3D landing page — two sculptural PBR-material capsule avatars with a 5-stage scroll-driven choreography (Discover → Match → Exchange → Learn → Grow) that visually communicates the platform's core exchange mechanic.

---

## Section C: Backend Architecture

---

**Q11. What architectural pattern does the backend follow?**

The backend follows the **MVC-like layered monolith** pattern:
- **Routes** — declare endpoints; stay thin.
- **Controllers** — handle HTTP request/response; validate, call service, respond.
- **Services** — contain all business logic (matching algorithm, notification creation, swap lifecycle).
- **Models** — Mongoose schemas; interface with MongoDB.
- **Utilities** — reusable deterministic functions (skill normalization, validators).

This keeps controllers testable without HTTP overhead and services testable without HTTP.

---

**Q12. How does the backend handle errors consistently?**

All errors propagate to a shared `errorHandler` middleware in `middleware/errorHandler.js`. Controllers and services throw errors (or use next(err)), and the handler serialises them as `{ success: false, message: "..." }`. Stack traces are never exposed to clients. This prevents scattered custom error handling across route files.

---

**Q13. How is input validation handled?**

Zod (v4) is used as the primary validation library. Schemas are defined per endpoint and applied via `validateRequest` middleware or inline `schema.parse()`. Zod provides strict type enforcement, custom error messages, and coercion where needed. Some older routes use Joi for the same purpose. All validation happens before any database operation; invalid requests receive a 400 response.

---

**Q14. How is the Socket.IO server set up?**

The Socket.IO server is attached to the same Node.js `http.Server` instance as Express — no separate process or port. The `io` instance is created in `server.js`, registered on the app (`app.set("io", io)`), and passed to `notificationService.setIO(io)` for centralized notification broadcasts. The `initSockets(io)` function in `sockets/socketHandler.js` registers all connection and event handlers.

---

## Section D: Database Design

---

**Q15. How many MongoDB collections does SkillSwap use?**

Nine: `users`, `skills`, `swaprequests`, `messages`, `meetingsessions`, `ratings`, `notifications`, `portfolios`, `portfolioreports`.

---

**Q16. How does the Skill collection relate to Users?**

Each `Skill` document has an `owner` field (ObjectId ref to `User`). User documents reference skill IDs in arrays (`skillsOffered`, `skillsWanted`). This is a **one-to-many** relationship — one user owns many skills. Storing skills as separate documents allows independent querying, indexing, and status toggling without modifying the User document on every change.

---

**Q17. What prevents duplicate swap requests between the same two users?**

A compound index `{ fromUser, toUser, offeredSkill, wantedSkill, status }` enables fast lookup. Before creating a new swap, the service checks for an existing `pending` or `accepted` swap between the same two users for the same skill pair in **either direction** (fromUser/toUser swapped). If found, a `409 Conflict` is returned.

---

**Q18. How are `avgRating` and `completedSwaps` kept accurate?**

Both are **server-managed** and cannot be set by clients:
- `avgRating` is recalculated after every rating submission using MongoDB aggregation: `Rating.aggregate([{ $match: { ratedUser: userId } }, { $group: { _id: null, avg: { $avg: "$stars" } } }])`, then rounded to 1 decimal place and stored on the `User` document.
- `completedSwaps` is incremented by 1 for both participants when two-party completion confirmation succeeds, using `User.findByIdAndUpdate` with `$inc: { completedSwaps: 1 }`.

---

**Q19. How does the rating uniqueness work?**

The `Rating` collection has a **compound unique index** `{ swapRequest: 1, reviewer: 1 }`. This enforces at the database level that each user can submit only one rating per completed swap. If a second attempt is made, MongoDB throws a duplicate key error (E11000), which the service catches and returns as a `409 Conflict`.

---

## Section E: Authentication and Security

---

**Q20. How does JWT authentication work in SkillSwap?**

On signup/login, the server signs a JWT containing `{ id, role, iat, exp }` using `process.env.JWT_SECRET` (HS256). The client stores this token and attaches it as `Authorization: Bearer <token>` on every subsequent API request. `authMiddleware.js` verifies the token with `jwt.verify()` and attaches `req.user = { id, _id, role }` to the request context. Expired tokens return HTTP 401.

---

**Q21. How are passwords stored securely?**

Passwords are hashed using `bcryptjs` with 10 salt rounds. The hash is stored in `User.passwordHash`. The plaintext password is **never** stored or logged. On login, `bcrypt.compare(plaintext, hash)` is used — this is a constant-time comparison that prevents timing attacks.

---

**Q22. How does Socket.IO authentication work?**

During the WebSocket handshake, the client provides the JWT in `socket.auth.token`. The socket handler verifies this token using `jwt.verify()`. User personal rooms (`user:<userId>`) are keyed strictly from the **verified token payload** — never from client-supplied parameters. This prevents room spoofing.

---

**Q23. How is CORS configured and why is it important?**

CORS (Cross-Origin Resource Sharing) controls which browser origins can make requests to the API. In `server.js`, CORS is configured to allow only the origin specified in `process.env.CLIENT_URL` (the deployed Vercel URL in production). In development, `localhost:5173` and `localhost:5174` are whitelisted. This prevents malicious websites from making API calls on behalf of a logged-in user (CSRF via CORS).

---

## Section F: AI Matching

---

**Q24. How does the deterministic recommendation engine work?**

1. Fetch all users (excluding self) with at least one Active skill.
2. For each candidate, normalise all skill names using the canonical alias dictionary (`skillNormalization.js`).
3. Compute: `exactMatchesForYou` (their offered ∩ my wanted), `exactMatchesForThem` (my offered ∩ their wanted), `mutualMatch` (both directions non-empty), `relatedMatches` (same category, no exact match).
4. Score = `getDirectionalScore(forYou) + getDirectionalScore(forThem) + mutualBonus + relatedBonus`, clamped 0–100.
5. Sort by `compatibilityScore DESC`, `mutualMatch DESC`, `exactMatchCount DESC`.
6. Generate human-readable reasons from actual match data.

---

**Q25. What is the diminishing-returns scoring formula?**

```
getDirectionalScore(n) → 0: 0, 1: 26, 2: 36, 3: 42, 4: 45, 5+: 46
Mutual exchange bonus: +20
Related category bonus: +8 per match (max +16)
```

This creates meaningful score differences: 1↔1 = 72%, 2↔1 = 82%, 2↔2 = 92%, 3↔2 = 98%, 3↔3 = 100%. Without diminishing returns, every user with ≥ 2 matches would cluster at 100%.

---

**Q26. What is the 70/30 hybrid AI scoring formula?**

```
hybridScore = round(traditionalScore * 0.70 + semanticScore * 0.30)
```

The 70% deterministic weight anchors the score to verified skill matches. The 30% Gemini semantic weight allows domain-level insights (e.g. `Frontend Engineering` ↔ `React` + `CSS`). This prevents a weak candidate with a high AI score from displacing a strong mutual exact-match candidate.

---

**Q27. What happens if the Gemini API is unavailable?**

`geminiMatchingService.js` wraps the Gemini call in a try/catch. If `GEMINI_API_KEY` is absent, or if the API times out, rate-limits (429), or returns malformed JSON, the service logs a sanitised warning and returns `null`. `recommendationService.js` detects this and serves 100% deterministic scores. The response includes `meta.isAiEnhanced: false` so the client can inform the user with a non-blocking toast.

---

**Q28. How does skill alias resolution work?**

`skillNormalization.js` contains a curated dictionary mapping common aliases to canonical identifiers:
- `"JS"` → `"javascript"`, `"NodeJS"` → `"node.js"`, `"ReactJS"` → `"react"`, `"UI UX"` → `"ui/ux design"`, `"cpp"` → `"c++"`, `"ts"` → `"typescript"`

False-equivalence guards prevent incorrect matches: `"java"` ≠ `"javascript"`, `"react"` ≠ `"react native"`, `"python"` ≠ `"django"`. Original user-entered names are preserved in the database and in human-readable match reasons.

---

## Section G: Real-Time Features

---

**Q29. How does real-time chat work technically?**

1. Client authenticates with the server via Socket.IO using JWT.
2. Client emits `join_swap_chat` with the `swapId`; server verifies JWT + swap participation and joins `socket.rooms.add("swap:<swapId>")`.
3. When the client emits `send_message`, the server persists the message to MongoDB first (status `sent` or `delivered`), then broadcasts `new_message` to all sockets in `swap:<swapId>`.
4. When the recipient opens the conversation, the client emits `mark_messages_read`, which updates status in DB and broadcasts `messages_status_update` to the room.
5. Message status transitions: `sent` → `delivered` → `read` (unidirectional, never downgraded).

---

**Q30. How are real-time notifications delivered?**

Each authenticated user has a personal Socket.IO room `user:<userId>`. When a service (swap, meeting, rating) calls `notificationService.createNotification(...)`, the service:
1. Persists the `Notification` document to MongoDB.
2. Populates sender and swap references.
3. Emits the populated notification + updated `unreadCount` to `user:<userId>`.

The client's `NotificationContext` merges incoming notifications using MongoDB `_id` deduplication to prevent duplicates.

---

## Section H: Design and UI

---

**Q31. What design system does SkillSwap use?**

A custom design system inspired by Linear, with:
- **Light mode:** warm cream background (`#F7F6F2`), pine green accent (`#1B4332`)
- **Dark mode:** deep charcoal (`#0F1210`), emerald accent (`#3FA873`)
- Consistent spacing tokens (4px–48px), border radius tokens (cards: 16px, buttons: 10px)
- Gold (`#B8860B`) reserved strictly for star ratings
- Typography: sans-serif (Inter-inspired scale); wordmark uses Georgia as a one-off brand exception

---

**Q32. How is the dark mode implemented without a flash of unstyled content (FOUC)?**

A synchronous `<script>` tag runs inside `<head>` in `index.html` **before React or CSS loads**:
1. Reads `localStorage.getItem("skillswap_theme")` (default: `"system"`).
2. If `"dark"`, or if `"system"` and `window.matchMedia("(prefers-color-scheme: dark)").matches`, immediately adds class `dark` to `document.documentElement`.

This means the browser applies dark styles before any paint — zero white flash.

---

## Section I: Testing and Quality

---

**Q33. What automated tests does SkillSwap have?**

53 tests across 5 Node.js scripts in `server/test/`:
- `recommendation_test.js` — 15 tests (scoring algorithm, alias resolution, false-equivalence guards)
- `meeting_test.js` — 10 tests (access control, room generation, reminder idempotency)
- `notification_test.js` — 12 tests (pipeline, socket broadcast, pagination, mark-read)
- `rating_swap_association_test.js` — 4 tests (duplicate prevention, avgRating update)
- `gemini_matching_test.js` — 12 tests (AI opt-in, 70/30 math, fallback, score bounds, anti-hallucination)

Tests use Node.js `assert` module with a custom `runTest` helper — no external test framework.

---

## Section J: Challenges and Future Work

---

**Q34. What were the main technical challenges during development?**

1. **Race conditions in two-party completion** — solved with atomic `findOneAndUpdate` operations that check and update state in a single MongoDB operation.
2. **Message deduplication in real-time chat** — solved by tracking message `_id` in a `Map` on the frontend to prevent duplicate renders from both ACK and broadcast.
3. **Skill alias matching without false equivalences** — required a carefully curated alias dictionary with explicit false-equivalence guards for pairs like `Java` / `JavaScript` and `React` / `React Native`.
4. **Anti-FOUC for dark mode** — solved by a synchronous inline script in `index.html` that applies the `.dark` class before React renders.
5. **Portfolio delete undo with 5-second window** — required optimistic UI hiding, a countdown timer, and deferred database/Cloudinary deletion with race condition protection across multiple simultaneous deletions.

---

**Q35. What would you improve if you had more time?**

1. **Email verification and password reset** — the most important missing security features.
2. **Admin moderation panel** — to process portfolio reports via a UI rather than direct database access.
3. **Redis adapter for Socket.IO** — to enable horizontal backend scaling.
4. **Rate limiting** — `express-rate-limit` on auth and upload routes.
5. **Frontend unit tests** — React Testing Library tests for critical components (swap request modal, chat, rating modal).
6. **Collaborative filtering** — learning from successful swap patterns to improve AI recommendations beyond pure semantic matching.
7. **Native mobile app** — React Native version with push notifications (currently in-app only, browser-tab-dependent).

---

*All answers verified against the actual implemented codebase — October 2026.*

