# Database.md — SkillSwap

MongoDB Atlas (free tier), accessed via Mongoose. Collections below map directly to the entities used in Architecture.md.

## 1. User
```js
{
  _id: ObjectId,
  name: String,
  email: String,          // unique, indexed
  passwordHash: String,
  profilePicture: String,             // Cloudinary URL
  profilePicturePublicId: String,     // Cloudinary public_id for safe deletion
  profileBanner: String,              // Cloudinary URL
  profileBannerPublicId: String,      // Cloudinary public_id for safe deletion
  location: String,                   // city only, e.g. "Bangalore" — no exact address
  bio: String,                        // optional short bio, max 160 chars, default ""
  socialLinks: {                      // optional full URLs, default ""
    linkedin: String,
    github: String,
    instagram: String,
    youtube: String,
    website: String
  },
  role: String,                // "user" | "admin" — reserved for future use (e.g. admin panel); guests are unauthenticated visitors and are never stored as a User document
  skillsOffered: [ObjectId],   // ref: Skill
  skillsWanted: [ObjectId],    // ref: Skill
  portfolio: [
    {
      type: String,           // "image" | "video"
      url: String,             // Cloudinary URL
      caption: String,
      linkedSkill: ObjectId,   // ref: Skill, optional
      createdAt: Date
    }
  ],
  avgRating: Number,           // auto-calculated, not user-editable
  completedSwaps: Number,       // auto-calculated, not user-editable
  createdAt: Date,
  updatedAt: Date
}
```
**Indexes:** `email` (unique), `skillsOffered`, `skillsWanted`, `location` — supports search/matching at scale.

## 2. Skill
```js
{
  _id: ObjectId,
  name: String,       // unique, normalized lowercase e.g. "guitar"
  category: String     // optional grouping, e.g. "Music", "Programming"
}
```
A shared lookup collection — users reference `Skill._id` in `skillsOffered`/`skillsWanted` rather than storing free-text strings, so matching stays exact and searchable.

## 3. SwapRequest
```js
{
  _id: ObjectId,
  fromUser: ObjectId,     // ref: User
  toUser: ObjectId,        // ref: User
  offeredSkill: ObjectId,  // ref: Skill
  wantedSkill: ObjectId,   // ref: Skill
  offeredSkillSnapshot: {  // immutable historical snapshot at creation time
    name: String,
    level: String
  },
  wantedSkillSnapshot: {   // immutable historical snapshot at creation time
    name: String,
    level: String
  },
  offeredSkillName: String, // immutable snapshot of offered skill name
  offeredSkillLevel: String, // immutable snapshot of offered skill level
  wantedSkillName: String,  // immutable snapshot of wanted skill name
  wantedSkillLevel: String, // immutable snapshot of wanted skill level
  message: String,         // optional request message (max 500 chars)
  status: String,          // "pending" | "accepted" | "rejected" | "cancelled" | "completed" | "left"
  leftBy: ObjectId,        // ref: User (optional — user who left when status is "left")
  completionRequestedBy: ObjectId, // ref: User (user who initiated completion request)
  completionRequestedAt: Date,     // timestamp when completion was requested
  completion: {
    fromUserConfirmed: Boolean,    // true if fromUser confirmed completion
    toUserConfirmed: Boolean       // true if toUser confirmed completion
  },
  completedAt: Date,       // timestamp when both users confirmed completion
  endedAt: Date,           // timestamp when swap completed or left
  chatDeletedFor: [ObjectId], // ref: User (array of userIds who deleted this swap from their personal history)
  hiddenFor: [ObjectId],      // ref: User (array of userIds who hid this swap from incoming/outgoing lists)
  createdAt: Date,
  updatedAt: Date
}
```
**Indexes:** `fromUser`, `toUser`, `status`, `chatDeletedFor` — plus compound indexes `{ fromUser: 1, toUser: 1, offeredSkill: 1, wantedSkill: 1, status: 1 }` and `{ status: 1, chatDeletedFor: 1 }` for duplicate request detection, history queries, and active conversation filtering.

