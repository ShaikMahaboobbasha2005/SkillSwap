# 🚀 SkillSwap

A modern full-stack skill exchange platform where users can teach what they know and learn from others through structured skill swap requests.

## Overview

SkillSwap connects people who want to exchange skills instead of paying for courses. Users can showcase their skills, discover other members, send swap requests, manage ongoing exchanges, and build a learning community. 🤝✨

---

## Features ✨

### User Authentication 🔐
- JWT Authentication 🛡️
- Secure Login & Registration 🔑
- Protected Routes 🚧
- User Profiles 👥

### Profile Management 👤
- Edit Profile ✍️
- Profile Photo 📸
- Banner Image 🖼️
- Bio & Location 📍
- Skills Summary 🧾
- Profile Statistics 📊

### Skills 🧠
- Add Skills Offered ➕
- Add Skills Wanted 🔎
- Skill Categories 🗂️
- Experience Levels 📈
- Active / Inactive Skills ⚪⚫
- Duplicate Skill Prevention 🚫

### Discover 🔍
- Search Users 🔎
- Filter Skills 🧰
- Public Profiles 🌐
- Request Skill Swap 🔁

### Skill Swap Workflow 🔄
- Send Swap Requests ✉️
- Incoming Requests 📥
- Outgoing Requests 📤
- Accept Requests ✅
- Reject Requests ❌
- Cancel Requests 🛑
- Dashboard Statistics 📈
- Duplicate Swap Prevention ⚠️
- Notification Badges 🔔

---

## Tech Stack 🛠️

### Frontend ⚛️
- React
- Vite
- Tailwind CSS
- Axios
- React Router

### Backend 🧩
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Zod Validation

---

## Project Structure 📁

```
SkillSwap/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── utils/
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── validations/
│   └── utils/
│
├── README.md
└── package.json
```

---

## Installation 🧭

### Clone Repository

```bash
git clone https://github.com/<your-username>/SkillSwap.git
```

### Navigate

```bash
cd SkillSwap
```

### Install Dependencies

Backend

```bash
cd server
npm install
```

Frontend

```bash
cd ../client
npm install
```

---

## Environment Variables 🔑

### Server (.env)

```env
PORT=5000

MONGO_URI=your_mongodb_connection

JWT_SECRET=your_secret_key

CLIENT_URL=http://localhost:5173
```

### Client (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Running the Project ▶️

Backend

```bash
cd server
npm run dev
```

Frontend

```bash
cd client
npm run dev
```

Open

```
http://localhost:5173
```

---

## Current Development Status 📅

### Completed ✅

- User Authentication 🔐
- Profile Management 👤
- Skills Management 🧠
- Discover Page 🔍
- Public Profiles 🌐
- Skill Swap Request Creation ✉️
- Skill Swap Dashboard 📊
- Swap Request Management 🔁
- Profile UI Refinements 🎨

### Upcoming ⏳

- Portfolio 🗂️
- Ratings & Reviews ⭐
- Chat System 💬
- Notifications 🔔
- Admin Panel 🛠️

---

## API Highlights 🔌

### Authentication

- Login
- Register
- Get Current User

### Skills

- Create Skill
- Update Skill
- Delete Skill
- Search Skills

### Swaps

- Create Swap
- Incoming Requests
- Outgoing Requests
- Accept Request
- Reject Request
- Cancel Request
- Dashboard Statistics

---

## Security 🔒

- JWT Authentication 🛡️
- Protected Routes 🚧
- Request Validation using Zod ✅
- Ownership Verification 👤
- Duplicate Skill Prevention 🚫
- Duplicate Swap Prevention ⚠️
- Input Sanitization 🧹

---

## Future Enhancements 🚀

- Real-time Chat 💬
- Portfolio Showcase 🖼️
- Reviews & Ratings ⭐
- Email Notifications 📧
- Skill Recommendations 🤖
- Admin Dashboard 🧑‍💼

---

## License 📄

This project is licensed under the MIT License.

---

## Author 🧑‍💻

**Shaikh Mahaboob Basha**

GitHub: https://github.com/<your-username>
