# CodeVerse 🚀

> **An Online Code Compiler & Execution Platform for Students and Beginners**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Status: In Development](https://img.shields.io/badge/Status-In%20Development-yellow.svg)]()
[![Languages](https://img.shields.io/badge/Languages-C%20%7C%20C%2B%2B%20%7C%20Python%20%7C%20Java%20%7C%20JavaScript-brightgreen.svg)]()

---

## What is CodeVerse?

**CodeVerse** is a self-hosted, browser-based code compiler designed for students and beginners. Write, compile, and run code in **5 programming languages** directly from your browser — no installations required.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🖊️ **Monaco Editor** | VS Code-quality editor with syntax highlighting and auto-indent |
| ⚡ **5 Languages** | C, C++, Python 3, Java, JavaScript (Node.js) |
| 🐳 **Docker Isolation** | Every execution runs in its own sandboxed container |
| 📡 **Real-Time Output** | Output streams live to the browser via WebSocket |
| 💾 **Snippet Library** | Save, search, and manage your code snippets |
| 🔐 **Authentication** | Email/password + Google OAuth login |
| 🌙 **Dark / Light Mode** | Toggle between themes |
| ⏱️ **Timeout Protection** | Infinite loops are killed automatically after 5 seconds |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Monaco Editor |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL / SQLite |
| **Auth** | JWT + bcrypt + Google OAuth |
| **Real-Time** | Socket.io (WebSockets) |
| **Execution** | Docker |

---

## 🚀 Getting Started

**Prerequisites:** [Node.js v18+](https://nodejs.org/), [Docker](https://www.docker.com/products/docker-desktop/), [Git](https://git-scm.com/)

```bash
# 1. Clone the repo
git clone https://github.com/kashyap52006/CodeVerse.git
cd CodeVerse

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your values

# 3. Start everything
docker-compose up --build
```

Open **http://localhost:5173** in your browser.

---

## 📄 Documentation

Full requirements, use cases, and architecture details are in [`docs/requirements.md`](docs/requirements.md).

---

## 🗺️ Roadmap

- [x] Requirements & Architecture Design
- [ ] Authentication System
- [ ] Monaco Editor Integration
- [ ] Docker Execution Engine
- [ ] Snippet Management Dashboard
- [ ] Real-time WebSocket Output
- [ ] Dark/Light Mode

---

## 📜 License

Licensed under the [MIT License](LICENSE).
