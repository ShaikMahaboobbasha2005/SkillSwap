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
| GET | `/api/users/:id` | Public | View a user's profile (name, pfp, banner, location, bio, socialLinks, rating, completed swaps, skills, portfolio) |
| GET | `/api/profile/me` | Protected | Get current user's own profile |
| PUT | `/api/users/me` / `/api/profile/me` | Protected | Edit own profile: name, profile picture, banner, location, bio (max 160 chars), socialLinks (`linkedin`, `github`, `instagram`, `youtube`, `website` validated URLs) |
| POST | `/api/profile/upload-image` | Protected | Upload profile photo or banner image (via Cloudinary) |
| POST | `/api/users/me/portfolio` | Protected | Upload an image/video to portfolio (via Cloudinary) |
| DELETE | `/api/users/me/portfolio/:mediaId` | Protected | Remove a portfolio item |

## Skills
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/skills` | Public | List all available skills (for dropdowns/autocomplete) |
| POST | `/api/users/me/skills/offered` | Protected | Add a skill to skills-offered (Enforces max 5 non-deleted offering skills limit; returns `409 Conflict` if capacity is reached) |
| DELETE | `/api/users/me/skills/offered/:skillId` | Protected | Remove a skill from skills-offered (Frees capacity slot) |
| POST | `/api/users/me/skills/wanted` | Protected | Add a skill to skills-wanted (Enforces max 5 non-deleted learning skills limit; returns `409 Conflict` if capacity is reached) |
| DELETE | `/api/users/me/skills/wanted/:skillId` | Protected | Remove a skill from skills-wanted (Frees capacity slot) |

## Search & Matching / Recommendations
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/discover` | Protected | Unique-user discovery API with search, category, type, level filters, pagination (`?page=&limit=`), and sorting. Returns paginated unique discoverable user objects with active skills. |
| GET | `/api/search?skill=` | Public | Search users by a skill name. Supports optional `?page=&limit=` pagination (e.g. `?skill=react&page=1&limit=10`) — not required for MVP, but documented so it can be added without an API contract change |
| GET | `/api/recommendations` | Protected | Two-tier hybrid recommendation engine returning potential skill-swap partners sorted by skill compatibility. **Default Mode (`?ai=false` or omitted)**: Returns fast, deterministic recommendations using progressive directional exact match scoring (0→0, 1→26, 2→36, 3→42, 4→45, 5+→46), mutual exchange bonus (+20), and related category matches (+8 each, max 16), with centralized canonical alias resolution (`JS` ↔ `JavaScript`, `NodeJS` ↔ `Node.js`, `ReactJS` ↔ `React`, `UI UX` ↔ `UI/UX Design`). Gemini is NOT invoked. **Optional AI Mode (`?ai=true`)**: User-triggered Gemini AI semantic ranking layer evaluates deeper domain relationships (e.g. `Web Development` ↔ `React` + `Node.js`) on bounded candidate pool to calculate `semanticScore` (0–100) and concise AI explanations, merged with deterministic anchors via `hybridScore = round(traditionalScore * 0.70 + semanticScore * 0.30)`. **Resilient Fallback**: Seamlessly returns deterministic scores if Gemini is unconfigured, timed out, or unavailable. Supports `?page=&limit=&ai=`. Returns `compatibilityScore` (0–100), `traditionalScore`, optional `semanticScore`, structured `matchDetails`, `reasons`, `aiMatchReasons`, and `meta` (including `isAiRequested`, `isAiEnhanced`). |

