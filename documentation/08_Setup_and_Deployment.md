# 08 — Setup and Deployment Guide

## SkillSwap — Installation, Configuration, and Deployment

---

## 1. Prerequisites

Ensure the following are installed and available before proceeding:

| Requirement | Minimum Version | Check Command |
|---|---|---|
| Node.js | v20.x | `node --version` |
| npm | v10.x | `npm --version` |
| Git | Any recent version | `git --version` |

You also need accounts and credentials for:
- **MongoDB Atlas** — free-tier cluster with a database and connection URI.
- **Cloudinary** — free-tier account with Cloud Name, API Key, and API Secret.
- *(Optional)* **Google Gemini API** — for AI-powered recommendations.

---

## 2. Clone the Repository

```bash
git clone https://github.com/ShaikMahaboobbasha2005/SkillSwap.git
cd SkillSwap
```

The project root contains two application directories:
- `client/` — React frontend (Vite)
- `server/` — Node.js + Express backend

---

## 3. Backend Setup (`server/`)

### 3.1 Install Dependencies

```bash
cd server
npm install
```

This installs all production and development dependencies listed in `server/package.json`, including Express, Mongoose, Socket.IO, Zod, Multer, Cloudinary SDK, bcryptjs, jsonwebtoken, and `@google/genai`.

### 3.2 Configure Environment Variables

Create a `.env` file inside the `server/` directory:

```env
# Server
PORT=5000

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/skillswap?retryWrites=true&w=majority

# Authentication
JWT_SECRET=<your-long-random-secret-string>
JWT_EXPIRES_IN=7d

# CORS — set to your frontend URL in production
CLIENT_URL=http://localhost:5173
# Optional: comma-separated additional allowed CORS origins
# CORS_ORIGINS=https://skillswap.vercel.app,http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>

# Optional: Google Gemini AI (omit to disable AI recommendations)
GEMINI_API_KEY=<your-gemini-api-key>
```

> **Never commit this file.** It is listed in `.gitignore`.

### 3.3 MongoDB Atlas Setup

