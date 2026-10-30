# 07 — Security and Configuration

## SkillSwap — Security Architecture and Environment Configuration

---

## 1. Authentication Security

### JWT (JSON Web Token)

- **Algorithm:** HS256 (HMAC-SHA256) symmetric signing.
- **Secret:** Loaded from `process.env.JWT_SECRET`. Never hardcoded. Never committed to version control.
- **Payload:** `{ id, role, iat, exp }` — contains only the user's database `_id` and role.
- **Expiry:** Configurable via `process.env.JWT_EXPIRES_IN` (recommended: `"7d"`).
- **Transmission:** Sent as `Authorization: Bearer <token>` in the HTTP header. No HttpOnly cookie is used in the current implementation.
- **Verification:** Every protected route passes through `authMiddleware.js`, which calls `jwt.verify(token, process.env.JWT_SECRET)`. On expiry, a clear `"Token has expired. Please log in again."` error (HTTP 401) is returned.
- **Socket.IO handshake:** The JWT is provided in `socket.auth.token` during the WebSocket connection handshake. User identity for Socket.IO rooms (`user:<userId>`) is derived strictly from the **verified JWT** — never from client-supplied parameters.

### Password Hashing

- **Library:** `bcryptjs` v3.
- **Salt rounds:** 10 (default, provides a balance of security and compute cost).
- **Storage:** Only the bcrypt hash is persisted in `User.passwordHash`. Plaintext passwords are **never** logged or stored.
- **Comparison:** Login uses `bcrypt.compare(plaintextPassword, storedHash)` — constant-time comparison.

---

## 2. Authorization

### Route-Level Authorization

All protected routes use `authMiddleware.js` to verify the JWT and attach `req.user = { id, _id, role }` to the request context. No route trusts a client-supplied user ID.

**Ownership enforcement examples:**
- Profile update: `req.user.id` must match the profile being edited.
- Skill operations: `skill.owner` must equal `req.user.id`.
- Swap accept/reject: Only `toUser` can accept/reject; only `fromUser` can cancel.
- Chat access: `swapRequest.fromUser` or `swapRequest.toUser` must equal `req.user.id`.
- Meeting creation: Multi-layer validation via `verifyAcceptedSwapParticipant` — ensures accepted swap status and participant membership.
- Portfolio operations: `portfolio.user` must equal `req.user.id` for write/delete.
- Rating submission: Participant membership + swap `completed` status + self-rating prevention.

### Optional Authentication

Routes returning public data (portfolio items, user ratings, public profiles) use `optionalAuthMiddleware` — the request proceeds with `req.user = null` if no valid token is supplied, but authenticated callers receive additional data (e.g. `currentUserReaction` in portfolio responses).

---

## 3. Input Validation

**All endpoints accepting a request body validate input before any database operation.**

- **Zod** (`zod` v4): Used in most route handlers via `validateRequest` middleware or inline `schema.parse()`. Provides strict type and constraint enforcement.
- **Joi**: Used in some older route handlers (same purpose).
- **Validation errors** return HTTP 400 with a human-readable message. No internal error details or stack traces are exposed.

**Example constraints:**
- `stars` (rating): Required integer 1–5.
- `review` (rating): Optional string, max 500 chars.
- `bio` (profile): Max 160 chars.
- `content` (chat message): Non-empty string, max 2000 chars.
- `caption` (portfolio): Max 500 chars.
- `note` (meeting): Max 300 chars.
- `reason` (portfolio report): Must be one of 7 defined enum values.

---

## 4. File Upload Security

