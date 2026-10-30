# 05 — API Documentation

## SkillSwap — REST API and Socket.IO Reference

> **Base URL:** `/api`  
> **Authentication:** `Authorization: Bearer <token>` header on all protected routes  
> **Validation:** Zod or Joi on every request body  
> **Standard Response Shape:**
> ```json
> // Success
> { "success": true, "data": { ... } }
> // Error
> { "success": false, "message": "Human-readable error message" }
> ```

---

## HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 400 | Bad request / validation failed |
| 401 | Missing or invalid JWT |
| 403 | Authenticated but not allowed (ownership / participation violation) |
| 404 | Resource not found |
| 409 | Conflict (duplicate email, duplicate swap, duplicate rating, duplicate report) |
| 500 | Internal server error |

---

## 1. Authentication — `/api/auth`

### POST `/api/auth/signup`
**Auth:** Public

**Request body:**
```json
{ "name": "string", "email": "string", "password": "string" }
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "token": "<jwt>",
    "user": { "_id": "...", "name": "...", "email": "..." }
  }
}
```

**Errors:** `400` (validation), `409` (email already registered)

---

### POST `/api/auth/login`
**Auth:** Public

**Request body:**
```json
{ "email": "string", "password": "string" }
```

**Response 200:** Same shape as signup, with fresh JWT.

**Errors:** `400` (invalid credentials), `404` (user not found)

---

### POST `/api/auth/logout`
**Auth:** Protected

**Response 200:**
```json
{ "success": true, "message": "Logged out successfully." }
```

---

### GET `/api/auth/me`
**Auth:** Protected

**Response 200:**
```json
{ "success": true, "data": { /* current user document */ } }
```

---

## 2. Users / Profile — `/api/users` and `/api/profile`

### GET `/api/users/:id`
**Auth:** Public

Returns the user's public profile: name, profilePicture, profileBanner, location, bio, socialLinks, avgRating, completedSwaps, role, skillsOffered, skillsWanted.

**Errors:** `404` (user not found), `400` (invalid ObjectId)

---

### GET `/api/profile/me`
**Auth:** Protected

Returns the full profile of the currently authenticated user.

---

### PUT `/api/users/me`  (alias: `PUT /api/profile/me`)
**Auth:** Protected

**Editable fields only** (server enforces whitelist):
```json
{
  "name": "string",
  "location": "string",
  "bio": "string (max 160 chars)",
  "socialLinks": {
    "linkedin": "URL string",
    "github": "URL string",
    "instagram": "URL string",
    "youtube": "URL string",
    "website": "URL string"
  }
}
```

`avgRating` and `completedSwaps` cannot be set through this endpoint.

**Response 200:** Updated user document.

---

### POST `/api/profile/upload-image`
**Auth:** Protected  
**Content-Type:** `multipart/form-data`