1. Create a free MongoDB Atlas account at [https://cloud.mongodb.com](https://cloud.mongodb.com).
2. Create a new cluster (free tier M0).
3. Add a database user with read/write permissions.
4. Whitelist your IP address (or `0.0.0.0/0` for development).
5. Get the connection string from the "Connect" menu and substitute `<username>`, `<password>`, and `<cluster>` into `MONGODB_URI`.

### 3.4 Cloudinary Setup

1. Create a free Cloudinary account at [https://cloudinary.com](https://cloudinary.com).
2. From the Dashboard, copy the **Cloud Name**, **API Key**, and **API Secret**.
3. Paste them into the `.env` variables above.

The server automatically creates folders `skillswap/profiles/`, `skillswap/portfolio/images/`, and `skillswap/portfolio/videos/` on first upload.

---

## 4. Frontend Setup (`client/`)

### 4.1 Install Dependencies

```bash
cd ../client
npm install
```

This installs React 19, Vite 8, Tailwind CSS v4, Three.js, Axios, Socket.IO client, React Router DOM v7, and all devDependencies.

### 4.2 Configure Environment Variables

Create a `.env` file inside the `client/` directory:

```env
# Backend API base URL (REST)
VITE_API_URL=http://localhost:5000/api

# Optional: Override Socket.IO connection URL
# If omitted, derived from VITE_API_URL origin (http://localhost:5000)
# VITE_SOCKET_URL=http://localhost:5000
```

> Environment variables must be prefixed with `VITE_` to be accessible in the browser build.

---

## 5. Running in Development

Open **two terminal windows**:

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```
Uses `nodemon` to watch `src/server.js`. Auto-reloads on file changes.  
Expected output: `🚀 Server running on port 5000` and `✅ MongoDB Atlas Connected`.

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```
Vite starts the development server.  
Expected output: `Local: http://localhost:5173/`

Open `http://localhost:5173` in your browser.

---

## 6. Available npm Scripts

### Server (`server/package.json`)

| Script | Command | Description |
|---|---|---|
| `start` | `node src/server.js` | Production start (no auto-reload) |
| `dev` | `nodemon src/server.js` | Development start with auto-reload |

### Client (`client/package.json`)

| Script | Command | Description |
|---|---|---|
| `dev` | `vite` | Start Vite development server |
| `build` | `vite build` | Create production build in `dist/` |
| `preview` | `vite preview` | Preview production build locally |
| `lint` | `eslint .` | Run ESLint on the codebase |

---

## 7. Production Build (Frontend)

```bash
cd client
npm run build
```

Vite compiles and bundles the React app into `client/dist/`. This directory is deployed to Vercel.

To preview the production build locally:
```bash
npm run preview
# Serves at http://localhost:4173
```

---

## 8. Deployment

### Frontend — Vercel

1. Push the repository to GitHub.
2. Create a new project on [Vercel](https://vercel.com) and import the repository.
3. Set the **Root Directory** to `client`.
4. Set the **Build Command** to `npm run build`.
5. Set the **Output Directory** to `dist`.
6. Add the environment variable:
   - `VITE_API_URL` = `https://<your-render-backend-url>/api`
7. Ensure `client/vercel.json` is present to handle SPA client-side routing on page refreshes.
8. Deploy.

Vercel handles CDN, HTTPS, and auto-deploy on every `git push` to the main branch.

### Backend — Render

1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your GitHub repository.
3. Set the **Root Directory** to `server`.
4. Set the **Build Command** to `npm install`.
5. Set the **Start Command** to `npm start`.
6. Add all required environment variables from section 3.2 in Render's Environment panel (substitute the production MongoDB URI and Cloudinary credentials).
7. Set `CLIENT_URL` to the deployed Vercel frontend URL.
8. Deploy.

> **Render free-tier note:** Free-tier Render services spin down after 15 minutes of inactivity. The first request after a spin-down takes 30–60 seconds to respond. This is a free-tier limitation — not a code issue.

---

## 9. Running Backend Tests

The test files do not require a running server — they use in-memory mock handlers.

```bash
cd server

# Recommendation engine and skill normalization (15 tests)
node test/recommendation_test.js

# Video meetings and scheduling authorization (10 tests)
node test/meeting_test.js

# Notification center and real-time dispatch (12 tests)
node test/notification_test.js

# Rating and swap association integrity (4 tests)
node test/rating_swap_association_test.js

# Gemini Flash AI matching and fallback (12 tests)
node test/gemini_matching_test.js
```

---

## 10. Common Errors and Troubleshooting

| Error | Likely Cause | Fix |
|---|---|---|
| `MongoDB Connection Failed` | Incorrect `MONGODB_URI`, IP not whitelisted, or cluster paused | Verify Atlas credentials, whitelist current IP, check cluster status |
| `Cloudinary is not configured on the server` | Missing or placeholder Cloudinary env vars | Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` in `server/.env` |
| `Access denied. No token provided` | Missing `Authorization: Bearer <token>` header | Ensure the frontend is sending the JWT from `AuthContext` |
| `Invalid token` | JWT_SECRET mismatch between when the token was signed and the current server | Restart server after changing `JWT_SECRET`; existing tokens will need re-login |
| `CORS error` in browser | `CLIENT_URL` doesn't match the frontend origin | Set `CLIENT_URL` to the exact URL (including protocol and port) of the React app |
| Frontend shows blank page | Vite `.env` vars not prefixed with `VITE_` | Rename all frontend env vars to start with `VITE_`; rebuild |
| Vite build fails | Missing dependencies | Run `npm install` inside `client/` |
| Socket connection fails | Backend not running, or wrong `VITE_SOCKET_URL` | Ensure backend is running; verify `VITE_API_URL` points to the correct server URL |
| `Port 5000 already in use` | Another process is on port 5000 | Change `PORT` in `server/.env` to `5001` or kill the conflicting process |
| `Token has expired` | JWT has passed its expiry time | Log out and log in again; or increase `JWT_EXPIRES_IN` in `server/.env` |
| Video call doesn't open | Jitsi blocked by browser or ad-blocker | Allow scripts from `meet.jit.si`; disable ad-blocker for the app |

---

*Setup guide verified against `server/package.json` and `client/package.json` — October 2026.*