- **Multer** is configured with `memoryStorage()` — uploaded files are held in memory as `Buffer` objects, never written to disk.
- **File type validation:** Upload middleware checks `mimetype` against allowed types before processing:
  - Profile images: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`
  - Portfolio images: same
  - Portfolio videos: `video/mp4`, `video/webm`
- **File size limits:**
  - Profile images: ≤ 10 MB
  - Portfolio images: ≤ 10 MB
  - Portfolio videos: ≤ 50 MB
- **Video duration validation:** After upload to Cloudinary, the returned `duration` field is checked. If > 60 seconds, the Cloudinary asset is immediately destroyed and a `400 Bad Request` error is returned.
- **Portfolio limits:** Max 20 images, 10 videos, 30 total items per user — enforced at the application layer before Cloudinary upload.

---

## 5. CORS Configuration

CORS is configured in `server.js` using the `cors` npm package:

```javascript
const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL]
  : ["http://localhost:5173", "http://localhost:5174", ...];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
}));
```

- In production, `CLIENT_URL` is set to the deployed Vercel URL. The server rejects cross-origin requests from any other origin.
- The same `allowedOrigins` list is applied to the Socket.IO server configuration.
- `credentials: true` enables cookies to be included in cross-origin requests (used for optional future cookie support).

---

## 6. Environment Variables

> **Important:** The values below are names and descriptions only. Actual secrets, passwords, URIs, and API keys are never included in documentation or committed to version control.

### Server (`server/.env`)

| Variable | Purpose |
|---|---|
| `PORT` | TCP port the Express server listens on (default: 5000) |
| `MONGODB_URI` | MongoDB Atlas connection string (includes username, password, cluster URL, database name) |
| `JWT_SECRET` | Secret key for signing and verifying JWT tokens — must be long, random, and kept private |
| `JWT_EXPIRES_IN` | JWT expiry duration (e.g. `"7d"`) |
| `CLIENT_URL` | The deployed frontend URL used for CORS origin restriction (e.g. `https://skillswap.vercel.app`) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud identifier |
| `CLOUDINARY_API_KEY` | Cloudinary API key — identifies the account |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret — used for authenticated upload/delete operations |
| `GEMINI_API_KEY` | Google Gemini Flash API key (optional — if absent, AI matching falls back to deterministic mode) |

### Client (`client/.env`)

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Base URL for all REST API requests (e.g. `http://localhost:5000/api` or the Render deployment URL) |
| `VITE_SOCKET_URL` | Optional: override for Socket.IO connection URL. If absent, derived from `VITE_API_URL`'s origin |

---

## 7. Secret Management Practices

- All environment variables live in `.env` files which are listed in `.gitignore` — they are **never committed** to version control.
- `.env.example` files (with placeholder values) can be used to document required variables without exposing real values.
- In production, Render (backend) and Vercel (frontend) environment variables are set through their respective dashboards, not through files.
- `cloudinary.js` includes a guard: `isCloudinaryConfigured()` checks that none of the three Cloudinary variables equal the placeholder strings. If misconfigured, uploads return a clear `500` error rather than silently failing.

---

## 8. Database Security

- **MongoDB Atlas** is accessed only from the backend server. No client has direct database access.
- Connection uses the full Atlas URI (includes authentication credentials embedded in the URI string as environment variable).
- The database connection is made over TLS (Atlas enforces this by default).
- **No raw queries:** All database operations use Mongoose models — parameterised queries by default, no SQL injection risk (MongoDB uses BSON).
- **Atomic operations:** `findOneAndUpdate` with specific field conditions is used for completion confirmations and meeting reminders to prevent race conditions.

---

## 9. Data Privacy Practices

- **Passwords**: Only bcrypt hashes are stored. No plaintext, no encryption — one-way hash.
- **Location**: City-level only (e.g. "Bangalore"). No street address, GPS coordinates, or exact location is collected.
- **Cloudinary asset isolation**: Portfolio reactions lists return only `_id`, `name`, `profilePicture` for users — emails, roles, and other private fields are never exposed.
- **Rating reviews**: Reviewer's name and profile picture are returned, but full profile data (email, passwordHash) is excluded.
- **Portfolio moderation status**: `hidden` and `removed` items are excluded from all public-facing responses — only returned to the item's owner.
- **Self-rating prevention**: The rating endpoint explicitly blocks `reviewer === ratedUser` (403 Forbidden).

---

## 10. Security Limitations and Recommendations

The following are known limitations appropriate to a mini-project scope that should be addressed before production use:

| Limitation | Current State | Recommendation |
|---|---|---|
| **No email verification** | Accounts created without verifying email | Implement email confirmation flow (e.g. SendGrid / Resend) |
| **No password reset** | Forgot-password not implemented | Add token-based password reset via email |
| **No rate limiting on most routes** | Auth routes mention rate limiting in Architecture.md, but express-rate-limit is not in `package.json` | Add `express-rate-limit` to auth routes and file upload endpoints |
| **JWT stored in memory/localStorage** | No HttpOnly cookie implementation | Consider HttpOnly + Secure cookie for XSS resistance |
| **Single-instance Socket.IO** | Works on one server; fails with horizontal scaling | Add Redis adapter (`socket.io-adapter-redis`) for multi-instance deployment |
| **No HTTPS enforcement** | Relies on Render/Vercel to terminate TLS | Add `helmet` middleware for HTTP security headers |
| **No admin panel** | Portfolio moderation reports stored but not processable | Implement admin authentication and moderation interface |
| **Gemini API key exposure risk** | Key in `.env` server-side only | Rotate key if accidentally committed; monitor Gemini dashboard for abuse |

---

*Security analysis based on source code review — October 2026.*

