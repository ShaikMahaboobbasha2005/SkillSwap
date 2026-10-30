# 01 — Project Overview

## SkillSwap: A Peer-to-Peer Skill Exchange Platform

---

## Abstract

SkillSwap is a full-stack, production-grade web application that enables users to trade skills directly with one another — no money, no intermediary. A user lists what they can teach (*offered skills*) and what they want to learn (*wanted skills*); the platform matches them with compatible partners, facilitates negotiation through real-time chat and video calls, and builds trust through ratings, reviews, and portfolio showcases. The project was developed as a BTech mini-project using React 19, Node.js, Express, MongoDB Atlas, Socket.IO, and Google Gemini AI.

---

## 1. Introduction

The global e-learning market is large and growing, but most formal learning still requires payment — for courses, tutors, or certifications. Meanwhile, millions of people already possess valuable skills they rarely get to share. SkillSwap addresses this gap by creating a community-driven barter economy of knowledge: if you can teach React and want to learn guitar, you find someone who offers guitar lessons and wants to learn React, and you swap.

The result is a bilateral learning network where value is exchanged symmetrically, access is democratised, and community trust is built through mutual accountability.

---

## 2. Problem Statement

| Pain Point | Status Quo | SkillSwap Solution |
|---|---|---|
| Learning new skills is expensive | Courses cost money, tutors charge fees | Barter-based exchange — teach one thing, learn another |
| Supply of knowledge exists but is hidden | People have skills but no channel to share | Public profile with offered-skill listings and discovery |
| Trust is hard to establish with strangers | No shared history or accountability | Verified ratings + reviews after every completed swap |
| Scheduling and communication is fragmented | Email, WhatsApp, Zoom — separate tools | Integrated real-time chat + Jitsi video inside the platform |
| AI matching is opaque or unreliable | Recommendation black boxes | Transparent 70/30 hybrid: deterministic foundation + optional Gemini AI layer |

---

## 3. Motivation

- **Economic inclusion**: Learning should not be gated by financial capacity.
- **Skill utilisation**: Many people are expert in something but have no platform to productively share it.
- **Community building**: Direct peer-to-peer exchanges create stronger social bonds than transactional marketplaces.
- **Academic relevance**: The project applies full-stack web engineering, real-time systems, AI integration, cloud media, and WebRTC-based conferencing to a real-world social problem.

---

## 4. Objectives

1. Build a complete user authentication and profile system with image/banner uploads via Cloudinary.
2. Implement a skill taxonomy with per-user offered and wanted skill lists.
3. Develop a deterministic skill-compatibility matching engine with optional Google Gemini AI re-ranking.
4. Build a full swap request lifecycle: create → accept/reject → complete with two-party confirmation.
5. Provide real-time chat using Socket.IO with persistent message status receipts.
6. Integrate embedded Jitsi Meet video conferencing directly within chat conversations.
7. Implement a real-time notification system with deep-linking to specific events.
8. Allow users to showcase their work through an Instagram-style portfolio gallery with reactions and moderation.
9. Compute automated reputation scores from verified post-swap reviews.
10. Deliver a fully responsive UI with a System/Light/Dark theme switcher and a cinematic 3D WebGL landing page.

---

## 5. Proposed Solution

SkillSwap is a **monolithic-backend SPA** (Single-Page Application):

- **Frontend**: React 19 SPA served as a static build, with Three.js for the 3D landing page and Tailwind CSS v4 for the design system.
- **Backend**: Node.js + Express.js v5 server handling all REST API routes, Socket.IO WebSocket connections, background jobs, and third-party integrations (Cloudinary, Google Gemini AI).
- **Database**: MongoDB Atlas — a hosted, multi-collection document store accessed via Mongoose v9.
- **External Services**: Cloudinary (media storage), Jitsi Meet (video conferencing), Google Gemini Flash (AI semantic matching).

The architecture prioritises simplicity, testability, and graceful degradation: the AI layer is entirely optional and falls back to deterministic matching if unavailable.

---

## 6. Scope

### In Scope (Implemented)