## Swap Requests
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/swaps` | Protected | Send a swap request to another user |
| GET | `/api/swaps` | Protected | List current user's active swap requests (status `pending`, `accepted`; supports `?page=`, `?limit=`, `?type=incoming\|outgoing\|all`, `?status=pending\|accepted`) |
| GET | `/api/swaps/history` | Protected | Get swap history for logged-in user (terminal status `completed`, `left`, `rejected`, `cancelled`, excluding `chatDeletedFor` items; supports `?status=`, `?page=`, `?limit=`) |
| GET | `/api/swaps/incoming` | Protected | Get active incoming swap requests for logged-in user (status `pending`, `accepted`) |
| GET | `/api/swaps/outgoing` | Protected | Get active outgoing swap requests for logged-in user (status `pending`, `accepted`) |
| GET | `/api/swaps/stats` | Protected | Get lightweight dashboard swap statistics (counts for `pending`, `accepted`, `rejected`, `cancelled`, `completed`, `left`, active totals, and total history) |
| GET | `/api/swaps/:id` | Protected | Get swap request details (must be a participant) |
| PATCH | `/api/swaps/:id/accept` | Protected | Accept a pending swap request (Receiver only) |
| PATCH | `/api/swaps/:id/reject` | Protected | Reject a pending swap request (Receiver only) |
| PATCH | `/api/swaps/:id/cancel` | Protected | Soft-cancel a pending swap request (Sender only) |
| PATCH | `/api/swaps/:id/complete` | Protected | Legacy/smart completion route for an accepted swap (determines request vs confirm based on current state) |
| PATCH | `/api/swaps/:id/request-completion` | Protected | Request completion of an accepted swap (Participant only; sets `completionRequestedBy`, status remains `accepted`, sends in-app notification to partner) |
| PATCH | `/api/swaps/:id/confirm-completion` | Protected | Confirm completion requested by partner (Partner only; changes status to `completed`, sets `endedAt`/`completedAt`, makes chat read-only, increments `completedSwaps` for both users) |
| PATCH | `/api/swaps/:id/cancel-completion-request` | Protected | Cancel or decline a pending completion request for an accepted swap (Participant only; resets completion request state, swap remains `accepted`) |
| PATCH | `/api/swaps/:id/leave` | Protected | Intentionally end/leave an ongoing accepted swap (Participant only; sets status to `left` and records `leftBy`) |
| PATCH | `/api/swaps/:id/hide` | Protected | Hide a swap request from the authenticated participant's incoming/outgoing request list (`$addToSet: { hiddenFor: userId }`) without deleting the swap or removing it from Swap History |

## Chat
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/chat/conversations` | Protected | Get all active accepted swap conversations for logged-in user with counterpart details, last message preview, and unread incoming count (filters `status: "accepted"` and `chatDeletedFor: { $ne: userId }`). |
| GET | `/api/chat/unread-count` | Protected | Get unread conversation count (`unreadConversationCount` distinct accepted swaps with unread incoming messages) and total unread message count (`totalUnreadMessageCount`) for navbar badge. |
| GET | `/api/chat/:swapId/messages` | Protected | Get message history for a swap (status `accepted`, `completed`, `left`). Default `page=1, limit=50` retrieves messages in chronological order. Returns `swapRequest` object and `isReadOnly: true` if swap status is `completed` or `left`. |
| PATCH | `/api/chat/:swapId/read` | Protected | Mark incoming unread messages in `swapId` (optionally filtered by `messageIds` array in body) as read for current user and return updated unread count. |
| DELETE | `/api/chat/:swapId/messages/:messageId` | Protected | Soft delete a user's own sent message for everyone. Validates user ownership and swapId match, clears content to `""`, sets `isDeleted: true` and `deletedAt`, and broadcasts `message_deleted` to room `swap:<swapId>`. |
| DELETE | `/api/chat/:swapId/history` | Protected | Remove/delete an archived conversation (`completed`, `left`, `cancelled`) from current user's personal history (`$addToSet: { chatDeletedFor: userId }`). |

