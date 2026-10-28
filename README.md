# 🚀 SkillSwap — Peer-to-Peer Skill Exchange Platform

<div align="center">

![SkillSwap Banner](client/src/assets/logo.png)

**Share What You Know. Master What You Do.**  
*A modern, full-stack peer-to-peer knowledge exchange network where people trade skills directly instead of paying for expensive courses.*

[![Node.js](https://img.shields.io/badge/Node.js-v20+-68A063?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-v5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-000000?logo=three.js&logoColor=white)](https://threejs.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-v4-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![Google Gemini Flash](https://img.shields.io/badge/Google_Gemini-Flash_AI-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

---

## 🌟 Overview

**SkillSwap** is a complete, production-grade web application built to facilitate bilateral and reciprocal skill exchanges. Rather than transacting with fiat currency, members offer what they excel at in exchange for learning something new. 

From an unauthenticated **scroll-driven 3D WebGL landing page** to a rich personal **analytics dashboard**, real-time **Socket.io messaging**, integrated **Jitsi video calls**, **portfolio media showcases**, and a **hybrid deterministic / Google Gemini AI recommendation engine**, SkillSwap provides an end-to-end community learning workspace.

---

## ✨ Core Highlights & Features

### 🎨 1. Scroll-Driven 3D Landing Page
- **Cinematic WebGL Journey**: Built with Three.js, featuring smooth camera choreography across 5 stages: *Discover → Match → Exchange → Learn → Grow*.
- **Abstract Sculptural Avatars**: Monochromatic Linear-inspired capsule avatars with metallic separation rings and luminescent cores.
- **Unified Skill Capsules**: Frosted glass materials (`MeshPhysicalMaterial`) with canvas-rendered typographic badges.
- **Adaptive Performance**: Dynamic compositions for mobile (< 768px), tablet, and desktop with automatic GPU tier adaptation and `prefers-reduced-motion` compliance.

### 🌓 2. System / Light / Dark Themes
- **Zero FOUC (Flash of Unstyled Content)**: Synchronous inline initialization script evaluating saved preferences before React renders.
- **Color Palettes**: Warm cream light mode (`#F7F6F2`, `#1B4332` Pine Green accent) paired with charcoal dark mode (`#0F1210`, `#3FA873` Emerald accent).
- **Interactive Theme Switcher**: Available directly in Settings (`System`, `Light`, `Dark`).

### 🔐 3. Authentication & User Profiles
- **Secure JWT Auth**: Stateless token management, bcrypt password hashing, and cookie/header bearer support.
- **Profile Customization**: Drag-and-drop avatar & banner image uploads with interactive cropping powered by Cloudinary.
- **Automated Cloudinary Lifecycle Cleanup**: Replaced or removed images/banners are safely destroyed on Cloudinary without leaving orphan assets.
- **Social Proof**: Verified social links (GitHub, LinkedIn, Instagram, YouTube, Personal Website) with server-side validation.

### 🧠 4. Skill Taxonomy & Management
- **Skill Lifecycle**: Manage *Offered* (teach) and *Wanted* (learn) skills with categories and proficiency levels (*Beginner*, *Intermediate*, *Advanced*).
- **Active / Inactive Status**: Toggle skill availability without deleting historical records.
- **Canonical Skill Normalization**: Resolves aliases and synonyms (e.g. `JS` ↔ `JavaScript`, `NodeJS` ↔ `Node.js`, `ReactJS` ↔ `React`) with strict false-equivalence guards (`Java !== JavaScript`).

### 🔄 5. Swap Lifecycle & Two-Party Completion
- **Swap Requests**: Browse discovery cards or recommendations, select reciprocal skills, and submit swap proposals.
- **State Machine**: Multi-state workflow (`pending` → `accepted` → `completed`, or `rejected` / `cancelled` / `left`).
- **Two-Party Completion Guard**: Both participants must confirm completion before swap status transitions to `completed` and reputation is updated.
- **Swap History & Per-User Filtering**: Archive completed swaps, filter by status, or hide unwanted history without data loss.

### 💬 6. Real-Time Chat & Video Meetings
- **Live Socket.io Workspace**: Real-time room-based communication (`swap:<swapId>`) with typing indicators and unread counters.
- **WhatsApp-Style Status**: Persistent delivery receipts (`sent` ✓ → `delivered` ✓✓ → `read` ✓✓).
- **In-Chat Meeting Scheduling**: Instant video calls or scheduled sessions directly within the conversation thread.
- **Embedded Jitsi Meet Video**: In-app private video conferences with custom toolbars and zero third-party account requirements.
- **Automated Meeting Reminders**: Background worker delivering advance notifications 15 minutes before scheduled calls.

### ⭐ 7. Ratings, Reviews & Automated Reputation
- **Mutual Verified Reviews**: 1–5 star ratings with written feedback strictly enabled for participants of completed swaps.
- **Aggregated Reputation**: Server-side aggregation recalculating `User.avgRating` exclusively from received reviews.
- **Exact Swap Association**: Every review links directly back to the skills exchanged (`React ↔ Node.js`).

### 🖼️ 8. Portfolio Showcase & Reactions
- **Media Uploads**: Instagram-style media gallery supporting both images (up to 10MB) and short videos (up to 50MB, max 60s).
- **Optimistic Progress**: Uploads display immediate thumbnail previews with live upload percentage progress bars.
- **Social Reactions**: React to portfolio pieces with 4 curated emotions (👍 Like, 🔥 Impressive, 👏 Great Work, 💡 Creative).
- **5-Second Undo Protection**: Edits and deletions provide an atomic 5-second undo toast window before persisting destructive changes.
- **Moderation Flagging**: In-app reporting framework with categorized violation flags.

### 🤖 9. Smart Recommendations & Gemini Flash AI
- **Deterministic Match Engine**: Computes exact reciprocal matches, diminishing-returns scoring curves, and human-readable explanations.
- **User-Triggered Gemini AI Layer**: Opt-in semantic analysis leveraging Google Gemini Flash to evaluate taxonomy connections (e.g. `Frontend` ↔ `React` + `CSS`).
- **70/30 Hybrid Guardrails**: Anchors 70% of candidate rank to deterministic skill alignment, protecting true matches from AI hallucination.
- **Resilient Fallback**: Gracefully falls back to 100% deterministic ranking if API keys are absent or rate limits are reached.

### 🔔 10. Real-Time Notification Center
- **Interactive Notification Bell**: Real-time Navbar bell with pulse indicator and unread counters.
- **Deep-Linking & Auto-Scroll Highlighting**: Clicking a notification navigates directly to the exact swap request, chat message, or review with an ambient 2.5-second visual focus highlight.
- **Dedicated Center**: Full `/notifications` page with read/unread filtering and bulk actions.

### 📱 11. Custom Iconography & Mobile Architecture
- **Proprietary Icon Family**: Handcrafted SVG icon components:
  - 📄✏️ `OfferedSkillIcon` (hand holding document with pencil)
  - 📑🔖 `WantedSkillIcon` (hand holding sheets with bookmark)
  - 🪐 `MatchesIcon` (orbital connection nodes)
- **Mobile Bottom Navigation**: 5-destination bottom navigation bar with safe-area padding (`env(safe-area-inset-bottom)`), active route indicators, and unread badges.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, Three.js, Lucide React, Axios, React Router v7 |
| **Backend** | Node.js, Express.js v5, Mongoose v9, Socket.io v4, Zod, Multer, Bcrypt.js |
| **Database** | MongoDB Atlas (Multi-collection document store with compound indexes & aggregations) |
| **Cloud Media** | Cloudinary (Signed image/video uploads, transformations, and automated destruction) |
| **Artificial Intelligence** | Google Gemini Flash via `@google/genai` (Semantic taxonomy matching) |
| **Conferencing** | Jitsi Meet External API (WebRTC video rooms) |

---

## 📁 Repository Structure

```
SkillSwap/
│
├── client/                     # Frontend Application (React + Vite)
│   ├── public/                 # Static assets
│   └── src/
│       ├── assets/             # Brand logos and static images
│       ├── components/
│       │   ├── chat/           # Chat list, messages, bubbles, date separators
│       │   ├── dashboard/      # Hero, stats, active swaps, recommendations
│       │   ├── discover/       # Discover grid, filters, search bar
│       │   ├── icons/          # OfferedSkillIcon, WantedSkillIcon, MatchesIcon
│       │   ├── landing/        # Cinematic3DScene, LandingSpatialHUD, Navbar
│       │   ├── layout/         # AppLayout, MobileBottomNav
│       │   ├── meetings/       # MeetingMessageCard, JitsiModal, Schedulers
│       │   ├── notifications/  # NotificationBell, NotificationItem, Center
│       │   ├── portfolio/      # PortfolioCard, Lightbox, Upload, Reactions
│       │   ├── profile/        # OwnProfile, PublicProfile, Reviews, Crop
│       │   ├── skills/         # SkillModal, SkillCard, CategoryBadge
│       │   └── swaps/          # SwapRequestCard, RatingModal, Modals
│       ├── context/            # Auth, Theme, Socket, Swap, Notification Contexts
│       ├── hooks/              # Custom React hooks (useAuth, useTheme, etc.)
│       ├── pages/              # 12 Core application page views
│       ├── services/           # Axios service clients
│       └── utils/              # Client date formatters, sorters
│
├── server/                     # Backend API Server (Node + Express)
│   ├── src/
│   │   ├── config/             # MongoDB Atlas & Cloudinary configs
│   │   ├── controllers/        # Thin HTTP controllers
│   │   ├── jobs/               # Background workers (meeting reminder scheduler)
│   │   ├── middleware/         # Auth guards, upload validation, error handlers
│   │   ├── models/             # 9 Mongoose schemas with compound indexes
│   │   ├── routes/             # RESTful API route endpoints
│   │   ├── services/           # Business logic, matching algorithms, AI
│   │   ├── sockets/            # Socket.io event dispatchers & room managers
│   │   └── utils/              # Skill normalization, validators, migrations
│   └── test/                   # Automated backend test suites (53 tests)
│
├── Architecture.md             # System design and component boundaries
├── Database.md                 # MongoDB schemas, relationships, indexes
├── API.md                      # Complete endpoint request/response contracts
├── Design.md                   # UI tokens, color palettes, responsive specs
├── Phases.md                   # Chronological development phase deliverables
├── Rules.md                    # Coding standards and architectural governance
└── README.md                   # Repository overview & quickstart guide
```

---

## 🚀 Quickstart Installation Guide

### Prerequisites
- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **MongoDB Atlas** cluster URI
- **Cloudinary** account (Cloud Name, API Key, API Secret)
- *(Optional)* **Google Gemini API Key** for user-triggered semantic matching

### 1. Clone Repository
```bash
git clone https://github.com/ShaikMahaboobbasha2005/SkillSwap.git
cd SkillSwap
```

### 2. Configure Backend Server
```bash
cd server
npm install
```

Create a `.env` file inside the `server/` directory:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/skillswap?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional: Google Gemini AI Recommendations
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Configure Frontend Client
```bash
cd ../client
npm install
```

Create a `.env` file inside the `client/` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Run Development Servers

**Start Backend Server:**
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**Start Frontend Application:**
```bash
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

Navigate to `http://localhost:5173` in your browser.

---

## 🧪 Automated Testing

SkillSwap includes automated test suites covering recommendations, video meetings, notifications, ratings, and semantic AI matching with mock handlers:

```bash
cd server

# 1. Recommendation engine & skill normalization (15 tests)
node test/recommendation_test.js

# 2. Video meetings & scheduling authorization (10 tests)
node test/meeting_test.js

# 3. Notification Center & real-time dispatch (12 tests)
node test/notification_test.js

# 4. Rating & swap association integrity (4 tests)
node test/rating_swap_association_test.js

# 5. Gemini Flash user-triggered AI matching & fallback (12 tests)
node test/gemini_matching_test.js
```

**Frontend Production Build Verification:**
```bash
cd client
npm run build
```

---

## 🔒 Security & Data Integrity

- **Stateless Authentication**: Pure JWT tokens verified across every protected REST route and Socket.IO handshake.
- **Strict Authorization**: Multi-layered checks ensure only active participants on accepted swaps can access chat logs or video calls.
- **Orphan Prevention**: Background cleanup hooks delete obsolete Cloudinary assets immediately when replaced or removed.
- **Database Idempotency**: Atomic operations (`findOneAndUpdate`) prevent race conditions during completion confirmations or reminder notifications.
- **Zero Committed Secrets**: All sensitive keys reside in `.env` files with full `.gitignore` enforcement.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**Shaikh Mahaboob Basha**  
- **GitHub**: [@ShaikMahaboobbasha2005](https://github.com/ShaikMahaboobbasha2005)
- **Repository**: [SkillSwap](https://github.com/ShaikMahaboobbasha2005/SkillSwap)