| Module | Status |
|---|---|
| JWT authentication (signup / login / logout / `/me`) | ✅ Complete |
| User profiles with Cloudinary avatar + banner | ✅ Complete |
| Skill management (offered + wanted, categories, levels, active/inactive) | ✅ Complete |
| User discovery with search and multi-parameter filters | ✅ Complete |
| Deterministic skill-compatibility recommendation engine | ✅ Complete |
| Optional Google Gemini AI semantic re-ranking | ✅ Complete |
| Swap request lifecycle (create, accept, reject, cancel, leave, complete) | ✅ Complete |
| Real-time Socket.IO chat with delivery receipts | ✅ Complete |
| Embedded Jitsi Meet video calls (instant + scheduled) | ✅ Complete |
| Meeting reminder background job | ✅ Complete |
| Real-time in-app notification centre with deep-linking | ✅ Complete |
| Portfolio gallery with image/video uploads, reactions, and moderation | ✅ Complete |
| Post-swap ratings and reviews with automated reputation scoring | ✅ Complete |
| Personal analytics dashboard | ✅ Complete |
| System/Light/Dark theme with anti-FOUC | ✅ Complete |
| Cinematic 3D WebGL landing page | ✅ Complete |
| Responsive mobile layout with bottom navigation bar | ✅ Complete |
| Automated backend test suites (53 tests across 5 files) | ✅ Complete |

### Out of Scope (Not Implemented)

| Feature | Reason |
|---|---|
| Google / OAuth social login | Explicitly excluded in PRD.md |
| Forgot password / email recovery | Out of scope for mini-project |
| Admin moderation panel | Out of scope (moderation infrastructure is in place for future admin) |
| Real-time online/offline presence indicators | Out of scope |
| Push notifications (FCM / APNs) | DB-based in-app only |
| Paid subscriptions or payment processing | Philosophy is barter — no money |
| Street-level address collection | City-only location to protect privacy |

---

## 7. Target Users and Use Cases

### Target Users

SkillSwap is designed for any adult who has a skill to share and a skill they want to learn. The platform is intentionally general — not limited to students or professionals.

**Primary personas:**
- A software developer who wants to learn graphic design and can teach JavaScript.
- A music teacher who wants to learn photography and can teach guitar.
- A student who can tutor mathematics and wants to improve their spoken English.

### Use Cases

| Use Case | Actor | Description |
|---|---|---|
| Register and set up profile | New user | Sign up, add profile photo and bio, add offered and wanted skills |
| Discover matching users | Authenticated user | Browse discover grid filtered by skill, category, and level |
| View AI-powered matches | Authenticated user | Switch to AI Recommendations tab for Gemini-enhanced suggestions |
| Send a swap request | Authenticated user | Select a partner's skill, offer one of your own, submit request |
| Accept/reject incoming request | Recipient user | Manage incoming swap requests from the Swap Requests page |
| Chat in real time | Accepted swap participants | Open chat workspace, send messages, see delivery/read receipts |
| Schedule a video call | Accepted swap participants | Schedule Jitsi Meet session from chat header |
| Complete swap | Both participants | Two-party confirmation flow; unlocks rating |
| Rate and review partner | Completed swap participant | Submit 1–5 star rating with optional text review |
| Showcase work in portfolio | Any user | Upload images/videos, add captions, react to others' work |

---

## 8. Existing System vs. Proposed System

| Dimension | Existing Alternatives | SkillSwap |
|---|---|---|
| **Cost** | Coursera, Udemy charge fees | Completely free; value is exchanged, not bought |
| **Matching** | LinkedIn: keyword search only; no swap semantics | Skill-compatibility matching with AI enhancement |
| **Communication** | External tools (WhatsApp, Zoom) | Integrated real-time chat + embedded video inside the app |
| **Accountability** | No direct exchange verification | Two-party completion confirmation before rating unlocks |
| **Portfolio** | LinkedIn has static projects | Instagram-style media grid with reactions and skill linking |
| **AI** | Most platforms use generic recommendation | Transparent 70/30 hybrid: deterministic anchor + Gemini semantic layer |
| **Privacy** | Many platforms expose exact location | City-only location; no street address stored |

---

## 9. Limitations

- **No email verification**: Accounts are created without verifying email ownership.
- **No password reset**: There is no forgot-password or email-based account recovery flow.
- **No admin panel**: Moderation reports (portfolio flags) are stored in the database but require manual review.
- **Free-tier constraints**: MongoDB Atlas (512 MB storage), Cloudinary (25 GB bandwidth), Render (may spin down after inactivity) impose capacity limits appropriate for a mini-project.
- **No real-time presence**: There is no online/offline indicator for users.
- **Single-server Socket.IO**: The current Socket.IO setup does not support multi-instance horizontal scaling without adding an adapter (e.g. Redis).

---

*Document verified against source code: `c:\SkillSwap\` — October 2026.*