## Video Meetings & Session Scheduling
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/meetings/instant` | Protected | Start an instant video meeting session for an accepted swap. Validates participant authorization and accepted swap status, generates deterministic collision-resistant room name (`skillswap-<swapId>-<meetingId>-<random>`), sets status to `active`, creates a chat message with `type: "meeting"`, emits `new_message` to room `swap:<swapId>`, and sends `meeting_started` in-app notification to partner. Returns `201 Created` with `{ meeting, message }`. |
| POST | `/api/meetings` | Protected | Schedule a future video session for an accepted swap. Body: `{ swapId, scheduledAt, duration: 15\|30\|45\|60, note }`. Validates accepted swap participation and future date/time. Creates `MeetingSession` with status `scheduled`, creates chat message with `type: "meeting"`, emits `new_message` to room `swap:<swapId>`, and sends `meeting_scheduled` in-app notification to partner. Returns `201 Created` with `{ meeting, message }`. |
| GET | `/api/meetings/:id` | Protected | Get meeting session details by ID. Must be an authorized participant on the associated swap. Returns `200 OK` with meeting details. |
| GET | `/api/meetings/:id/join` | Protected | Join a scheduled or active video meeting session. Validates participant authorization, checks meeting is not cancelled/completed, transitions status from `scheduled` to `active`, and returns Jitsi configuration (`roomName`, `jitsiDomain`, `user` displayName/email). |
| PATCH | `/api/meetings/:id/cancel` | Protected | Cancel a scheduled or active video meeting session. Validates participant authorization, marks status as `cancelled`, emits `meeting_updated` (`status: "cancelled"`) to room `swap:<swapId>`, and sends `meeting_cancelled` notification to partner. Returns `200 OK`. |

## Ratings & Reviews
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/ratings/:swapId` | Protected | Submit a rating + review for a completed swap |
| GET | `/api/ratings/user/:userId` | Public | Get all ratings/reviews for a user |

