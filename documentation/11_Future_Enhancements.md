# 11 — Future Enhancements

## SkillSwap — Limitations and Potential Improvements

> This document clearly distinguishes **current features** (implemented and working) from **future ideas** (not yet implemented).

---

## 1. Current Limitations

These are genuine limitations of the current implementation:

| Limitation | Impact | Category |
|---|---|---|
| No email verification on signup | Users can create accounts with invalid or others' email addresses | Security |
| No password reset / forgot-password flow | Users who forget their password cannot recover access | UX |
| No admin moderation panel | Portfolio reports are stored but require direct DB access to process | Moderation |
| Single-instance Socket.IO (no Redis adapter) | Cannot scale horizontally across multiple backend servers | Scalability |
| No push notifications (browser/mobile) | Users must be online in the app to receive real-time events | UX |
| No online/offline presence indicators | Cannot see if a swap partner is currently active | UX |
| Free-tier Render spin-down | Backend cold-starts take 30–60 seconds after inactivity | Performance |
| No international language support | App is English-only with no i18n layer | Accessibility |
| No email/SMTP integration | No transactional emails (welcome, notifications, receipts) | Communication |
| No full-text search engine | Discovery search is limited to MongoDB text index; no fuzzy or phonetic search | Search |
| Gemini AI rate limits | Opt-in AI matching is limited by Google Gemini free-tier quota | AI |
| No analytics or usage dashboard (admin) | No visibility into platform-wide usage, top skills, or user growth | Operations |

---

## 2. Security Enhancements

| Enhancement | Priority | Description |
|---|---|---|
| **Email verification** | High | Require users to verify their email before their account becomes fully active (Resend, SendGrid) |
| **Password reset** | High | Token-based forgot-password flow via email link |
| **HttpOnly cookie for JWT** | High | Reduce XSS attack surface by storing JWT in an HttpOnly secure cookie instead of browser memory |
| **Rate limiting** | High | Add `express-rate-limit` on all auth routes (login, signup) and file upload endpoints |
| **HTTP security headers** | Medium | Add `helmet.js` for CSP, X-Frame-Options, HSTS, and other standard headers |
| **Account lockout** | Medium | Temporarily lock account after N consecutive failed login attempts |
| **2FA (Two-Factor Authentication)** | Low | TOTP-based second factor (Google Authenticator) for added account security |
| **Gemini API key rotation** | Medium | Periodic rotation and monitoring of API keys via Google Cloud key management |

---

## 3. UX and Feature Improvements

### 3.1 Missing Core Features

| Feature | Description |
|---|---|
| **Forgot password** | Email-based reset link for lost passwords |
| **Email notifications** | Transactional emails for key events: new swap request, acceptance, meeting reminders |
| **Online/offline presence** | Show a green dot on profiles and chat sidebars when a user is active |
| **Typing indicators** | "User is typing…" in the chat workspace |
| **Message editing** | Allow users to edit their own sent messages (not just delete) |
| **Group skills barter** | Allow 3-party or multi-party skill exchanges, not just bilateral |
| **Skill endorsements** | Peers can endorse each other's skills (similar to LinkedIn endorsements) |
| **Saved/bookmarked profiles** | Save interesting profiles for later review |
| **Scheduling calendar view** | A dedicated calendar showing all upcoming video sessions |

### 3.2 Enhanced Discovery

| Feature | Description |
|---|---|
| **Fuzzy/phonetic search** | Find users even with slight typos (Elasticsearch or MongoDB Atlas Search) |
| **Location-based filtering** | Filter discovery by city or proximity radius |
| **Availability scheduling** | Users mark available time slots; discovery respects timezone and availability |
| **Skill tag clouds** | Visual exploration of popular skills on the platform |

### 3.3 Communication Improvements

| Feature | Description |
|---|---|
| **Message reactions** | React to individual chat messages with emojis |
| **File sharing in chat** | Send images, PDFs, or code files within a conversation |
| **Voice messages** | Record and send short audio clips |
| **Pinned messages** | Pin important messages in a swap conversation |
| **Chat search** | Search message history within a conversation |

