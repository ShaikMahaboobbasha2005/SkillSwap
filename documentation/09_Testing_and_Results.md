# 09 — Testing and Results

## SkillSwap — Testing Approach, Test Suites, and Known Issues

---

## 1. Testing Approach

SkillSwap uses **manual integration testing** for the full end-to-end flow (HTTP routes, database operations, socket events) and **automated unit/integration tests** for the core algorithmic services (recommendation engine, meeting logic, notifications, ratings, and AI matching).

There is no formal test framework (Jest, Mocha, etc.) — tests are written as plain Node.js scripts using the built-in `assert` module with a custom `runTest` helper. Each test file prints `✅ [PASS]` or `❌ [FAIL]` per test case.

**Test file locations:** `server/test/`

```
server/test/
├── recommendation_test.js     (15 tests)
├── meeting_test.js            (10 tests)
├── notification_test.js       (12 tests)
├── rating_swap_association_test.js  (4 tests)
└── gemini_matching_test.js    (12 tests)
```

**Total automated test count:** 53 tests across 5 files.

---

## 2. Test Commands

```bash
cd server

# 1. Recommendation engine and skill normalization
node test/recommendation_test.js

# 2. Video meetings and session scheduling
node test/meeting_test.js

# 3. Notification center and real-time dispatch
node test/notification_test.js

# 4. Rating and swap association integrity
node test/rating_swap_association_test.js

# 5. Gemini Flash AI matching and fallback
node test/gemini_matching_test.js
```

> **Note on `meeting_test.js` and `notification_test.js`:** These tests attempt to connect to the configured `MONGODB_URI`. If no `.env` is present, they fall back to a local `mongodb://127.0.0.1:27017/skillswap_test`. Tests that require a live database connection may skip or report limited results without a valid database URI.

---

## 3. Test Suite Descriptions

### 3.1 Recommendation Engine Tests (`recommendation_test.js`) — 15 Tests

Tests the deterministic matching algorithm entirely in-memory — no database connection required.

| # | Test Name | What It Verifies |
|---|---|---|
| 1 | JavaScript vs JS Exact Alias Match | `JS` ↔ `JavaScript` alias resolves; score = 26; original name `"JS"` preserved in reasons |
| 2 | Node.js vs NodeJS Exact Alias Match | `NodeJS` ↔ `Node.js` alias resolves correctly |
| 3 | Java ≠ JavaScript False Equivalence Guard | `Java` must NOT match `JavaScript` |
| 4 | React ≠ React Native False Equivalence Guard | `React` must NOT match `React Native` |
| 5 | Mutual Match Bonus (+20) | Two-way exact match applies +20 bonus; `mutualMatch: true` |
| 6 | Single One-Way Match Score | Single exact match in one direction → score = 26 |
| 7 | Two-Way Single-Skill Match | 1↔1 mutual match → score = 72 (26 + 26 + 20) |
| 8 | Diminishing Returns (2 matches) | 2 exact matches one direction → score = 36 |
| 9 | Progressive Scoring (3↔2) | 3-way offer vs 2-way want → score = 98 |
| 10 | Related Category Match | Same category but no exact name match → `relatedMatches` populated; +8 per match |
| 11 | No Match — Zero Score | Completely unrelated skills → score = 0 |
| 12 | Score Clamped at 100 | High combination of exact + mutual + related cannot exceed 100 |
| 13 | Display Name Preservation | Original user-entered names preserved in reasons despite alias resolution |
| 14 | Empty Skills Handling | User with no skills → score = 0; no crash |
| 15 | Self-Exclusion | Candidate matching against own skills excluded from recommendations |

### 3.2 Video Meeting Tests (`meeting_test.js`) — 10 Tests

Tests the meeting service logic, access control, and room name generation. Requires a MongoDB connection for persistence tests; connection errors cause DB-dependent tests to report skipped/limited results.

| # | Test Name | What It Verifies |
|---|---|---|
| 1 | Accepted Swap Access | Participants of accepted swaps can create meetings |
| 2 | Unauthorized Access Blocked | Non-participants cannot create or join meetings (403) |
| 3 | Pending Swap Blocked | Meeting creation blocked for pending swaps |
| 4 | Instant Meeting Creation | Instant session creates `MeetingSession` with `type: "instant"`, `status: "active"` |
| 5 | Scheduled Meeting Creation | Future session creates `status: "scheduled"` with correct `scheduledAt` |
| 6 | Participant Access Control | Both participants (fromUser and toUser) can access the meeting |
| 7 | Meeting Cancellation | Cancels session, emits `meeting_updated`, creates cancellation notification |
| 8 | Reminder Eligibility | Sessions within 15-minute window and `reminded15m: false` are eligible |
| 9 | Duplicate Reminder Prevention | Atomic `findOneAndUpdate` prevents double-delivery of reminders |
| 10 | Chat Message Integration | Meeting creation posts a `type: "meeting"` message to the chat thread |

### 3.3 Notification Tests (`notification_test.js`) — 12 Tests

Tests the notification service, Socket.IO broadcast, pagination, filtering, and mark-as-read operations.

