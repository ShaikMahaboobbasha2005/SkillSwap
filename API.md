# API.md — SkillSwap

Base URL: `/api` · Auth: JWT via `Authorization: Bearer <token>` header on all protected routes · Validation: Zod/Joi on every request body.

## Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Log in, returns JWT |
| POST | `/api/auth/logout` | Protected | Log out — returns success; clears auth cookie if httpOnly cookies are adopted later. Gives the frontend one consistent endpoint regardless of storage mechanism |
| GET | `/api/auth/me` | Protected | Get current logged-in user |

## Users / Profile
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/users/:id` | Public | View a user's profile (name, pfp, location, rating, completed swaps, skills, portfolio) |
| PUT | `/api/users/me` | Protected | Edit own profile: name, profile picture, location |
| POST | `/api/users/me/portfolio` | Protected | Upload an image/video to portfolio (via Cloudinary) |
| DELETE | `/api/users/me/portfolio/:mediaId` | Protected | Remove a portfolio item |

## Skills
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/skills` | Public | List all available skills (for dropdowns/autocomplete) |
| POST | `/api/users/me/skills/offered` | Protected | Add a skill to skills-offered |
| DELETE | `/api/users/me/skills/offered/:skillId` | Protected | Remove a skill from skills-offered |
| POST | `/api/users/me/skills/wanted` | Protected | Add a skill to skills-wanted |
| DELETE | `/api/users/me/skills/wanted/:skillId` | Protected | Remove a skill from skills-wanted |

## Search & Matching
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/search?skill=` | Public | Search users by a skill name. Supports optional `?page=&limit=` pagination (e.g. `?skill=react&page=1&limit=10`) — not required for MVP, but documented so it can be added without an API contract change |
| GET | `/api/matches` | Protected | Traditional rule-based matches for current user |
| GET | `/api/matches/recommended` | Protected | AI-ranked recommendations (re-ranks the traditional match set) |

## Swap Requests
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/swaps` | Protected | Send a swap request to another user |
| GET | `/api/swaps` | Protected | List current user's swap requests (supports `?page=`, `?limit=`, `?type=incoming|outgoing|all`, `?status=pending|accepted|rejected|cancelled`) |
| GET | `/api/swaps/incoming` | Protected | Get incoming swap requests for logged-in user |
| GET | `/api/swaps/outgoing` | Protected | Get outgoing swap requests for logged-in user |
| GET | `/api/swaps/stats` | Protected | Get lightweight dashboard swap statistics (counts for pending, accepted, rejected, cancelled) |
| GET | `/api/swaps/:id` | Protected | Get swap request details (must be a participant) |
| PATCH | `/api/swaps/:id/accept` | Protected | Accept a pending swap request (Receiver only) |
| PATCH | `/api/swaps/:id/reject` | Protected | Reject a pending swap request (Receiver only) |
| PATCH | `/api/swaps/:id/cancel` | Protected | Soft-cancel a pending swap request (Sender only) |
| PATCH | `/api/swaps/:id/complete` | Protected | Mark an accepted swap as completed (Phase 8) |

## Chat
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/chat/:swapId/messages` | Protected | Get message history for an accepted swap. Default `page=1, limit=50` retrieves the 50 most recent messages, returned in chronological order (`createdAt: 1`) for natural rendering. Populates sender details (`name profilePicture`) |

**Chat Authorization Rules:**
- Requires valid JWT authentication token.
- `swapId` must be a valid 24-character hexadecimal MongoDB ObjectId (returns `400 Bad Request` / `INVALID_SWAP_ID` otherwise).
- SwapRequest must exist (`404 Not Found` / `SWAP_NOT_FOUND`).
- SwapRequest status must be `"accepted"` (`403 Forbidden` / `SWAP_NOT_ACCEPTED`).
- Logged-in user must be either `fromUser` or `toUser` on the SwapRequest (`403 Forbidden` / `FORBIDDEN`).

**Socket.io real-time layer:**
- Connection handshake requires JWT token in `auth.token` or `Authorization: Bearer <token>` header.
- Per-swap socket room format: `swap:<swapId>`.
- Client events:
  - `join_swap_chat` (`{ swapId }`, `callback`): Verifies JWT & swap authorization, then joins room `swap:<swapId>`. Returns `{ success: true, message: "Joined chat room successfully" }` or error `{ success: false, message, code }`.
  - `send_message` (`{ swapId, content }`, `callback`): Validates `swapId` format, verifies room membership (`socket.rooms.has("swap:<swapId>")`), validates content (non-empty string, max 2000 chars), persists message to MongoDB, broadcasts `new_message` to room `swap:<swapId>`, and responds via callback `{ success: true, data: savedMessage }`.
- Server events:
  - `new_message` (server → room): Emits `{ success: true, data: savedMessage }` to all clients in room `swap:<swapId>`.
- Frontend deduplication guideline: Frontend should track message `_id` to prevent duplicate renders when receiving both acknowledgement and broadcast event.

## Ratings & Reviews
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/ratings/:swapId` | Protected | Submit a rating + review for a completed swap |
| GET | `/api/ratings/user/:userId` | Public | Get all ratings/reviews for a user |

## Notifications
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/notifications` | Protected | Get current user's notifications. Supports optional `?page=&limit=` (e.g. `?page=1&limit=20`) |
| PATCH | `/api/notifications/:id/read` | Protected | Mark a notification as read |

**Ownership & Validation Rules:**
- `POST /api/swaps`: Enforces self-request prevention (400), target/skill existence and active status (400/404), ownership (400), and bidirectional duplicate active/pending swap prevention (409 Conflict). Returns error if an active (`accepted`) or `pending` swap already exists for the same skill pair between the two users regardless of request direction.
- `PATCH /api/swaps/:id/accept`, `/reject`, and `/complete`: Only the appropriate participant on that specific swap request may perform the action (e.g. only the recipient can accept/reject; either participant can mark complete). Returns `403 Forbidden` otherwise.

## Standard Response Shape
```json
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "message": "Human-readable error message" }
```

## Standard HTTP Status Codes

| Status | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 400 | Validation failed |
| 401 | Missing or invalid JWT |
| 403 | Authenticated but not allowed (e.g. ownership rule violation) |
| 404 | Resource not found |
| 409 | Conflict (e.g. duplicate email on signup, active or pending swap request for same skill pair) |
| 500 | Internal server error |
