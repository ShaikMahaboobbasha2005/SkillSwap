# 02 — Software Requirements Specification (SRS)

## SkillSwap — Peer-to-Peer Skill Exchange Platform

**Version:** 1.0  
**Date:** October 2026  
**Project Type:** BTech Mini-Project

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) defines the functional and non-functional requirements for SkillSwap — a web-based platform enabling users to barter skills directly with one another. It serves as the reference document for project evaluation and viva preparation.

### 1.2 Scope

SkillSwap covers the end-to-end workflow: user onboarding → skill listing → discovery and AI matching → swap negotiation → real-time chat and video → swap completion → ratings and portfolio showcase.

### 1.3 Definitions

| Term | Meaning |
|---|---|
| **Swap** | A bilateral skill-exchange agreement between two users |
| **Offered Skill** | A skill the user can teach another person |
| **Wanted Skill** | A skill the user wants to learn |
| **Compatibility Score** | A 0–100 integer measuring how well two users' skills complement each other |
| **JWT** | JSON Web Token — the stateless authentication mechanism used |
| **Socket.IO** | Real-time WebSocket library used for chat and live events |
| **Cloudinary** | Cloud media storage service used for images and videos |
| **Jitsi Meet** | Open-source WebRTC-based video conferencing embedded in the app |

---

## 2. Overall Description

### 2.1 Product Perspective

SkillSwap is a standalone web application consisting of a React SPA frontend and a Node.js/Express.js REST + WebSocket backend, connected to MongoDB Atlas as the primary data store and supplemented by Cloudinary (media), Jitsi (video), and Google Gemini Flash (AI matching).

### 2.2 Product Functions (Summary)

1. User registration and authentication
2. Profile management with avatar, banner, bio, location, and social links
3. Skill management (offered and wanted skills with category and proficiency level)
4. User discovery with search and filters
5. Deterministic + optional AI-powered skill-match recommendations
6. Swap request lifecycle management
7. Real-time chat with message status receipts
8. Integrated video meeting scheduling and embedding
9. Real-time notification centre with deep-linking
10. Portfolio media gallery with reactions and moderation
11. Post-swap ratings and automated reputation scoring
12. Personal analytics dashboard
13. System / Light / Dark theme switcher

### 2.3 User Classes and Characteristics

| Class | Description |
|---|---|
| **Unauthenticated Visitor** | Can view the landing page; cannot access any application features |
| **Authenticated User** | The primary actor; can access all platform features |
| **Admin (Reserved)** | Role field exists in the database (`"admin"`) but no admin panel is implemented in the current version |

### 2.4 Operating Environment

- **Browser**: Any modern browser supporting ES2022+, WebGL (for landing page 3D), and WebSocket connections.
- **Backend Runtime**: Node.js v20 or higher.
- **Database**: MongoDB Atlas (cloud-hosted, accessed over TLS).
- **Hosting**: Frontend on Vercel (static build), Backend on Render (Express + Socket.IO).

---

## 3. Functional Requirements

### FR-01: User Authentication

| ID | Requirement |
|---|---|
| FR-01.1 | Users shall be able to register with a name, email, and password. |
| FR-01.2 | Passwords shall be hashed with bcrypt before storage. Raw passwords are never persisted. |
| FR-01.3 | Users shall receive a JWT on successful login, which must be sent as `Authorization: Bearer <token>` on all subsequent protected requests. |
| FR-01.4 | The system shall reject requests with missing, malformed, or expired JWT tokens with HTTP 401. |
| FR-01.5 | Authenticated users shall be able to log out via `POST /api/auth/logout`. |
| FR-01.6 | Authenticated users shall be able to fetch their own profile via `GET /api/auth/me`. |

### FR-02: User Profiles

| ID | Requirement |
|---|---|
| FR-02.1 | Users shall be able to edit their name, location (city only), bio (max 160 chars), and social links (LinkedIn, GitHub, Instagram, YouTube, personal website). |
| FR-02.2 | Users shall be able to upload and replace their profile picture and profile banner via Cloudinary. Old assets shall be automatically deleted from Cloudinary when replaced. |
| FR-02.3 | The fields `avgRating` and `completedSwaps` shall be server-managed only; clients cannot set them directly. |
| FR-02.4 | Any authenticated user shall be able to view any other user's public profile (`GET /api/users/:id`). |