## 4. Message
```js
{
  _id: ObjectId,
  swapRequest: ObjectId, // ref: SwapRequest — authoritative relationship for chat
  sender: ObjectId,      // ref: User
  type: String,          // "text" | "meeting" (default: "text")
  content: String,       // max 2000 chars (cleared to "" when isDeleted: true)
  meetingSession: ObjectId, // ref: MeetingSession (populated when type === "meeting")
  isDeleted: Boolean,    // soft delete flag (default: false)
  deletedAt: Date,       // soft delete timestamp
  status: String,        // "sent" | "delivered" | "read"
  deliveredAt: Date,     // timestamp when delivered to recipient socket session
  readAt: Date,          // timestamp when recipient opened/viewed conversation
  replyTo: ObjectId,     // ref: Message (optional self-reference to target message being replied to)
  createdAt: Date,
  updatedAt: Date
}
```
**Indexes:** `swapRequest` single index, plus `{ swapRequest: 1, createdAt: -1 }`, `{ swapRequest: 1, createdAt: 1 }`, and `{ swapRequest: 1, sender: 1, status: 1 }` compound indexes for fast chronological history and unread count queries.

## 5. MeetingSession
```js
{
  _id: ObjectId,
  swap: ObjectId,          // ref: SwapRequest (required, indexed)
  participants: [ObjectId],// ref: User (the two accepted swap participants)
  createdBy: ObjectId,     // ref: User (initiator of the session)
  roomName: String,        // unique deterministic Jitsi room identifier
  scheduledAt: Date,       // date and time of the session (default: Date.now for instant)
  duration: Number,        // session duration in minutes (15, 30, 45, 60; default: 30)
  status: String,          // "scheduled" | "active" | "completed" | "cancelled" (default: "scheduled")
  type: String,            // "instant" | "scheduled" (default: "scheduled")
  note: String,            // optional topic/goal description (max 300 chars)
  reminded15m: Boolean,    // atomic reminder flag for 15-minute advance notification (default: false)
  remindedStart: Boolean,  // atomic reminder flag for session start notification (default: false)
  createdAt: Date,
  updatedAt: Date
}
```
**Indexes:** `swap` single index, compound `{ swap: 1, status: 1 }`, `{ participants: 1, status: 1 }`, `{ status: 1, reminded15m: 1, scheduledAt: 1 }`, and `{ status: 1, remindedStart: 1, scheduledAt: 1 }` for low-overhead scheduler polling and participant access.

## 6. Rating
```js
{
  _id: ObjectId,
  swapRequest: ObjectId, // ref: SwapRequest — target completed swap
  reviewer: ObjectId,    // ref: User — user submitting rating
  ratedUser: ObjectId,   // ref: User — user receiving rating
  stars: Number,         // 1–5 integer
  review: String,        // optional text (max 500 chars)
  createdAt: Date,
  updatedAt: Date
}
```
**Indexes:** `ratedUser` single index (for fetching received reviews), plus compound unique index `{ swapRequest: 1, reviewer: 1 }` (enforcing max 1 rating per reviewer per swap at the database level).

## 7. Notification
```js
{
  _id: ObjectId,
  user: ObjectId,        // ref: User — recipient
  sender: ObjectId,      // ref: User — sender / trigger user
  swap: ObjectId,        // ref: SwapRequest
  type: String,          // "completion_request" | "completion_confirmed" | "completion_cancelled" | "swap_request" | "swap_accepted" | "meeting_scheduled" | "meeting_reminder" | "meeting_started" | "meeting_cancelled"
  title: String,
  message: String,
  read: Boolean,         // default: false
  createdAt: Date,
  updatedAt: Date
}
```
**Indexes:** `{ user: 1, read: 1, createdAt: -1 }` — for fast unread notifications list and count queries.

