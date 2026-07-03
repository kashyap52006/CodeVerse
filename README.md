# CodeVerse 🚀

> **An Online Code Compiler & Execution Platform for Students and Beginners**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Status: In Development](https://img.shields.io/badge/Status-In%20Development-yellow.svg)]()
[![Languages](https://img.shields.io/badge/Languages-C%20%7C%20C%2B%2B%20%7C%20Python%20%7C%20Java%20%7C%20JavaScript-brightgreen.svg)]()

---

## 📖 What is CodeVerse?

**CodeVerse** is a self-hosted, browser-based code compiler and execution platform designed for students, beginners, and small classrooms. It lets you write, compile, and run code in **5 programming languages** directly from your browser — no installations required.

Think of it as your personal, private version of platforms like Replit or JDoodle, but fully under your control.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🖊️ **Monaco Editor** | VS Code-quality editor with syntax highlighting, line numbers, and auto-indent |
| ⚡ **5 Languages** | C, C++, Python 3, Java, JavaScript (Node.js) |
| 🐳 **Docker Isolation** | Every execution runs in its own sandboxed container — safe and secure |
| 📡 **Real-Time Output** | Output streams live to your browser via WebSocket |
| 💾 **Snippet Library** | Save, search, and manage your code snippets |
| 🔐 **Authentication** | Email/password + Google OAuth login |
| 🌙 **Dark / Light Mode** | Toggle between themes; preference is remembered |
| 📋 **Execution History** | View your last 10 code runs |
| ⏱️ **Timeout Protection** | Infinite loops are killed automatically after 5 seconds |

---

## 🗂️ Project Structure

```
codeverse/
├── client/               # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Auth, Compiler, Dashboard, Profile
│   │   └── styles/       # Global CSS, themes
│   └── index.html
│
├── server/               # Backend (Node.js + Express)
│   ├── src/
│   │   ├── routes/       # API route handlers
│   │   ├── services/     # Business logic (auth, execution, snippets)
│   │   ├── middleware/   # Auth, rate limiting, validation
│   │   └── prisma/       # Database schema and migrations
│   └── index.js
│
├── docker/               # Docker configurations for execution
│   ├── c/
│   ├── cpp/
│   ├── python/
│   ├── java/
│   └── javascript/
│
├── docs/                 # Project documentation
│   └── requirements.md   # Full Software Requirements Specification
│
├── docker-compose.yml    # One-command startup for all services
├── .env.example          # Environment variable template
└── README.md
```

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Monaco Editor |
| **Styling** | Vanilla CSS (custom design system) |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL (prod) / SQLite (dev) |
| **ORM** | Prisma |
| **Auth** | JWT + bcrypt + Passport.js (Google OAuth) |
| **Real-Time** | Socket.io (WebSockets) |
| **Execution** | Docker (via dockerode) |
| **Email** | Nodemailer + SMTP |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:
- [Node.js](https://nodejs.org/) v18 or higher
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/codeverse.git
cd codeverse
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/codeverse"

# JWT
JWT_SECRET="your-super-secret-key-min-32-chars"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your@email.com"
SMTP_PASS="your-app-password"
```

### 3. Start with Docker Compose

```bash
docker-compose up --build
```

This starts the frontend, backend, and database together.

### 4. Open in Browser

```
http://localhost:5173
```

---

## 📋 Pages

| Page | Route | Description |
|---|---|---|
| **Authentication** | `/auth` | Login, Register, Google OAuth, Password Reset |
| **Compiler** | `/compiler` | Monaco editor + execution console |
| **Dashboard** | `/dashboard` | Snippet library + execution history |
| **Profile** | `/profile` | Account settings, change password |

---

## 🔒 Security

- All passwords hashed with **bcrypt** (cost factor 12)
- JWT stored in **HTTP-only cookies** (XSS-safe)
- Code executes in **isolated Docker containers** with:
  - No network access
  - No host filesystem access
  - 128 MB RAM limit
  - 0.5 CPU core limit
  - 5-second execution timeout
- API rate limiting: **10 requests/minute** per user
- Input validation on all endpoints

---

## 📄 Documentation

Full project documentation is available in the [`docs/`](docs/) folder:

- 📋 [Requirements Specification](docs/requirements.md) — Full SRS document with personas, use cases, functional & non-functional requirements, risk analysis, and timeline.

---

## 🗺️ Roadmap

### v1.0 (Current)
- [x] Requirements & Architecture Design
- [ ] Authentication System
- [ ] Monaco Editor Integration
- [ ] Docker Execution Engine
- [ ] Snippet Management Dashboard
- [ ] Real-time WebSocket Output
- [ ] Dark/Light Mode

### v2.0 (Future)
- [ ] Code templates library
- [ ] Additional languages (Go, Rust)
- [ ] Collaborative code sharing
- [ ] AI code assistance

---

## 🤝 Contributing

This is currently a personal/educational project. Contributions, suggestions, and feedback are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push and open a Pull Request

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

## 👤 Author

Built with ❤️ as an educational project.

> *"The best way to learn programming is to write programs."* — Dennis Ritchie