### FR-03: Skill Management

| ID | Requirement |
|---|---|
| FR-03.1 | Users shall be able to add, edit, and delete offered skills (`type: "Offer"`) and wanted skills (`type: "Learn"`). |
| FR-03.2 | Each skill shall have a name, category (one of 20 defined categories), proficiency level (Beginner / Intermediate / Advanced / Expert), optional description (max 250 chars), and optional years of experience. |
| FR-03.3 | A skill shall be in Active or Inactive status; only Active skills appear in discovery and matching. |
| FR-03.4 | The system shall prevent duplicate skills of the same type and name for the same user at the database level (compound unique index). |

### FR-04: Discovery

| ID | Requirement |
|---|---|
| FR-04.1 | Authenticated users shall be able to browse a paginated grid of other users via `GET /api/discover`. |
| FR-04.2 | The discover endpoint shall support filtering by skill name keyword, skill category, skill type (Offer/Learn), proficiency level, and sorting. |
| FR-04.3 | Each result card shall present one unique user (not multiple rows per skill). |

### FR-05: Recommendations and AI Matching

| ID | Requirement |
|---|---|
| FR-05.1 | The system shall compute a compatibility score (0–100) for each candidate using a deterministic progressive diminishing-returns algorithm. |
| FR-05.2 | Canonical skill alias resolution shall be applied before scoring (e.g. `JS` ↔ `JavaScript`, `ReactJS` ↔ `React`). |
| FR-05.3 | Default recommendations (`GET /api/recommendations`) shall return deterministic results with zero Gemini API calls. |
| FR-05.4 | When `?ai=true` is appended, the system shall invoke Google Gemini Flash to compute a semantic score (0–100), then combine scores as `round(traditionalScore * 0.70 + semanticScore * 0.30)`. |
| FR-05.5 | If the Gemini API is unavailable, the system shall fall back to 100% deterministic scores without any client-visible error. |

### FR-06: Swap Request Lifecycle

| ID | Requirement |
|---|---|
| FR-06.1 | Any authenticated user shall be able to send a swap request to another user specifying one of their own offered skills and one of the recipient's offered skills. |
| FR-06.2 | The system shall reject duplicate swap requests between the same two users for the same skill pair (409 Conflict). |
| FR-06.3 | Swap status shall progress through: `pending` → `accepted` / `rejected` / `cancelled`. |
| FR-06.4 | Either participant of an accepted swap may request completion. The partner must confirm before status transitions to `completed`. |
| FR-06.5 | Either participant may cancel a pending completion request; the swap returns to `accepted` status. |
| FR-06.6 | Either participant may leave an accepted swap (`status: "left"`). |
| FR-06.7 | Both users' `completedSwaps` count shall increment exactly once when a swap is confirmed complete. |
| FR-06.8 | Participants may hide swaps from their view without deleting the record. |

### FR-07: Real-Time Chat

| ID | Requirement |
|---|---|
| FR-07.1 | Chat shall be available only for accepted swaps. |
| FR-07.2 | Messages shall be persisted to MongoDB before being broadcast to the Socket.IO room. |
| FR-07.3 | Message status shall transition unidirectionally: `sent` → `delivered` → `read`. |
| FR-07.4 | Completed or left swaps shall become read-only; message composer shall be disabled. |
| FR-07.5 | Users shall be able to soft-delete their own sent messages. |
| FR-07.6 | Users shall be able to delete a conversation from their personal history (`chatDeletedFor`) without affecting the partner. |

### FR-08: Video Meetings

| ID | Requirement |
|---|---|
| FR-08.1 | Video meetings shall only be available to participants of accepted swaps. |
| FR-08.2 | Users shall be able to start an instant video session or schedule a future session with a selectable duration (15, 30, 45, or 60 minutes). |
| FR-08.3 | Meeting sessions shall generate a deterministic, collision-resistant Jitsi room name. |
| FR-08.4 | Meeting invitations shall appear as interactive message cards in the chat thread. |
| FR-08.5 | The background reminder job shall send notifications 15 minutes before scheduled sessions and at session start time, with idempotency guards preventing duplicate alerts. |