---

## 4. Scalability and Performance

| Area | Current State | Recommended Enhancement |
|---|---|---|
| **Socket.IO adapter** | Single-process only | Add Redis adapter (`@socket.io/redis-adapter`) for multi-instance support |
| **Database caching** | No caching layer | Add Redis for frequently-read data (discover results, recommendation scores, notification counts) |
| **Full-text search** | MongoDB native text index | MongoDB Atlas Search or Elasticsearch for production-grade search |
| **CDN for static assets** | Vite build deployed on Vercel CDN | Already addressed; ensure Cloudinary transformations are leveraged for image compression |
| **Database connection pooling** | Mongoose default pool | Tune `maxPoolSize` for higher concurrency |
| **Background job infrastructure** | Custom polling loop (every 30 seconds) | Migrate to a proper job queue (Bull/BullMQ with Redis) for reliability and retry logic |
| **Rate limiting at scale** | Not implemented | Move rate limiting to API gateway or Nginx in front of Express |
| **Pagination cursor-based** | Offset pagination | Switch to cursor/keyset pagination for large datasets to avoid performance degradation |

---

## 5. AI and Matching Enhancements

| Enhancement | Description |
|---|---|
| **Collaborative filtering** | Learn from successful swaps to improve recommendations (users who swapped X also liked Y) |
| **Skill graph** | Build a graph of skill relationships and traverse it for semantic recommendations |
| **Availability-aware matching** | Weight recommendations by schedule overlap |
| **Learning style matching** | Match users by preferred learning format (video, text, project-based) |
| **Multi-language AI analysis** | Analyse skills in regional languages using Gemini's multilingual capabilities |
| **Continuous AI fine-tuning** | Periodically retrain or fine-tune the semantic scoring based on swap success rates |

---

## 6. Platform and Administration

| Enhancement | Description |
|---|---|
| **Admin moderation panel** | Web UI for reviewing reported portfolio items, managing user accounts, and viewing platform analytics |
| **Analytics dashboard (admin)** | Charts for user growth, popular skills, swap completion rates, and AI vs deterministic match distribution |
| **Skill verification badges** | Optional badges for skills verified by completing a standardised test or community endorsement |
| **Community forums** | Discussion threads around skill categories for community building beyond 1-on-1 swaps |
| **Mobile application** | Native iOS and Android apps using React Native for a push-notification-capable mobile experience |
| **Self-hosted Jitsi** | Replace public `meet.jit.si` with a self-hosted Jitsi instance for SLA control and privacy |
| **GDPR compliance** | Data export and account deletion endpoints, privacy policy, and data retention controls |

---

## 7. Portfolio Enhancements

| Enhancement | Description |
|---|---|
| **Video transcoding** | Standardise video format and resolution server-side using Cloudinary transformations |
| **Portfolio visibility controls** | Per-item visibility: public, registered-users-only, or private |
| **Portfolio analytics** | View count, reaction analytics, and profile visit tracking per portfolio item |
| **Embed codes** | Let users embed portfolio items on their personal websites |

---

## Summary: Current vs. Future

```
✅ Currently Implemented
─────────────────────────────────────────────────────────────────────
JWT auth, profiles, Cloudinary uploads, skill management,
discover, deterministic + Gemini AI matching, swap lifecycle,
real-time chat, Jitsi video, notifications, portfolio with
reactions and moderation foundation, ratings + reputation,
dashboard, dark mode, 3D landing page, mobile bottom navigation.

🔮 Future Enhancements (not yet implemented)
─────────────────────────────────────────────────────────────────────
Email verification, password reset, admin panel, Redis adapter,
push notifications, online presence, message editing, group swaps,
fuzzy search, scheduling calendar, mobile app, self-hosted Jitsi,
GDPR tools, collaborative filtering, and analytics.
```

---

*Distinctions between current and future features verified against implemented source code — October 2026.*

