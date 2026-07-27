# Rules.md — SkillSwap

Coding conventions to keep every phase consistent — especially important since the build is AI-assisted (Antigravity) across multiple sessions/phases. These rules exist so the AI tool produces the same style every time, not something different per phase.

## 1. Naming Conventions
- **Files**: camelCase for JS files (`authController.js`, `matchingService.js`); PascalCase for React components (`ProfileCard.jsx`, `PortfolioGrid.jsx`)
- **Variables/functions**: camelCase (`getUserProfile`, `avgRating`)
- **MongoDB collections/models**: PascalCase singular (`User`, `SwapRequest`, `Skill`)
- **Routes**: kebab-case, plural nouns (`/api/swap-requests` style where multi-word — though this project mostly uses single-word resources per API.md)
- **CSS/Tailwind**: use design tokens (spacing/radius/color from Design.md) instead of arbitrary values — no `p-[13px]`, use the nearest token

## 2. Folder Structure
Follow Architecture.md's structure exactly — don't introduce new top-level folders without updating Architecture.md first. New features go into the existing `routes/ controllers/ services/ models/` pattern, not ad hoc files.

## 3. Code Style
- Functional React components only, using hooks — no class components
- Async/await over `.then()` chains
- One component per file, default export
- Keep controllers thin — business logic belongs in `services/`, per Architecture.md's layering rule
- Every route handler wrapped in try/catch or routed through a shared `asyncHandler` to avoid unhandled promise rejections

## 4. Error Handling
- All errors funnel through the shared `errorHandler` middleware — no scattered custom error responses
- Use the standard response shape from API.md (`{ success, data }` / `{ success, message }`) everywhere, no exceptions
- Never leak stack traces or internal error details to the client in production

## 5. Validation
- Every route accepting a request body validates it with Zod/Joi before touching the database — no manual `if (!field)` checks scattered through controllers

## 6. Git & Commits
- Commit messages: `type: short description` (e.g. `feat: add swap request accept endpoint`, `fix: correct avgRating calculation`, `chore: update Design tokens`)
- One logical change per commit — don't bundle unrelated fixes with new features
- Branch per phase (e.g. `phase-2-auth`, `phase-6-ai-recommendation`) if using branches at all; otherwise commit directly but keep messages phase-tagged

## 7. Environment & Secrets
- All secrets (JWT secret, Mongo URI, Cloudinary keys) in `.env`, never hardcoded, `.env` in `.gitignore`
- Reference `Constraints` in PRD.md — free-tier services only, so don't introduce a paid dependency mid-build

## 8. AI-Assistance Rules (for Antigravity prompts)
- Always reference the specific doc (Architecture.md, Database.md, API.md, Design.md) relevant to the phase being built, rather than describing the feature from scratch each time
- One phase = one prompt with a single clear "Done = ..." criterion, per Phases.md
- Don't let the AI tool introduce new npm packages outside the agreed tech stack without a deliberate decision
- Don't let the AI tool invent new API routes or DB fields not already documented — update the relevant doc first, then build

## 9. Testing Rules
- Every new API endpoint should be tested with Postman before the phase is marked complete
- Frontend forms must be tested for both success and validation errors
- No feature is considered complete until both happy-path and common error cases work

## 10. Consistency Checks
Before marking a phase complete, verify:
- New code follows the naming/folder conventions above
- New routes match API.md exactly (or API.md was updated first)
- New UI uses Design.md tokens (colors, spacing, radius) — no off-palette colors or arbitrary spacing