**Fields:**
- `image` — file (jpg, jpeg, png, webp)
- `type` — `"profile"` or `"banner"`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "profilePicture": "https://cloudinary.com/...",
    "profilePicturePublicId": "skillswap/profiles/..."
  }
}
```
Old Cloudinary asset is automatically deleted upon success.

---

## 3. Skills — `/api/skills`

### GET `/api/skills`
**Auth:** Public

Returns all skills (for autocomplete/dropdowns).

---

### POST `/api/skills`
**Auth:** Protected

**Request body:**
```json
{
  "name": "string",
  "type": "Offer | Learn",
  "category": "one of 20 categories",
  "level": "Beginner | Intermediate | Advanced | Expert",
  "description": "string (optional, max 250 chars)",
  "yearsOfExperience": "number (optional, 0–50)"
}
```

**Response 201:** Created skill document.  
**Errors:** `409` (duplicate), `400` (validation)

---

### PATCH `/api/skills/:id`
**Auth:** Protected (owner only)

Editable: `name`, `category`, `level`, `description`, `yearsOfExperience`, `status`.

---

### DELETE `/api/skills/:id`
**Auth:** Protected (owner only)

Permanently deletes the skill.

---

### PATCH `/api/skills/:id/status`
**Auth:** Protected (owner only)

Toggle skill status between `"Active"` and `"Inactive"`.

---

## 4. Discovery — `/api/discover`

### GET `/api/discover`
**Auth:** Protected

**Query parameters:**

| Parameter | Type | Description |
|---|---|---|
| `search` | string | Keyword search against skill names |
| `category` | string | Filter by skill category |
| `type` | `Offer` \| `Learn` | Filter by skill type |
| `level` | string | Filter by skill level |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10) |
| `sort` | string | Sort field |

**Response 200:**
```json
{
  "success": true,
  "data": { "users": [...] },
  "meta": { "page": 1, "limit": 10, "total": 45, "totalPages": 5 }
}
```

Each user object includes `name`, `profilePicture`, `location`, `avgRating`, `completedSwaps`, `skillsOffered`, `skillsWanted`.

---

## 5. Recommendations — `/api/recommendations`

### GET `/api/recommendations`
**Auth:** Protected

**Query parameters:**

| Parameter | Type | Description |
|---|---|---|
| `ai` | `true` \| `false` | Enable Gemini AI semantic re-ranking (default: false) |
| `page` | number | Page number |
| `limit` | number | Results per page |

**Default mode (ai omitted or false):** 100% deterministic, zero Gemini API calls.  
**AI mode (`ai=true`):** Hybrid 70% deterministic + 30% Gemini semantic score.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "user": { "_id": "...", "name": "...", ... },
        "compatibilityScore": 92,
        "traditionalScore": 90,
        "semanticScore": 97,
        "matchDetails": {
          "exactMatchesForYou": [...],
          "exactMatchesForThem": [...],
          "mutualMatch": true,
          "relatedMatches": [...]
        },
        "reasons": ["They offer React, which you want to learn."],
        "aiMatchReasons": ["Strong frontend ecosystem overlap detected."]
      }
    ]
  },
  "meta": {
    "page": 1, "limit": 10, "total": 8, "totalPages": 1,
    "isAiRequested": false, "isAiEnhanced": false
  }
}
```

---

## 6. Swap Requests — `/api/swaps`

### POST `/api/swaps`
**Auth:** Protected

**Request body:**
```json
{
  "toUserId": "ObjectId",
  "offeredSkillId": "ObjectId (one of your own active offered skills)",
  "wantedSkillId": "ObjectId (one of their active offered skills)",
  "message": "string (optional, max 500 chars)"
}
```

**Response 201:** Created SwapRequest document.  
**Errors:** `400` (self-request, invalid skills), `409` (duplicate active/pending swap)

---

### GET `/api/swaps`
**Auth:** Protected

Query params: `type=incoming|outgoing|all`, `status=pending|accepted`, `page`, `limit`.

---

### GET `/api/swaps/history`
**Auth:** Protected

Returns terminal-status swaps (completed, left, rejected, cancelled).  
Query params: `status`, `page`, `limit`.

---

### GET `/api/swaps/stats`
**Auth:** Protected