## 8. Portfolio
```js
{
  _id: ObjectId,
  user: ObjectId,        // ref: User — portfolio owner
  media: {
    url: String,         // Cloudinary secure delivery URL
    publicId: String,    // Cloudinary public ID for asset management & deletion
    type: String,        // "image" | "video"
    thumbnailUrl: String,// generated video poster or thumbnail URL
    duration: Number     // video duration in seconds (max 60s, null for images)
  },
  caption: String,       // optional text (max 500 chars)
  skill: ObjectId,       // ref: Skill (optional linked skill owned by user)
  moderationStatus: String, // "active" | "reported" | "hidden" | "removed" (default: "active")
  reportCount: Number,   // default: 0
  reactions: [           // subdocument array for user reactions (1 active reaction per user)
    {
      user: ObjectId,    // ref: User (required)
      type: String,      // enum: ["like", "impressive", "great_work", "creative"] (required)
      createdAt: Date    // timestamp (default: Date.now)
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```
**Indexes:** `user` single index, plus compound index `{ user: 1, moderationStatus: 1, "media.type": 1, createdAt: -1 }` for optimized user portfolio retrieval and media filtering.

## 9. PortfolioReport
```js
{
  _id: ObjectId,
  portfolioItem: ObjectId, // ref: Portfolio — target reported portfolio item
  reporter: ObjectId,      // ref: User — user submitting report
  reason: String,          // enum: ["nudity", "violence", "illegal", "hate_harassment", "spam", "copyright", "other"] (required)
  description: String,     // optional text (max 500 chars, default: "")
  status: String,          // enum: ["pending", "reviewed", "dismissed", "action_taken"] (default: "pending")
  createdAt: Date,
  updatedAt: Date
}
```
**Indexes:** `portfolioItem` and `reporter` single indexes, plus compound unique index `{ portfolioItem: 1, reporter: 1 }` enforcing maximum 1 report per user per portfolio item at the database level.

## 10. Relationships Overview
- `User` ↔ `Skill` — many-to-many, via `skillsOffered`/`skillsWanted` arrays of ObjectIds
- `SwapRequest` — links two `User`s + two `Skill`s
- `Message` — belongs to `SwapRequest` (many messages per swap) and references `User` as sender
- `Rating` — one-to-one with a completed `SwapRequest` per direction (each user rates the other)
- `Notification` — many-to-one with `User`, generated by events across SwapRequest/Message/Rating
- `Portfolio` — many-to-one with `User` (max 20 images, 10 videos, 30 total items per user), optional reference to `Skill` owned by user
- `PortfolioReport` — many-to-one with `Portfolio` (target media) and `User` (reporter), with DB-level compound unique constraint `{ portfolioItem: 1, reporter: 1 }` preventing duplicate reports per user


## 10. Auto-Calculated Fields
`User.avgRating` and `User.completedSwaps` are server-managed statistics that can never be modified directly by client requests:
- `User.avgRating`: Recalculated server-side in `ratingService.js` using MongoDB aggregation (`Rating.aggregate({ ratedUser: userId })`) whenever a `Rating` document is successfully persisted. Based strictly on ratings RECEIVED by that user, rounded to 1 decimal place (`Math.round(average * 10) / 10`). Defaults to `0` if 0 ratings received. Submitting a rating updates only the rated user's reputation.
- `User.completedSwaps`: Incremented server-side once for both participants when two-party completion confirmation succeeds in `swapService.js`. Never modified by rating submissions.
- `PUT /api/profile` / `PUT /api/users/me` strictly whitelist-filters editable profile fields (`name`, `profilePicture`, `profileBanner`, `location`, `bio`, `socialLinks`), protecting `avgRating` and `completedSwaps` from manual client-side manipulation.

## 11. Notes on Scalability
- Referencing `Skill` by ObjectId instead of storing skill names as free text avoids duplication and keeps matching queries exact-match rather than fuzzy-string
- Compound indexes on high-traffic query paths (messages per room, notifications per user, portfolio per user) keep read performance stable as data grows
- Portfolio items stored as separate documents rather than embedded arrays in `User` to allow independent media scaling, pagination, and future moderation workflows