### FR-09: Notifications

| ID | Requirement |
|---|---|
| FR-09.1 | In-app notifications shall be created for: new swap request, swap accepted, swap rejected, swap left, completion requested, completion confirmed, completion cancelled, meeting scheduled, meeting started, meeting reminder, meeting cancelled, rating received. |
| FR-09.2 | Notifications shall be delivered in real time to the recipient's personal Socket.IO room (`user:<userId>`). |
| FR-09.3 | Users shall be able to mark individual notifications or all notifications as read. |
| FR-09.4 | Clicking a notification shall deep-link to the specific entity (swap card, chat message, or profile) and visually highlight it. |

### FR-10: Portfolio

| ID | Requirement |
|---|---|
| FR-10.1 | Users shall be able to upload images (jpg, jpeg, png, webp ≤ 10 MB) and short videos (mp4, webm ≤ 50 MB, max 60 seconds). |
| FR-10.2 | The system shall enforce limits of 20 images, 10 videos, and 30 total items per user. |
| FR-10.3 | Portfolio items shall support a caption (max 500 chars) and an optional link to one of the user's own skills. |
| FR-10.4 | Authenticated users shall be able to react to any portfolio item with one of four types: Like, Impressive, Great Work, Creative. One reaction per user per item. |
| FR-10.5 | Any authenticated user shall be able to report a portfolio item for moderation with a category and optional description. Duplicate reports by the same user shall be rejected (409). |
| FR-10.6 | Edits and deletions shall provide a 5-second undo window before changes are finalised. |

### FR-11: Ratings and Reviews

| ID | Requirement |
|---|---|
| FR-11.1 | A rating (1–5 stars, optional text review up to 500 chars) may only be submitted for a `completed` swap by a participant. |
| FR-11.2 | Each user may submit only one rating per completed swap (compound unique index enforced at database level). |
| FR-11.3 | `User.avgRating` shall be recalculated by the server using MongoDB aggregation after every rating submission, rounded to 1 decimal place. |
| FR-11.4 | Users shall not be able to rate themselves. |

---

## 4. Non-Functional Requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-01 | Responsiveness | The UI shall be fully usable on desktop (≥1024px), tablet (768–1023px), and mobile (<768px) viewports. |
| NFR-02 | Security | Passwords shall never be stored in plaintext. JWT secrets shall never be committed to version control. |
| NFR-03 | Statelessness | The REST API shall be stateless — no server-side session store. JWT carries all authentication state. |
| NFR-04 | Validation | Every endpoint accepting a request body shall validate input via Zod or Joi before touching the database. |
| NFR-05 | Error handling | All errors shall be handled by the shared `errorHandler` middleware and return `{ success: false, message }`. Stack traces shall never be exposed to clients in production. |
| NFR-06 | CORS | The server shall restrict CORS to the configured `CLIENT_URL` origin; it shall not be left open to all origins. |
| NFR-07 | Media Safety | Uploaded files shall be validated for type and size before reaching Cloudinary. |
| NFR-08 | Accessibility | Interactive elements shall include `aria-label` attributes. The UI shall respect `prefers-reduced-motion`. Colour contrast shall meet WCAG AA (4.5:1 normal text, 3:1 large text). |
| NFR-09 | Performance | Default (non-AI) recommendations shall execute with zero external API calls. |
| NFR-10 | Availability | The AI matching layer shall degrade gracefully to deterministic-only mode if the Gemini API is unavailable. |

---

## 5. User Roles and Permissions

| Action | Unauthenticated | Authenticated User |
|---|---|---|
| View landing page | ✅ | ✅ |
| Register / Login | ✅ | N/A |
| View any user's public profile | ❌ | ✅ |
| Edit own profile | ❌ | ✅ (own only) |
| Add/edit/delete skills | ❌ | ✅ (own only) |
| View discover grid | ❌ | ✅ |
| View recommendations | ❌ | ✅ |
| Send swap request | ❌ | ✅ |
| Accept/reject swap request | ❌ | ✅ (recipient only) |
| Cancel swap request | ❌ | ✅ (sender only) |
| Chat | ❌ | ✅ (accepted swap participants only) |
| Start/schedule video meeting | ❌ | ✅ (accepted swap participants only) |
| View notifications | ❌ | ✅ (own only) |
| Upload portfolio item | ❌ | ✅ |
| React to portfolio item | ❌ | ✅ |
| Report portfolio item | ❌ | ✅ (non-owners only) |
| Submit rating | ❌ | ✅ (completed swap participants only) |
| View ratings for a user | ✅ | ✅ |
| Modify `avgRating` or `completedSwaps` | ❌ | ❌ (server-managed only) |