Returns lightweight count statistics for the dashboard.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "pending": 2, "accepted": 1, "rejected": 0,
    "cancelled": 0, "completed": 5, "left": 1,
    "activeTotal": 3, "totalHistory": 6
  }
}
```

---

### GET `/api/swaps/:id`
**Auth:** Protected (participant only)

Returns the swap request detail with populated user and skill references.

---

### PATCH `/api/swaps/:id/accept`
**Auth:** Protected (recipient/toUser only)

Sets `status: "accepted"`. Emits `swap_request_updated` socket event.

---

### PATCH `/api/swaps/:id/reject`
**Auth:** Protected (recipient/toUser only)

Sets `status: "rejected"`.

---

### PATCH `/api/swaps/:id/cancel`
**Auth:** Protected (sender/fromUser only)

Sets `status: "cancelled"` (pending swaps only).

---

### PATCH `/api/swaps/:id/request-completion`
**Auth:** Protected (either participant)

Sets `completionRequestedBy` and `completionRequestedAt`; status remains `"accepted"`. Sends notification to partner.

---

### PATCH `/api/swaps/:id/confirm-completion`
**Auth:** Protected (partner of the user who requested completion)

Sets `status: "completed"`, `completedAt`, `endedAt`. Increments `completedSwaps` for both users. Archives chat (read-only).

---

### PATCH `/api/swaps/:id/cancel-completion-request`
**Auth:** Protected (either participant)

Resets `completionRequestedBy` to null; swap returns to `"accepted"`.

---

### PATCH `/api/swaps/:id/leave`
**Auth:** Protected (either participant)

Sets `status: "left"`, `leftBy`, `endedAt`. Archives chat.

---

### PATCH `/api/swaps/:id/hide`
**Auth:** Protected (either participant)

Adds `userId` to `hiddenFor` array (`$addToSet`). Does not delete the swap.

---

## 7. Chat — `/api/chat`

### GET `/api/chat/conversations`
**Auth:** Protected

Returns all active (`status: "accepted"`) swap conversations with counterpart details, last message, and unread count. Excludes conversations in `chatDeletedFor`.

---

### GET `/api/chat/unread-count`
**Auth:** Protected

**Response 200:**
```json
{
  "success": true,
  "data": {
    "unreadConversationCount": 2,
    "totalUnreadMessageCount": 7
  }
}
```

---

### GET `/api/chat/:swapId/messages`
**Auth:** Protected (participant only; swap must be accepted, completed, or left)

Query params: `page` (default: 1), `limit` (default: 50).

**Response 200:**
```json
{
  "success": true,
  "data": {
    "messages": [...],
    "swapRequest": { ... },
    "isReadOnly": false
  }
}
```

`isReadOnly: true` when swap status is `"completed"` or `"left"`.

**Authorization Rules:**
- JWT required
- `swapId` must be valid 24-char hex ObjectId (400 `INVALID_SWAP_ID`)
- SwapRequest must exist (404 `SWAP_NOT_FOUND`)
- Status must be `accepted`, `completed`, or `left` (403 `SWAP_NOT_ACCEPTED`)
- `chatDeletedFor` must not include current user (404 `CHAT_DELETED`)
- Current user must be `fromUser` or `toUser` (403 `FORBIDDEN`)
- Write operations blocked if status is not `accepted` (403 `CHAT_READ_ONLY`)

---

### PATCH `/api/chat/:swapId/read`
**Auth:** Protected

**Request body (optional):**
```json
{ "messageIds": ["ObjectId", ...] }
```

Marks specified messages (or all incoming unread) as `read`.

---

### DELETE `/api/chat/:swapId/messages/:messageId`
**Auth:** Protected (original sender only)

Soft-deletes message: clears `content` to `""`, sets `isDeleted: true`, broadcasts `message_deleted` to room.

---

### DELETE `/api/chat/:swapId/history`
**Auth:** Protected

Appends `userId` to `chatDeletedFor` (`$addToSet`). Removes conversation from personal history.

---

## 8. Video Meetings — `/api/meetings`

### POST `/api/meetings/instant`
**Auth:** Protected (accepted swap participant only)

**Request body:**
```json
{ "swapId": "ObjectId" }
```

Creates an instant `MeetingSession` (`type: "instant"`, `status: "active"`), posts a `meeting`-type message into the chat thread, emits `new_message` to room, and sends `meeting_started` notification to partner.

**Response 201:**
```json
{ "success": true, "data": { "meeting": {...}, "message": {...} } }
```

---

### POST `/api/meetings`
**Auth:** Protected (accepted swap participant only)

**Request body:**
```json
{
  "swapId": "ObjectId",
  "scheduledAt": "ISO 8601 future datetime",
  "duration": 15 | 30 | 45 | 60,
  "note": "string (optional, max 300 chars)"
}
```

**Response 201:** Same shape as instant meeting.

---

### GET `/api/meetings/:id`
**Auth:** Protected (participant only)

Returns meeting session details.

---

### GET `/api/meetings/:id/join`
**Auth:** Protected (participant only)

Transitions status from `scheduled` to `active` and returns Jitsi configuration:
```json
{
  "success": true,
  "data": {
    "roomName": "skillswap-<swapId>-<meetingId>-<random>",
    "jitsiDomain": "meet.jit.si",
    "user": { "displayName": "...", "email": "..." }
  }
}
```

---

### PATCH `/api/meetings/:id/cancel`
**Auth:** Protected (participant only)

Sets `status: "cancelled"`, emits `meeting_updated` to room, sends `meeting_cancelled` notification.

---

## 9. Ratings and Reviews — `/api/ratings`

### POST `/api/ratings/:swapId`
**Auth:** Protected

**Request body:**
```json
{
  "stars": 5,
  "review": "string (optional, max 500 chars)"
}
```

**Rules:** Swap must be `completed`; user must be a participant; cannot self-rate; one rating per reviewer per swap.

**Response 201:**
```json
{
  "success": true,
  "data": {
    "rating": { /* populated rating document */ },
    "updatedAvgRating": 4.3
  }
}
```

**Errors:** `409` (already rated), `403` (not a participant / self-rating), `400` (swap not completed)

---

### GET `/api/ratings/swap/:swapId/status`
**Auth:** Protected

**Response 200:**
```json
{
  "success": true,
  "data": { "hasRated": true, "rating": { /* or null */ } }
}
```

---

### GET `/api/ratings/user/:userId`
**Auth:** Public

Query params: `page` (default: 1), `limit` (default: 10).

Returns ratings received by the user, sorted newest first. Populates `reviewer` (name, profilePicture, location) and `swapRequest` metadata.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "stars": 5,
      "review": "Great teacher!",
      "reviewer": { "name": "...", "profilePicture": "...", "location": "..." },
      "swapRequest": { "offeredSkill": {...}, "wantedSkill": {...} },
      "createdAt": "..."
    }
  ]
}
```

