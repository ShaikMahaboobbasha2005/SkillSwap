# PRD.md — SkillSwap

## 1. Overview
SkillSwap is a two-sided skill exchange platform where users trade knowledge instead of money. A user offers skills they can teach and lists skills they want to learn; the platform matches them with others whose offerings and wants complement theirs, and facilitates the request, chat, session, and review process end to end.

**Tagline:** Swap Skills. Grow Together.

## 2. Problem Statement
Learning a new skill usually means paying for a course or a tutor. Meanwhile, most people already have skills worth teaching but no easy way to trade them directly with someone who has what they want in return. SkillSwap removes the money layer and turns skill exchange into a barter-based, community-driven marketplace.

## 3. Target Users
General users — anyone who has a skill to teach and a skill they want to learn. Not scoped to a specific group (e.g. not students-only).

## 4. Goals
- Let a user list what they can teach and what they want to learn
- Surface relevant matches, both via direct search and system-suggested matching
- Let two matched users agree on a swap, communicate, and complete a session
- Build trust through a rating and review system, and through visual proof of skill (portfolio media)
- Deliver a scalable, fully responsive experience across desktop, tablet, and mobile
- Ship a working, demoable product within the mini-project timeline

## 5. Non-Goals (explicitly out of scope)
- Google Login
- Forgot Password / email-based account recovery
- Full session history / scheduling calendar
- Admin panel
- Real-time push notifications (in-app DB-based only)
- Online/offline presence indicators
- Standalone reputation system separate from ratings
- Exact/street-level address collection or display

## 6. Core Features

1. **User Authentication** — signup/login with JWT, no third-party auth

2. **User Profile**
   - Editable fields: name, profile picture, location (city only — e.g. Bangalore, Anantapur, Hyderabad; no exact address)
   - Auto-calculated fields (not manually entered): average rating, completed swaps count
   - **Portfolio media**: user can upload images or short videos demonstrating a skill (via Cloudinary), displayed as an Instagram-style grid on their profile — builds trust beyond ratings alone
   - When User A views User B's profile: B's name, pfp, location, rating, completed swaps, skills offered/wanted, and portfolio grid are all visible (read-only)

3. **Skill Management** — add/edit/remove skills offered and skills wanted

4. **Search Users** — find users by skill

5. **Traditional Skill Matching** — rule-based matching on skills-offered vs. skills-wanted overlap

6. **AI Best-Match Recommendation** — ranked suggestions beyond simple overlap

7. **Skill Swap Requests** — send, accept, or reject a swap request

8. **In-App Chat** — real-time messaging between matched users (Socket.io)

9. **Session Completion** — mark a swap as complete, which unlocks rating

10. **Notifications** — simple database-based notifications for key events

11. **Ratings & Reviews** — post-swap rating that feeds the profile's average rating

## 7. Core User Flow
1. Sign up / log in
2. Build profile: name, pfp, location, skills offered + wanted, portfolio media
3. Search or receive AI-recommended matches
4. View a candidate's profile — including their portfolio grid — before requesting
5. Send a swap request to a matching user
6. Chat once the request is accepted
7. Complete the session
8. Rate and review the other user
9. Profile's average rating and completed-swap count update automatically

## 8. Non-Functional Requirements
- **Responsive design**: fully usable and visually consistent across desktop, tablet, and mobile breakpoints
- **Scalability**: architecture and data model should not assume a small, fixed user base — matching, search, and chat should be designed to hold up as user count grows

## 9. Success Criteria (for mini-project evaluation)
- All 11 core features functional end-to-end in a deployed build
- A user can complete the full flow above without developer intervention
- Portfolio media uploads and displays correctly across image and video types
- Matching (both traditional and AI) returns sensible results on seeded test data
- UI verified responsive on desktop, tablet, and mobile viewports

## 10. Tech Stack
React + Vite · Node.js + Express.js · MongoDB Atlas · JWT · Cloudinary · Socket.io · Jitsi Meet embed · Postman · Vercel (frontend) + Render (backend) · Zod/Joi validation — all free tier.