| # | Test Name | What It Verifies |
|---|---|---|
| 1 | Notification Creation | `createNotification` persists to DB and returns the document |
| 2 | User Isolation | Notifications are only visible to the intended recipient |
| 3 | Unread Count Accuracy | `unreadCount` increments on new notifications and resets to 0 on mark-all-read |
| 4 | Pagination | Large notification sets are split correctly across pages |
| 5 | Mark Single as Read | Individual notification `read: true`; unread count decrements |
| 6 | Mark All as Read | All unread notifications transition to `read: true` |
| 7 | Socket.IO Broadcast | Notification is emitted to `user:<userId>` room with correct payload |
| 8 | Swap Request Producer | Swap service calls `createNotification` for `swap_request` type |
| 9 | Rating Received Producer | Rating service creates `rating_received` notification after successful rating |
| 10 | Missing Swap Reference | Notification created without `swap` field when `required: false` allows it |
| 11 | Deduplication | Notifications with same `_id` are not duplicated in `NotificationContext` |
| 12 | Notification Type Enum | Only valid `type` values are accepted; invalid types rejected |

### 3.4 Rating and Swap Association Tests (`rating_swap_association_test.js`) — 4 Tests

| # | Test Name | What It Verifies |
|---|---|---|
| 1 | Rating Linked to Correct Swap | `rating.swapRequest` matches the `swapId` passed to the endpoint |
| 2 | Skill Context in Response | Populated response includes `offeredSkill` and `wantedSkill` names |
| 3 | Duplicate Rating Prevention | Second rating attempt by same reviewer on same swap returns 409 |
| 4 | avgRating Recalculation | Submitting a rating triggers server-side aggregation and updates `User.avgRating` |

### 3.5 Gemini Flash AI Matching Tests (`gemini_matching_test.js`) — 12 Tests

Tests the hybrid scoring, AI opt-in behaviour, fallback, score bounds, and anti-hallucination guards.

| # | Test Name | What It Verifies |
|---|---|---|
| 1 | Default Mode — No AI Call | `GET /recommendations` without `ai=true` makes zero Gemini API calls |
| 2 | AI Mode Triggered by `?ai=true` | `?ai=true` invokes `geminiMatchingService.rankCandidates` |
| 3 | 70/30 Hybrid Math | `hybridScore = round(trad * 0.70 + sem * 0.30)` formula is exact |
| 4 | Score Bounds 0–100 | Hybrid scores cannot exceed 100 or fall below 0 |
| 5 | Fallback — Missing API Key | Absent `GEMINI_API_KEY` → `isAiEnhanced: false`, deterministic scores returned |
| 6 | Fallback — Gemini Timeout | Simulated timeout → fallback to deterministic; no client error |
| 7 | Fallback — Rate Limit (429) | Simulated 429 → fallback; `meta.isAiEnhanced: false` |
| 8 | Fallback — Malformed JSON | Invalid Gemini JSON response → fallback; no crash |
| 9 | Candidate Isolation | Gemini response `candidateId` verified against actual candidate pool; fabricated IDs rejected |
| 10 | Bounded Candidate Pool | Maximum 20 candidates passed to Gemini in a single prompt |
| 11 | Score Explanation Merge | Deterministic reasons and AI explanations merged without duplication |
| 12 | Zero PII in Prompt | Prompt sent to Gemini contains only skill metadata; no emails, JWTs, or passwords |

---

## 4. Frontend Build Verification

The frontend build serves as a compilation and type-safety check:

```bash
cd client
npm run build
```

A clean build produces `client/dist/` without errors. Build failures typically indicate missing imports, JSX syntax errors, or Vite configuration issues.

---

## 5. What Was Tested vs. Not Tested

| Area | Coverage | Notes |
|---|---|---|
| Recommendation algorithm | ✅ Automated (15 tests) | Full coverage of scoring, alias resolution, false equivalence |
| Meeting service + access control | ✅ Automated (10 tests) | Core logic tested; DB-dependent paths need live Atlas URI |
| Notification service | ✅ Automated (12 tests) | Full pipeline coverage |
| Rating + reputation | ✅ Automated (4 tests) | Core integrity verified |
| Gemini AI matching + fallback | ✅ Automated (12 tests) | All edge cases covered |
| REST API endpoints | Manual testing only | No automated HTTP endpoint tests (no Supertest/Jest HTTP suite) |
| Socket.IO real-time events | Manual testing only | Verified by running the app and observing live behaviour |
| Frontend component tests | None | No unit tests for React components (no Jest/React Testing Library) |
| End-to-end tests | None | No Playwright or Cypress tests implemented |

---

## 6. Known Bugs and Limitations

| Issue | Severity | Status | Notes |
|---|---|---|---|
| No email verification on signup | Medium | By Design (mini-project scope) | Users can register with unverified emails |
| No password reset flow | Medium | Not Implemented | Forgot-password flow is out of scope |
| Meeting tests need live DB | Low | Known | `meeting_test.js` and `notification_test.js` work best with a valid `MONGODB_URI` |
| Render free-tier spin-down | Low | Platform Limitation | First request after inactivity may take 30–60 seconds |
| Single-instance Socket.IO | Low | Architecture Limitation | Does not support multi-process horizontal scaling without a Redis adapter |
| Admin panel absent | Medium | Not Implemented | Portfolio moderation reports stored but not processable without DB access |
| No frontend unit tests | Low | Not Implemented | React components have no automated test coverage |

---

*Testing information verified against test files in `server/test/` and `server/package.json` — October 2026.*

