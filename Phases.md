# Phases.md — SkillSwap

12 phases, each scoped to a single deliverable with a clear "Done =" criterion — small enough to complete in one focused session, and unambiguous enough for an AI coding tool (Antigravity) to build without guessing.

## Phase 1 — Project Foundation
- **Goal:** Set up the initial project environment and backend/frontend infrastructure.
- **Features:**
  - React + Vite frontend setup
  - Express backend setup
  - MongoDB Atlas database connection
  - Layered folder structure
  - Environment variables (`.env`)
  - Initial configuration
- **Done =** Frontend and backend run successfully and MongoDB Atlas is connected.

## Phase 2 — Authentication
- **Goal:** Implement secure authentication and route protection middleware.
- **Features:**
  - User signup
  - User login
  - JWT token management
  - Password hashing with bcrypt
  - Protected routes
  - Authentication middleware
- **Done =** Users can authenticate and access protected resources.

## Phase 3 — User Profiles
- **Goal:** Support profile creation, modification, and public viewing.
- **Features:**
  - Profile CRUD operations
  - Profile picture management
  - Bio management
  - Location setting
  - Public profile view
  - Placeholder fields for `avgRating` and `completedSwaps`
- **Done =** Users can manage their profile and others can view it.

## Phase 4 — Skills Management
- **Goal:** Provide full skill lifecycle management and categorization.
- **Features:**
  - Skill CRUD operations
  - Active / Inactive status toggle
  - Skill categories
  - Skill ownership verification
  - Public filtering by skill
- **Architecture Decision:** Skill is the source of truth.
- **Done =** Skills are fully manageable.

## Phase 5 — Discover
- **Goal:** Enable user discovery through card-based search and filter interfaces.
- **Features:**
  - Search by skill and keyword
  - Multi-parameter filters
  - Pagination support
  - User grouping
  - User-centric discover cards
  - Public profile integration
- **Architecture Decision:** One User = One Discover Card.
- **Done =** Discover is fully functional.

## Phase 6 — Skill Swap Workflow
- **Goal:** Orchestrate the complete swap request lifecycle across the platform.
- **Features:**
  - Create swap requests
  - Select offered skill
  - Select requested skill
  - Optional request message
  - Incoming requests management
  - Outgoing requests management
  - Accept request
  - Reject request
  - Cancel request
  - Validation and permission checks
  - Dashboard integration
  - Discover integration
  - Public profile integration
- **Done =** Users can complete the entire swap request lifecycle.

## Phase 7 — Communication
- **Goal:** Provide real-time chat between matched users.
- **Features:**
  - Socket.io setup
  - Per-swap chat rooms
  - Message persistence in MongoDB
  - Real-time messaging delivery
- **Done =** Accepted users can chat in real time.

## Phase 8 — Sessions & Reviews
- **Goal:** Handle swap completions, reviews, and automated reputation scoring.
- **Features:**
  - Complete swap action
  - Ratings & reviews submission
  - Average rating calculation (`avgRating`)
  - Completed swap count increment (`completedSwaps`)
- **Done =** Completed swaps update ratings and user reputation.

## Phase 9 — Portfolio & Media
- **Goal:** Enable portfolio uploads to display user work samples.
- **Features:**
  - Cloudinary uploads integration
  - Image and short video support
  - Interactive portfolio grid
  - Full-screen media viewer / lightbox
- **Done =** Users can showcase their work.

## Phase 10 — Smart Recommendations
- **Goal:** Enhance candidate matching using an intelligent AI recommendation layer.
- **Features:**
  - Traditional rule-based matching
  - AI candidate ranking
  - Compatibility scoring
  - Graceful fallback when AI is unavailable
- **Architecture Decision:** AI enhances traditional matching and never replaces it.
- **Done =** AI recommendations work while traditional matching remains functional.

## Phase 11 — Notifications & Polish
- **Goal:** Add real-time/in-app notifications and elevate overall UI/UX quality.
- **Features:**
  - Notification center
  - Request notifications
  - Rating notifications
  - Loading states & skeleton loaders
  - Empty states
  - Micro-animations and transitions
  - Responsive verification across screen sizes
  - Accessibility improvements (a11y)
  - Design polish
- **Done =** Application feels production-ready.

## Phase 12 — Testing & Deployment
- **Goal:** Thoroughly test the application and deploy both frontend and backend services.
- **Features:**
  - Comprehensive API testing
  - Manual flow testing
  - Error handling verification
  - Authentication verification
  - Production deployment (Render backend & Vercel frontend)
  - MongoDB Atlas & Cloudinary integration checks
  - Production checklist execution
- **Done =** Application is successfully deployed and works end-to-end.

---

### Production Checklist
- [ ] Environment variables configured correctly on Vercel/Render
- [ ] MongoDB Atlas connected from the deployed backend
- [ ] Cloudinary uploads working (pfp + portfolio media)
- [ ] JWT authentication working end-to-end in production
- [ ] Socket.io chat working (real-time, not just on localhost)
- [ ] AI recommendations working with graceful fallback
- [ ] All frontend routes load correctly
- [ ] No console errors on any page
- [ ] Mobile layout verified on the deployed URL
