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
  content: String,       // max 2000 chars (cleared to "" when isDeleted: true)
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
  type: String,          // "completion_request" | "completion_confirmed" | "completion_cancelled" | "swap_request" | "swap_accepted"
  title: String,
  message: String,
  read: Boolean,         // default: false
  createdAt: Date,
  updatedAt: Date
}
```
**Indexes:** `{ user: 1, read: 1, createdAt: -1 }` — for fast unread notifications list and count queries.

## 8. Relationships Overview
- `User` ↔ `Skill` — many-to-many, via `skillsOffered`/`skillsWanted` arrays of ObjectIds
- `SwapRequest` — links two `User`s + two `Skill`s
- `Message` — belongs to `SwapRequest` (many messages per swap) and references `User` as sender
- `Rating` — one-to-one with a completed `SwapRequest` per direction (each user rates the other)
- `Notification` — many-to-one with `User`, generated by events across SwapRequest/Message/Rating

## 9. Auto-Calculated Fields
`User.avgRating` and `User.completedSwaps` are server-managed statistics that can never be modified directly by client requests:
- `User.avgRating`: Recalculated server-side in `ratingService.js` using MongoDB aggregation (`Rating.aggregate({ ratedUser: userId })`) whenever a `Rating` document is successfully persisted. Based strictly on ratings RECEIVED by that user, rounded to 1 decimal place (`Math.round(average * 10) / 10`). Defaults to `0` if 0 ratings received. Submitting a rating updates only the rated user's reputation.
- `User.completedSwaps`: Incremented server-side once for both participants when two-party completion confirmation succeeds in `swapService.js`. Never modified by rating submissions.
- `PUT /api/profile` / `PUT /api/users/me` strictly whitelist-filters editable profile fields (`name`, `profilePicture`, `profileBanner`, `location`), protecting `avgRating` and `completedSwaps` from manual client-side manipulation.

## 10. Notes on Scalability
- Referencing `Skill` by ObjectId instead of storing skill names as free text avoids duplication and keeps matching queries exact-match rather than fuzzy-string
- Compound indexes on high-traffic query paths (messages per room, notifications per user) keep read performance stable as data grows
- No embedded arrays are expected to grow unbounded except `portfolio` — worth capping (e.g. max 12 media items per user) if enforced at the application layer