## Notifications
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/notifications` | Protected | Get current user's notifications. Supports optional `?page=&limit=` (e.g. `?page=1&limit=20`) |
| GET | `/api/notifications/unread-count` | Protected | Get unread notifications count for current user |
| PATCH | `/api/notifications/:id/read` | Protected | Mark a single notification as read |
| PATCH | `/api/notifications/read-all` | Protected | Mark all notifications as read for current user |

**Chat Authorization Rules:**
- Requires valid JWT authentication token.
- `swapId` must be a valid 24-character hexadecimal MongoDB ObjectId (returns `400 Bad Request` / `INVALID_SWAP_ID` otherwise).
- SwapRequest must exist (`404 Not Found` / `SWAP_NOT_FOUND`).
- SwapRequest status must be `"accepted"`, `"completed"`, or `"left"` (`403 Forbidden` / `SWAP_NOT_ACCEPTED`).
- SwapRequest must not be deleted for the requesting user (`chatDeletedFor` does not contain `userId`; returns `404 Not Found` / `CHAT_DELETED`).
- Logged-in user must be either `fromUser` or `toUser` on the SwapRequest (`403 Forbidden` / `FORBIDDEN`).
- Write operations (sending messages, Socket chat room interactions) are blocked if status is not `"accepted"` (returns `403 Forbidden` / `CHAT_READ_ONLY`).
- For message deletion: authenticated user must be the original sender of `messageId` and `message.swapRequest` must match `swapId` (returns `403 Forbidden` or `400 Bad Request / SWAP_MISMATCH` otherwise).

**Unread Divider Presentation Snapshot:**
- A client-side visual unread boundary (`UnreadDivider`) renders immediately before the first unread incoming message when opening a conversation.
- The snapshot (`initialUnreadCount` and `firstUnreadMessageId`) is captured once when history loads before viewport read receipt mutations occur.
- Existing `IntersectionObserver` viewport read receipts, backend status transitions, Navbar unread count, and ConversationList unread badges remain authoritative.

**Socket.io real-time layer:**
- Connection handshake requires JWT token in `auth.token` or `Authorization: Bearer <token>` header. On connect, automatically joins personal room `user:<userId>` (strictly derived from verified JWT identity) and marks pending sent messages for recipient as `delivered`.
- Socket room formats:
  - Per-swap room: `swap:<swapId>` (chat communication)
  - User personal room: `user:<userId>` (real-time swap request & status updates)
- Client events:
  - `join_swap_chat` (`{ swapId }`, `callback`): Verifies JWT & swap authorization, then joins room `swap:<swapId>`. Returns `{ success: true, message: "Joined chat room successfully" }`.
  - `send_message` (`{ swapId, content, replyTo }`, `callback`): Validates `swapId` format, verifies room membership (`socket.rooms.has("swap:<swapId>")`), validates content (non-empty string, max 2000 chars), validates optional `replyTo` message ID exists and belongs to same `swapId` (`400 SWAP_MISMATCH` if mismatched), persists message to MongoDB (status `sent` or `delivered` if counterpart connected), broadcasts `new_message` (with populated `replyTo` metadata) to room `swap:<swapId>`, emits `chat_unread_update` to `user:<recipientId>`, and responds via callback `{ success: true, data: savedMessage }`.
  - `mark_messages_read` (`{ swapId, messageIds }`, `callback`): Marks specified incoming unread messages in `swapId` as `read` in MongoDB, broadcasts `messages_status_update` to room `swap:<swapId>`, and emits `chat_unread_update` (`{ unreadConversationCount, totalUnreadMessageCount }`) to user's personal room `user:<userId>`.
- Server events:
  - `new_message` (server → room): Emits `{ success: true, data: savedMessage }` to all clients in room `swap:<swapId>`.
  - `messages_status_update` (server → room/user): Emits `{ type: "delivered" | "read", swapId, readBy, readAt }` when message status transitions occur.
  - `message_deleted` (server → room): Emits `{ swapId, messageId, deletedAt }` to room `swap:<swapId>` upon successful REST soft deletion.
  - `chat_unread_update` (server → `user:<userId>`): Emits `{ success: true, data: { swapId, senderId, unreadConversationCount, totalUnreadMessageCount } }` to user's personal room when message state changes.
  - `swap_request_created` (server → `user:<userId>`): Emits `{ success: true, data: swapRequest }` to recipient and sender rooms upon new swap request creation.
  - `swap_request_updated` (server → `user:<userId>`): Emits `{ success: true, data: swapRequest }` to participant rooms upon accept, reject, or cancel status updates.
- Frontend deduplication guideline: Frontend should track message `_id` to prevent duplicate renders when receiving both acknowledgement and broadcast event.

## Ratings & Reviews
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/ratings/:swapId` | Protected | Submit a rating + review for a completed swap. Body: `{ stars: Number (1-5), review: String (max 500) }`. Requires `status === "completed"` and participant membership. Derives `reviewer` from `req.user.id` and `ratedUser` from `SwapRequest`. Enforces 1 rating per reviewer per swap (returns `409 Conflict` for duplicates). Recalculates `ratedUser.avgRating` via MongoDB aggregation (rounded to 1 decimal place). Returns populated `rating` (including `reviewer`, `ratedUser`, and `swapRequest` with `offeredSkill` and `wantedSkill`) and `updatedAvgRating`. |
| GET | `/api/ratings/swap/:swapId/status` | Protected | Check if the authenticated user has submitted a rating for a specific swap. Returns `{ success: true, data: { hasRated: Boolean, rating: Object\|null } }` with populated `swapRequest`. |
| GET | `/api/ratings/user/:userId` | Public | Get all ratings received by a specific user (`ratedUser == userId`), sorted newest first. Supports pagination (`?page=1&limit=10`). Populates `reviewer` with safe public fields (`name profilePicture location`) and `swapRequest` with safe metadata (`_id fromUser toUser status completedAt` and nested `offeredSkill` / `wantedSkill` names, categories, and snapshots). Invalid `userId` format returns `400 Bad Request`, nonexistent user returns `404 Not Found`, user with 0 ratings returns `200 OK` with `data: []`. |

