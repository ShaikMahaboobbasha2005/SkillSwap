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
| GET | `/api/swaps` | Protected | List current user's swap requests (sent + received) |
| PATCH | `/api/swaps/:id/accept` | Protected | Accept a pending swap request |
| PATCH | `/api/swaps/:id/reject` | Protected | Reject a pending swap request |
| PATCH | `/api/swaps/:id/complete` | Protected | Mark an accepted swap as completed |

## Chat
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/chat/:swapId` | Protected | Get message history for a swap's chat room. Supports optional `?page=&limit=` (e.g. `?page=1&limit=50`) for older messages as history grows |
| POST | `/api/chat/:swapId` | Protected | Send a message (also emitted live via Socket.io) |

**Socket.io events:**
- `join_room` (client → server): join a chat room by swapId
- `send_message` (client → server): send a message
- `new_message` (server → client): broadcast a new message to room participants

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

**Ownership rule:** for `PATCH /api/swaps/:id/accept`, `/reject`, and `/complete` — only the appropriate participant on that specific swap request may perform the action (e.g. only the recipient can accept/reject; either participant can mark complete). The backend must verify the authenticated user is a valid participant on the swap before applying the state change, returning `403 Forbidden` otherwise.

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
| 409 | Conflict (e.g. duplicate email on signup, duplicate pending swap request) |
| 500 | Internal server error |
