# SkillSwap

SkillSwap is a full-stack MERN web application that enables users to exchange skills, collaborate, and learn from one another through a community-driven platform.

> 🚧 This project is currently under active development.

---

## 🚀 Tech Stack

### Frontend
- React
- Vite
- CSS

### Backend
- Node.js
- Express.js

### Database
- MongoDB Atlas
- Mongoose

### Authentication
- JWT (Coming Soon)

### Other Tools
- Git & GitHub
- Postman

---

## 📂 Repository Structure

This repo is organized to separate frontend and backend code and to keep documentation in the root.

```
SkillSwap/
│
├── client/          # React frontend (Vite)
├── server/          # Express backend
├── API.md
├── Architecture.md
├── Database.md
├── Design.md
├── Phases.md
├── PRD.md
├── Rules.md
└── README.md
```

If you open the `client` and `server` folders you'll find their respective package.json files, source code, and README for local setup details.

---

## ✨ Planned Features

- User Authentication
- User Profiles
- Skill Listings
- Skill Search & Filters
- Skill Requests
- Real-time Chat
- Video Sessions
- Notifications
- Image Uploads
- Responsive UI

---

## 📌 Current Status

✅ Phase 1 Completed
- Project setup
- React + Vite scaffold
- Express server scaffold
- MongoDB Atlas integration (wiring)
- Environment configuration

🚧 Phase 2 In Progress
- JWT Authentication

---

## ⚙️ Installation (Local Development)

### 1. Clone the repository

```bash
git clone https://github.com/ShaikMahaboobbasha2005/SkillSwap.git
cd SkillSwap
```

### 2. Install dependencies

Frontend

```bash
cd client
npm install
```

Backend

```bash
cd server
npm install
```

> Tip: Keep two terminals (one for client, one for server) while developing.

### 3. Create environment variables

Create a `.env` file inside the `server` folder with at least the following variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

If your frontend needs environment variables (for example, Vite), create a `.env` or `.env.local` inside `client` following Vite's conventions (prefixed with VITE_).

### 4. Run the project

Start the backend (from `server`):

```bash
# from SkillSwap/server
npm run dev
```

Start the frontend (from `client`):

```bash
# from SkillSwap/client
npm run dev
```

Open the app in your browser at the address printed by Vite (usually http://localhost:5173) and ensure the backend is reachable at its configured port (default 5000).

---

## 📅 Development Progress

- ✅ Phase 1 – Project Setup
- ⏳ Phase 2 – Authentication
- ⏳ Phase 3 – User Profiles
- ⏳ Phase 4 – Skills Module
- ⏳ Phase 5 – Requests & Chat
- ⏳ Phase 6 – Deployment

---

## 👨‍💻 Author

**Shaikh Mahaboob Basha**

B.Tech CSE Student | MERN Stack Developer