## Notifications
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/notifications` | Protected | Get current user's notifications sorted newest first. Supports optional query parameters: `?page=1&limit=20&unreadOnly=true` (or `status=unread`). Populates `sender` (`name avatar profilePicture email location`) and `swap` (`offeredSkill wantedSkill`). Returns `{ success: true, data: [...], meta: { total, unreadCount, page, limit, totalPages } }`. |
| GET | `/api/notifications/unread-count` | Protected | Get current user's unread notification count. Returns `{ success: true, data: { count: Number, unreadCount: Number } }`. |
| PATCH | `/api/notifications/:id/read` | Protected | Mark a single notification as read (`read: true`). Validates ObjectId (400) and ownership (`404 Not Found` if notification does not belong to user). Emits `notification_unread_update` socket event to recipient's room. Returns `{ success: true, data: populatedNotification }`. |
| PATCH | `/api/notifications/read-all` | Protected | Mark all unread notifications for the authenticated user as read (`read: true`). Emits `notification_unread_update` socket event with `unreadCount: 0`. Returns `{ success: true, message: "All notifications marked as read", data: { count: 0, unreadCount: 0 } }`. |

## Portfolio
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/portfolio` | Protected | Upload and create a portfolio item (multipart/form-data with `media` file, optional `caption` [max 500 chars], optional `skillId`). Enforces format validation (images: jpg, jpeg, png, webp ≤ 10MB; videos: mp4, webm ≤ 50MB), limits (max 20 images, 10 videos, 30 total items), video duration limit (≤ 60s with automatic cleanup if exceeded), and skill ownership validation. Returns `201 Created` with created portfolio item populated with user and skill, plus `reactionSummary` and `currentUserReaction`. |
| GET | `/api/portfolio/user/:userId` | Public / Optional Auth | Get all active portfolio items for a user, sorted newest first (`createdAt: -1`). Supports optional `?type=image\|video` filter. Populates linked skill (`name category level type`). Returns `{ success: true, data: { portfolio: [...], total: Number } }` with `reactionSummary` ({ like, impressive, great_work, creative, total }) and `currentUserReaction` for each item. |
| GET | `/api/portfolio/:id` | Public / Optional Auth | Get a single active portfolio item by ID with populated `user` (`name profilePicture location avgRating completedSwaps`) and `skill`, plus `reactionSummary` and `currentUserReaction`. Returns `404 Not Found` if nonexistent or not active. |
| POST | `/api/portfolio/:id/reaction` | Protected | Add, change, or remove reaction on a portfolio item (1 reaction per user rule). Body: `{ type: "like" \| "impressive" \| "great_work" \| "creative" }`. Toggles reaction off if same type is clicked again; updates reaction type if different. Returns `{ success: true, message: String, data: { action: "added" \| "updated" \| "removed", reactionSummary: Object, currentUserReaction: String\|null } }`. |
| GET | `/api/portfolio/:id/reactions` | Public / Optional Auth | Get list of users who reacted to a portfolio item. Populates only sanitized public user fields (`_id`, `name`, `profilePicture`). Never exposes emails or private data. Returns `{ success: true, data: { reactions: [{ _id, type, createdAt, user: { _id, name, profilePicture } }], total: Number } }`. |
| POST | `/api/portfolio/:id/report` | Protected | Report a portfolio item for moderation review. Body: `{ reason: "nudity" \| "violence" \| "illegal" \| "hate_harassment" \| "spam" \| "copyright" \| "other", description: String (max 500, optional) }`. Validates authenticated identity, rejects self-reporting (`403 Forbidden`), and rejects duplicate reports (`409 Conflict`). Updates portfolio `moderationStatus` to `"reported"` (item remains visible until admin review) and increments `reportCount`. Returns `200 OK` with `{ success: true, message: "Portfolio item reported successfully." }`. |
| PATCH | `/api/portfolio/:id` | Protected | Update caption (max 500 chars) and/or linked skill for an owned portfolio item. Validates ownership (`403 Forbidden` if not owner) and skill ownership. Media itself cannot be modified. Returns `200 OK` with updated item. |
| DELETE | `/api/portfolio/:id` | Protected | Permanently delete an owned portfolio item and its Cloudinary media asset. Validates ownership (`403 Forbidden` if not owner). Returns `200 OK`. |

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