**Errors:** `400` (invalid userId format), `404` (user not found)

---

## 10. Notifications — `/api/notifications`

### GET `/api/notifications`
**Auth:** Protected

Query params: `page`, `limit`, `unreadOnly=true`.

**Response 200:**
```json
{
  "success": true,
  "data": [...],
  "meta": { "total": 24, "unreadCount": 3, "page": 1, "limit": 20, "totalPages": 2 }
}
```

---

### GET `/api/notifications/unread-count`
**Auth:** Protected

**Response 200:**
```json
{ "success": true, "data": { "count": 24, "unreadCount": 3 } }
```

---

### PATCH `/api/notifications/:id/read`
**Auth:** Protected

Marks a single notification as `read: true`. Emits `notification_unread_update` to user's socket room.

---

### PATCH `/api/notifications/read-all`
**Auth:** Protected

Marks all unread notifications as read. Emits `notification_unread_update` with `unreadCount: 0`.

---

## 11. Portfolio — `/api/portfolio`

### POST `/api/portfolio`
**Auth:** Protected  
**Content-Type:** `multipart/form-data`

**Fields:**
- `media` — file (images: jpg, jpeg, png, webp ≤ 10 MB; videos: mp4, webm ≤ 50 MB, ≤ 60 seconds)
- `caption` — string (optional, max 500 chars)
- `skillId` — ObjectId (optional, must be one of user's own skills)

**Response 201:** Created portfolio item with `reactionSummary` and `currentUserReaction`.

**Errors:** `400` (format/size/duration violation), `409` (portfolio limits exceeded)

---

### GET `/api/portfolio/user/:userId`
**Auth:** Public / Optional Auth

Query params: `type=image|video`.

Returns all active portfolio items for the user with `reactionSummary` and `currentUserReaction` (populated for authenticated callers).

---

### GET `/api/portfolio/:id`
**Auth:** Public / Optional Auth

Returns a single active portfolio item with populated `user` and `skill`.

---

### PATCH `/api/portfolio/:id`
**Auth:** Protected (owner only)

**Request body:**
```json
{ "caption": "string", "skillId": "ObjectId | null" }
```

---

### DELETE `/api/portfolio/:id`
**Auth:** Protected (owner only)

Permanently deletes the portfolio item and its Cloudinary asset.

---

### POST `/api/portfolio/:id/reaction`
**Auth:** Protected

**Request body:**
```json
{ "type": "like | impressive | great_work | creative" }
```

Toggles reaction off if same type clicked again; updates if different type.

**Response 200:**
```json
{
  "success": true,
  "message": "Reaction added.",
  "data": {
    "action": "added | updated | removed",
    "reactionSummary": { "like": 2, "impressive": 5, "great_work": 1, "creative": 0, "total": 8 },
    "currentUserReaction": "impressive"
  }
}
```

---

### GET `/api/portfolio/:id/reactions`
**Auth:** Public / Optional Auth

Returns users who reacted (sanitised: `_id`, `name`, `profilePicture` only).

---

### POST `/api/portfolio/:id/report`
**Auth:** Protected

**Request body:**
```json
{
  "reason": "nudity | violence | illegal | hate_harassment | spam | copyright | other",
  "description": "string (optional, max 500 chars)"
}
```

**Errors:** `403` (owner self-reporting), `409` (duplicate report)

---

## 12. Socket.IO Events

### Connection Handshake
JWT token must be provided in the `auth.token` field or `Authorization: Bearer <token>` header. On successful connection, the socket automatically joins the personal room `user:<userId>` (derived strictly from the verified JWT) and marks pending messages as `delivered`.

### Client → Server Events

| Event | Payload | Description |
|---|---|---|
| `join_swap_chat` | `{ swapId }` | Verifies JWT + swap participation, joins room `swap:<swapId>` |
| `send_message` | `{ swapId, content, replyTo? }` | Persists and broadcasts a chat message |
| `mark_messages_read` | `{ swapId, messageIds }` | Transitions messages to `read` status |

### Server → Client Events

| Event | Target Room | Payload |
|---|---|---|
| `new_message` | `swap:<swapId>` | Saved message document |
| `messages_status_update` | `swap:<swapId>` | `{ type, swapId, readBy, readAt }` |
| `message_deleted` | `swap:<swapId>` | `{ swapId, messageId, deletedAt }` |
| `chat_unread_update` | `user:<userId>` | `{ swapId, senderId, unreadConversationCount, totalUnreadMessageCount }` |
| `swap_request_created` | `user:<userId>` | New swap request document |
| `swap_request_updated` | `user:<userId>` | Updated swap request document |
| `notification` | `user:<userId>` | Notification document + `unreadCount` |
| `notification_unread_update` | `user:<userId>` | `{ unreadCount }` |
| `meeting_updated` | `swap:<swapId>` | Updated meeting session `{ status, ... }` |

---

## 13. Error Reference

| Error Code String | HTTP Status | Meaning |
|---|---|---|
| `INVALID_SWAP_ID` | 400 | swapId is not a valid 24-char hex ObjectId |
| `SWAP_NOT_FOUND` | 404 | SwapRequest document does not exist |
| `SWAP_NOT_ACCEPTED` | 403 | Swap status is not accepted/completed/left |
| `CHAT_DELETED` | 404 | User has deleted this chat from their history |
| `FORBIDDEN` | 403 | User is not a participant on this swap |
| `CHAT_READ_ONLY` | 403 | Write operations blocked (swap completed or left) |
| `SWAP_MISMATCH` | 400 | Message's swapRequest does not match provided swapId |

---

*All endpoints verified against route files in `server/src/routes/` — October 2026.*

