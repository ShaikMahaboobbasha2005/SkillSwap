# Phases.md — SkillSwap

12 phases, each scoped to a single deliverable with a clear "Done =" criterion — small enough to complete in one focused session, and unambiguous enough for an AI coding tool (Antigravity) to build without guessing.

## Phase 1 — Project Setup
Init React+Vite frontend, Express backend, MongoDB Atlas connection, folder structure per Architecture.md, env vars.
**Done =** both servers run locally and the backend connects to MongoDB Atlas successfully.

## Phase 2 — Auth
Signup/login/logout with JWT, password hashing (bcrypt), protected route middleware.
**Done =** a user can register, log in, hit a protected route with a token, and log out.

## Phase 3 — User Profile
Profile CRUD: name, profile picture, location. Avg rating and completed swaps left as placeholder fields (populated later, not user-editable).
**Done =** a user can view and edit their own profile, and another user can view it read-only.

## Phase 4 — Skills Module
Add/remove skills-offered and skills-wanted, backed by the shared Skill collection.
**Done =** a user's skill lists persist and display correctly on their profile.

## Phase 5 — Search & Traditional Matching
Search users by skill; rule-based matching (skills-wanted vs. skills-offered overlap).
**Done =** searching a skill returns matching users, and the matches endpoint returns a sensible candidate list for a given user.

## Phase 6 — AI Recommendation
AI re-ranks the traditional match set by compatibility (per Architecture.md — an additive layer, not a replacement).
**Done =** the recommended-matches endpoint returns a ranked list, and traditional matching still works independently if this layer fails.

## Phase 7 — Real-Time Chat
Socket.io setup, per-swap chat rooms, message persistence.
**Done =** two users on an accepted swap can exchange messages live and see them persist on reload.

## Phase 8 — Swap Requests & Notifications
Send/accept/reject/complete a swap request; DB-based notification on each event; ownership rule enforced.
**Done =** the full request lifecycle works, only the correct participant can accept/reject/complete, and notifications appear for each event.

## Phase 9 — Session Completion & Ratings
Completing a swap unlocks the rating form; submitting a rating recalculates avgRating and completedSwaps.
**Done =** completing a swap lets both users rate each other, and the profile's rating/count update automatically.

## Phase 10 — Portfolio Media
Upload images/short videos to Cloudinary, Instagram-style grid on profile, lightbox view.
**Done =** a user can upload media, see it in a grid on their own profile, and other users can view the same grid read-only.

## Phase 11 — UI Polish
Apply Design.md tokens (colors, spacing, radius, typography) consistently across all screens built so far; verify responsive behavior on desktop/tablet/mobile.
**Done =** every screen matches the design system and holds up at all three breakpoints.

## Phase 12 — Testing & Deployment
Postman collection covering every endpoint in API.md; manual click-through of all core flows (happy-path + error cases per Rules.md's Testing Rules); deploy frontend to Vercel, backend to Render.
**Done =** documented pass/fail per feature, and the live deployed URL works end-to-end like the local build.

**Production Checklist** (final pass after deployment, catches environment-specific issues local dev won't surface):
- [ ] Environment variables configured correctly on Vercel/Render
- [ ] MongoDB Atlas connected from the deployed backend
- [ ] Cloudinary uploads working (pfp + portfolio media)
- [ ] JWT authentication working end-to-end in production
- [ ] Socket.io chat working (real-time, not just on localhost)
- [ ] AI recommendations working
- [ ] All frontend routes load correctly
- [ ] No console errors on any page
- [ ] Mobile layout verified on the deployed URL, not just locally

---
**Note:** Documentation (README, Report) tracks the college review schedule, not this phase order — draft/update those in parallel rather than waiting until Phase 12.