---

## 6. Hardware and Software Requirements

### Development Environment

| Component | Requirement |
|---|---|
| OS | Windows 10+, macOS 12+, or Ubuntu 20.04+ |
| CPU | Modern dual-core; quad-core recommended for Three.js development |
| RAM | 8 GB minimum; 16 GB recommended |
| Node.js | v20.x or higher |
| npm | v10.x or higher |
| Browser | Chrome 120+, Firefox 120+, Edge 120+ |
| Internet | Required for MongoDB Atlas, Cloudinary, and Gemini API |

### Production Environment

| Service | Platform | Notes |
|---|---|---|
| Frontend | Vercel | Static build, auto-deploy |
| Backend | Render | Single Express + Socket.IO server |
| Database | MongoDB Atlas | Free-tier cluster |
| Media | Cloudinary | Free-tier |
| Video | Jitsi Meet | No account required; free public infrastructure |

---

## 7. Use Cases (Textual)

### UC-01: Register New Account
**Actor:** Unauthenticated visitor  
**Precondition:** User has a valid email address and the application is running.  
**Main Flow:**
1. User navigates to `/signup`.
2. User enters name, email, and password.
3. System validates input via Zod schema.
4. System hashes password with bcrypt and creates a `User` document.
5. System returns a JWT and the new user object.
6. User is redirected to the Home dashboard.  
**Error Paths:** Duplicate email → 409 Conflict; invalid input → 400 Validation Error.

### UC-02: Send a Swap Request
**Actor:** Authenticated user  
**Precondition:** User has at least one active offered skill; target user has at least one active offered skill.  
**Main Flow:**
1. User views target user's public profile or discover card.
2. User clicks "Request Swap".
3. Swap Request modal opens; user selects their offered skill and the target's skill they want.
4. User optionally adds a message.
5. System validates, checks for duplicates, and creates a `SwapRequest` document (`status: "pending"`).
6. Target user receives a real-time `swap_request_created` socket event and an in-app notification.  
**Error Paths:** Duplicate request → 409; missing active skills → 400.

### UC-03: Complete a Swap
**Actor:** Either participant of an accepted swap  
**Precondition:** SwapRequest status is `"accepted"`.  
**Main Flow:**
1. User A clicks "Mark Completed".
2. System sets `completionRequestedBy: UserA`; status remains `"accepted"`.
3. User B receives a notification and sees a confirmation banner in the UI.
4. User B clicks "Confirm Completion".
5. System sets `status: "completed"`, records `completedAt`, increments `completedSwaps` for both users, and archives the chat.
6. Both users can now rate each other.  
**Alternative:** User B clicks "Not Yet" → resets completion request; swap remains `"accepted"`.

---

## 8. Assumptions and Constraints

| Assumption / Constraint | Description |
|---|---|
| Internet connectivity | The application requires an active internet connection to function (cloud database, media, AI). |
| Free-tier limits | MongoDB Atlas free tier limits storage to 512 MB; Cloudinary free tier limits bandwidth. |
| English-language interface | The UI and all copy are in English; no internationalisation is implemented. |
| No email service | There is no SMTP integration; no account verification or password reset emails are sent. |
| Jitsi public infrastructure | Video calls rely on Jitsi's public `meet.jit.si` infrastructure; uptime is dependent on Jitsi's SLA. |
| Single-region database | MongoDB Atlas free tier provides a single-region cluster; there is no geo-distribution. |
| Gemini Flash rate limits | The AI matching feature is opt-in to protect against Gemini API quota exhaustion. |

---

*Document verified against source code: `c:\SkillSwap\` — October 2026.*

