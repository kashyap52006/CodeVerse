# CodeVerse — System Architecture Document

> **Document Version:** 1.0.0
> **Date:** July 3, 2026
> **Status:** Approved
> **Audience:** Developers, Students, Technical Reviewers

---

## Table of Contents

1. [High-Level Architecture](#1-high-level-architecture)
2. [Why Layered Architecture](#2-why-layered-architecture)
3. [Technology Stack Justification](#3-technology-stack-justification)
4. [Data Flow Architecture](#4-data-flow-architecture)
5. [Component Responsibilities](#5-component-responsibilities)
6. [Security Architecture](#6-security-architecture)
7. [Scalability Roadmap](#7-scalability-roadmap)
8. [Trade-Off Analysis](#8-trade-off-analysis)
9. [Deployment Architecture](#9-deployment-architecture)
10. [Potential Pain Points & Solutions](#10-potential-pain-points--solutions)

---

## 1. High-Level Architecture

CodeVerse is built on a **4-layer architecture**. Each layer has one clear job and communicates only with its immediate neighbours. This separation makes the system easier to build, test, debug, and scale.

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                           │
│                                                                 │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │              PRESENTATION LAYER                          │  │
│   │           React 18 + Vite + TypeScript                   │  │
│   │                                                          │  │
│   │  ┌────────────┐  ┌──────────────┐  ┌─────────────────┐  │  │
│   │  │ Auth Page  │  │ Compiler Page│  │  Dashboard Page │  │  │
│   │  │ (Login /   │  │ Monaco Editor│  │  Snippets +     │  │  │
│   │  │  Register) │  │ + Console    │  │  History        │  │  │
│   │  └────────────┘  └──────────────┘  └─────────────────┘  │  │
│   └──────────────────────────────────────────────────────────┘  │
│         │  HTTP (REST)                  │  WebSocket            │
│         │  Axios                        │  Socket.io            │
└─────────┼──────────────────────────────┼─────────────────────-─┘
          │                              │
          ▼                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API LAYER                                │
│                   NestJS + TypeScript                           │
│                                                                 │
│  ┌──────────────┐ ┌───────────────┐ ┌────────────────────────┐  │
│  │ Auth Module  │ │ Snippet Module│ │  Execution Module      │  │
│  │ JWT / OAuth  │ │ CRUD + Search │ │  Docker Orchestrator   │  │
│  └──────────────┘ └───────────────┘ └───────────┬────────────┘  │
│         │                │                      │              │
└─────────┼────────────────┼──────────────────────┼──────────────┘
          │                │                      │
          ▼                ▼                      ▼
┌──────────────────────┐       ┌───────────────────────────────────┐
│     DATA LAYER       │       │        EXECUTION LAYER            │
│  PostgreSQL + Prisma │       │           Docker Engine           │
│                      │       │                                   │
│  ┌────────────────┐  │       │  ┌──────┐ ┌──────┐ ┌──────────┐  │
│  │ users          │  │       │  │  C   │ │  C++ │ │  Python  │  │
│  │ snippets       │  │       │  │ box  │ │ box  │ │   box    │  │
│  │ exec_history   │  │       │  └──────┘ └──────┘ └──────────┘  │
│  └────────────────┘  │       │  ┌──────┐ ┌──────────────────┐   │
└──────────────────────┘       │  │ Java │ │   JavaScript     │   │
                               │  │ box  │ │      box         │   │
                               │  └──────┘ └──────────────────┘   │
                               └───────────────────────────────────┘
```

### Communication Protocols at a Glance

| From | To | Protocol | Purpose |
|---|---|---|---|
| Browser | React | — | Renders the UI |
| React | NestJS | HTTP / REST (Axios) | Auth, CRUD, snippet management |
| React | NestJS | WebSocket (Socket.io) | Real-time execution output |
| NestJS | PostgreSQL | TCP via Prisma | Read/write persistent data |
| NestJS | Docker Engine | Unix socket (dockerode) | Spawn/kill execution containers |

---

## 2. Why Layered Architecture

Layered architecture (also called **N-tier architecture**) is the standard approach for web applications. Each layer is independent — a change in one layer does not break another.

### Presentation Layer — React + Vite

**What it does:**
- Renders the entire user interface in the browser
- Manages client-side state (editor content, theme, auth status)
- Communicates with the backend via HTTP and WebSocket

**Why React:**
- Component-based — UI is built from small, reusable pieces
- Huge ecosystem — Monaco Editor, Socket.io client, routing all have React support
- Beginner-friendly — the most popular frontend framework; help is easy to find
- Hooks API — clean state management without complex patterns

**Why Vite:**
- Hot Module Replacement (HMR) in under 100ms — changes appear in the browser instantly
- Native ES modules — no bundling overhead during development
- Simple configuration — works out of the box with React + TypeScript
- Much faster than Create React App (webpack-based)

---

### API Layer — NestJS

**What it does:**
- Receives and validates all HTTP requests
- Implements all business logic (auth, snippets, execution)
- Authenticates and authorises users
- Orchestrates Docker container creation and destruction
- Streams execution output to the frontend via WebSocket

**Why NestJS over plain Express:**

| | Express | NestJS |
|---|---|---|
| Structure | You decide everything | Enforced modules, controllers, services |
| TypeScript | Possible but manual | First-class, built-in |
| Dependency Injection | Manual | Built-in (like Spring/Angular) |
| Testing | Manual setup | Built-in test utilities |
| Learning value | Low structure | Matches enterprise patterns |

NestJS forces you to organise code properly from day one — you learn habits that apply to real-world jobs.

**Why TypeScript:**
- Catches type errors at compile time — not at runtime
- IDE gives auto-complete on every variable and function
- Prisma generates TypeScript types from the database schema — the whole stack is type-safe end to end
- Fewer bugs, faster debugging

---

### Data Layer — PostgreSQL + Prisma

**What it does:**
- Stores all persistent data: users, snippets, execution history
- Enforces relationships and constraints (a snippet must belong to a user)
- Provides ACID-compliant transactions — data is never partially written

**Why PostgreSQL:**
- **ACID compliance** — Atomicity, Consistency, Isolation, Durability. If the server crashes mid-write, data is not corrupted.
- **Relational model** — snippets belong to users; execution history belongs to snippets. This fits naturally in tables with foreign keys.
- **Open-source** — free, battle-tested, used by companies worldwide
- **JSON support** — can store semi-structured data if needed later

**Why Prisma ORM:**
- Define your database schema in one `schema.prisma` file
- Run `prisma migrate` to apply changes — no manual SQL
- Every query returns TypeScript types automatically — no type mismatches
- Readable query API: `prisma.snippet.findMany({ where: { userId } })`

---

### Execution Layer — Docker

**What it does:**
- Receives code + language from NestJS
- Spins up a fresh, isolated container for each execution
- Compiles and runs the code inside the container
- Returns stdout and stderr to NestJS
- Destroys the container after execution

**Why Docker:**
- **Security** — code runs in a completely isolated environment, unable to touch the host system
- **Consistency** — the same GCC version, Python version, JDK version on every machine
- **Resource control** — set exact CPU, RAM, and time limits per container
- **Disposability** — containers are ephemeral; each run starts clean

---

## 3. Technology Stack Justification

### Frontend

| Technology | Version | Why Chosen |
|---|---|---|
| **React** | 18 | Component model, hooks, largest ecosystem |
| **Vite** | 5.x | Sub-100ms HMR, modern ES module tooling |
| **TypeScript** | 5.x | Type safety, IDE support, catches bugs at compile time |
| **Monaco Editor** | latest | Professional editor (same as VS Code), syntax highlighting for all 5 languages |
| **Axios** | 1.x | Clean HTTP client, interceptors for JWT injection |
| **Socket.io Client** | 4.x | WebSocket with automatic reconnection, event-based API |
| **TailwindCSS** | 3.x | Utility-first CSS, responsive design without writing custom CSS |
| **React Router** | 6.x | Client-side routing between Auth, Compiler, Dashboard pages |

---

### Backend

| Technology | Version | Why Chosen |
|---|---|---|
| **NestJS** | 10.x | TypeScript framework, enforced structure, dependency injection |
| **PostgreSQL** | 16.x | ACID compliance, relational data, open-source |
| **Prisma ORM** | 5.x | Type-safe queries, auto-migrations, generated TypeScript types |
| **JWT** | — | Stateless auth tokens, no server-side session storage required |
| **bcrypt** | — | Industry-standard password hashing (cost factor 12) |
| **Passport.js** | — | Google OAuth 2.0 integration |
| **Socket.io Server** | 4.x | WebSocket server, pairs with the client library |
| **dockerode** | 4.x | Node.js Docker SDK — programmatic container management |
| **class-validator** | — | NestJS-native request validation with decorators |

---

### Why NOT These Alternatives

| Alternative | Rejected Because |
|---|---|
| **MongoDB** | CodeVerse data is relational (users → snippets → history). MongoDB's flexibility is unnecessary and loses ACID guarantees. |
| **SQLite** | Single-file, not designed for concurrent multi-user access. Acceptable for local dev only. |
| **Express** | Works but provides no structure — you invent your own patterns. NestJS enforces good habits from day one. |
| **HTTP Polling** | Polling the server every second for output is inefficient, adds latency, and wastes bandwidth. WebSocket pushes data the moment it arrives. |
| **Kubernetes** | Designed for thousands of containers across multiple machines. Complete overkill for 5–10 users. Adds weeks of setup complexity. |
| **gRPC** | Binary protocol designed for microservice-to-microservice calls. Unnecessarily complex when HTTP + WebSocket covers all use cases here. |
| **Vue / Angular** | Both are good frameworks, but React has the largest ecosystem and most learning resources — best choice for a student project. |

---

## 4. Data Flow Architecture

### 4.1 — User Registration & Login

```
User                  React               NestJS              PostgreSQL
 │                      │                    │                     │
 │── fills form ───────►│                    │                     │
 │                      │── POST /auth/reg ──►│                     │
 │                      │                    │── validate email ───►│
 │                      │                    │◄── email unique ─────│
 │                      │                    │── hash password      │
 │                      │                    │── INSERT user ──────►│
 │                      │                    │◄── user record ──────│
 │                      │                    │── sign JWT           │
 │                      │◄── 201 + JWT ──────│                     │
 │◄── redirect to /app ─│                    │                     │
```

**Key points:**
1. Password is hashed with bcrypt before any database write.
2. JWT is returned in an HTTP-only cookie — JavaScript cannot read it, preventing XSS theft.
3. All subsequent API requests automatically include the JWT cookie.

---

### 4.2 — Google OAuth Login

```
User           React          NestJS          Google OAuth         PostgreSQL
 │               │               │                  │                   │
 │─ clicks ──────►               │                  │                   │
 │  "Google"     │── redirect ──►│                  │                   │
 │               │               │── redirect ─────►│                   │
 │◄──────────────────────────────────── consent page│                   │
 │── approves ───────────────────────────────────── │                   │
 │               │               │◄── auth code ────│                   │
 │               │               │── exchange code  │                   │
 │               │               │◄── profile data ─│                   │
 │               │               │── upsert user ──────────────────────►│
 │               │               │◄── user record ─────────────────────-│
 │               │               │── sign JWT       │                   │
 │               │◄── JWT ───────│                  │                   │
 │◄─ redirect ───│               │                  │                   │
```

---

### 4.3 — Code Execution Flow

```
User         React (Editor)      NestJS (API)        Docker           PostgreSQL
 │                │                   │                  │                 │
 │─ clicks Run ──►│                   │                  │                 │
 │                │── POST /execute ──►│                  │                 │
 │                │   {code, lang,    │── pull image ───►│                 │
 │                │    stdin, token}  │── create container►               │
 │                │                   │── copy code in ──►│                 │
 │                │                   │── docker start ──►│                 │
 │                │                   │                  │── compile       │
 │                │                   │                  │── execute       │
 │                │◄─ WS: stdout ─────│◄── stream out ───│                 │
 │◄─ output shown─│                   │                  │                 │
 │                │◄─ WS: stderr ─────│◄── stream err ───│                 │
 │◄─ errors shown─│                   │                  │                 │
 │                │◄─ WS: done ───────│◄── exit(0) ──────│                 │
 │                │                   │── destroy container►              │
 │                │                   │── save history ──────────────────►│
 │                │                   │◄── saved ────────────────────────-│
```

**Key points:**
1. The `POST /execute` call authenticates the user via JWT before touching Docker.
2. Output streams via WebSocket — the user sees it as it is printed, not after the program finishes.
3. A timeout watchdog kills the container if execution exceeds 5 seconds.
4. The container is destroyed after every run — nothing persists between executions.
5. Execution metadata is saved to PostgreSQL for the history view.

---

### 4.4 — Snippet Auto-Save Flow

```
User (typing)     React                 NestJS              PostgreSQL
      │             │                       │                    │
      │── types ───►│                       │                    │
      │             │ (30s timer running)   │                    │
      │             │── PUT /snippets/:id ──►│                    │
      │             │   {code, language}    │── UPDATE snippet ─►│
      │             │                       │◄── updated ────────│
      │             │◄── 200 OK ────────────│                    │
      │◄─ "Saved" ──│                       │                    │
```

---

## 5. Component Responsibilities

### React Frontend — What It Owns

| Responsibility | Detail |
|---|---|
| Render UI | All visible components — editor, consoles, nav, forms |
| Editor State | Current code, selected language, input console content |
| Auth State | Whether user is logged in; stored token |
| WebSocket Connection | Connect on mount, disconnect on leave, handle events |
| Error Display | Show user-friendly messages from API error responses |
| Theme | Dark/light mode toggle, stored in localStorage |
| Auto-Save Timer | 30-second interval that fires `PUT /snippets/:id` |

**What React does NOT own:**
- Business logic (no execution decisions happen in React)
- Auth validation (JWT validation happens only in NestJS)
- Database queries (React never touches the DB)

---

### NestJS Backend — What It Owns

| Responsibility | Detail |
|---|---|
| Request Validation | Reject malformed requests before they reach business logic |
| Authentication | Verify JWT on every protected route |
| Authorisation | Confirm user owns the snippet they are trying to access |
| Business Logic | Registration, login, snippet CRUD, execution lifecycle |
| Docker Orchestration | Create container → inject code → stream output → destroy |
| WebSocket Events | Emit `stdout`, `stderr`, `done`, `error` events to the client |
| Rate Limiting | Reject users who exceed 10 execution requests per minute |

---

### PostgreSQL — What It Owns

| Table | Stores |
|---|---|
| `users` | id, name, email, passwordHash, googleId, createdAt |
| `snippets` | id, userId, title, language, code, updatedAt |
| `execution_history` | id, userId, snippetId, language, stdout, stderr, exitCode, executedAt |

**Relationships:**
```
users ──< snippets ──< execution_history
  (one user has many snippets, one snippet has many runs)
```

---

### Docker — What It Owns

| Responsibility | Detail |
|---|---|
| Language Runtime | Each language image contains the correct compiler/interpreter |
| Isolation | No network, no host filesystem, no root privileges |
| Resource Limits | 128 MB RAM, 0.5 CPU cores, 5-second timeout |
| Code Execution | Compile (if needed) then run, capture stdout + stderr |
| Cleanup | Container destroyed immediately after run completes |

**Pre-pulled Docker Images:**

| Language | Base Image |
|---|---|
| C / C++ | `gcc:latest` |
| Python | `python:3.11-slim` |
| Java | `openjdk:17-slim` |
| JavaScript | `node:20-slim` |

---

## 6. Security Architecture

### Authentication Security

| Mechanism | Implementation | Purpose |
|---|---|---|
| Password hashing | bcrypt, cost factor 12 | Plaintext passwords never stored |
| JWT signing | HS256, 256-bit secret | Tokens cannot be forged |
| JWT storage | HTTP-only cookie | JavaScript (XSS) cannot read the token |
| JWT expiry | 24 hours | Stolen tokens expire quickly |
| OAuth delegation | Google OAuth 2.0 | No password needed for Google login |
| Password reset | Time-limited token (1 hour, single-use) | Prevents replay attacks |

---

### Authorisation Security

```
Every protected endpoint:

Request arrives
    │
    ▼
[Guard] Is JWT present and valid?
    │ No  ──► 401 Unauthorized
    │ Yes
    ▼
[Guard] Does the resource belong to this user?
    │ No  ──► 403 Forbidden
    │ Yes
    ▼
[Controller] Process request
```

- Every snippet query includes `WHERE userId = :currentUserId`
- Users can never read, edit, or delete another user's data
- Admin endpoints are guarded by a separate role check

---

### Code Execution Security

```
Submitted code
      │
      ▼
[NestJS] Validate: size < 64KB, user is authenticated, rate limit OK
      │
      ▼
[Docker] Create container with:
      ├── Network: NONE (--network none)
      ├── User: non-root (--user 1000:1000)
      ├── Memory: 128MB limit (--memory 128m)
      ├── CPU: 0.5 cores (--cpus 0.5)
      ├── Read-only filesystem (--read-only)
      ├── No capabilities (--cap-drop ALL)
      └── Tmp writable at /tmp only (--tmpfs /tmp:size=10m)
      │
      ▼
[Watchdog Timer] If execution > 5 seconds → SIGKILL container
      │
      ▼
[NestJS] Capture output → destroy container → return result
```

**What a malicious user cannot do:**
- Read files from the host system (no volume mounts)
- Make network requests (no network access)
- Fork-bomb the server (CPU and memory capped)
- Run forever (5-second hard kill)
- Escalate privileges (runs as non-root, all capabilities dropped)

---

### API Security

| Protection | Implementation |
|---|---|
| Input validation | `class-validator` decorators on every DTO |
| SQL injection | Prisma uses parameterised queries — no raw SQL interpolation |
| Rate limiting | `@nestjs/throttler` — 10 execution requests per minute per user |
| Security headers | `helmet` middleware — sets CSP, X-Frame-Options, etc. |
| CORS | Configured to allow only the frontend origin |
| Secrets | All secrets in `.env` — never committed to version control |

---

## 7. Scalability Roadmap

### Current — 5 to 10 Users

```
[ Browser ] ──► [ NestJS ] ──► [ PostgreSQL ]
                    │
                    └──► [ Docker (same machine) ]
```

- Single server handles everything
- Docker runs on the same machine as NestJS
- Sufficient for a classroom or study group

---

### Next — Up to 50 Users

```
[ Browser ] ──► [ NestJS ] ──► [ PostgreSQL ]
                    │               │
                    │           [ Redis Cache ]
                    │
                    └──► [ Message Queue (Bull) ]
                                    │
                                    └──► [ Execution Node (separate machine) ]
```

**Changes required:**
- **Redis** — Cache frequent queries (user profile, snippet list); reduce DB load
- **Bull queue** — Decouple execution requests from the API; NestJS pushes jobs, the execution node pulls them
- **Separate execution server** — Move Docker to its own machine to protect the API from resource spikes

---

### Future — 100+ Users

```
         [ CDN: Static Assets ]
                  │
[ Browser ] ──► [ Nginx Load Balancer ]
                  │         │
            [ NestJS 1 ] [ NestJS 2 ]
                  │         │
            [ PostgreSQL Primary ]
                  │
            [ PostgreSQL Replica ]
                  │
            [ Redis Cluster ]
                  │
       [ Execution Node Pool ]
         node-1  node-2  node-3
```

**Changes required:**
- **Nginx** — Load balancer distributes traffic across multiple NestJS instances
- **DB replication** — Primary for writes, replica for reads
- **Execution node pool** — Multiple dedicated machines running Docker workloads
- **CDN** — Serve static frontend files from edge nodes (faster globally)

> **Important:** Do not build for 100 users now. Build for 10. The architecture is designed to grow, but premature scaling is wasted effort.

---

## 8. Trade-Off Analysis

### Decision 1: PostgreSQL + Prisma vs. MongoDB

| | PostgreSQL + Prisma | MongoDB |
|---|---|---|
| Data model | Relational (tables + foreign keys) | Document (flexible JSON) |
| ACID | ✅ Full ACID | ⚠️ Limited |
| Type safety | ✅ Prisma generates types | Manual |
| Schema | Defined, enforced | Flexible (can be a problem) |
| Best for | Structured, relational data | Unstructured, rapidly changing data |
| **Verdict** | ✅ **Chosen** | ❌ Rejected |

**Reason:** Users, snippets, and execution history have clear relationships. ACID compliance ensures data integrity. Prisma makes the type-safe queries easy.

---

### Decision 2: WebSocket (Socket.io) vs. HTTP Polling

| | WebSocket | HTTP Polling |
|---|---|---|
| Latency | < 50ms | 500ms–2s |
| Server load | Low (persistent connection) | High (repeated requests) |
| Real-time feel | ✅ True real-time | ⚠️ Simulated |
| Debugging | Harder | Easier |
| Complexity | Higher | Lower |
| **Verdict** | ✅ **Chosen** | ❌ Rejected |

**Reason:** Users need to see output as it prints. A Python `print` inside a loop should appear line by line. Polling cannot do this. The debugging complexity is worth the UX improvement.

---

### Decision 3: Docker vs. Direct Execution (subprocess)

| | Docker Containers | Direct subprocess (child_process) |
|---|---|---|
| Isolation | ✅ Complete | ❌ None |
| Security | ✅ Sandboxed | ❌ Full host access |
| Resource limits | ✅ CPU + RAM enforced | ⚠️ Manual, unreliable |
| Consistency | ✅ Same environment always | ❌ Depends on host |
| Complexity | Higher | Lower |
| **Verdict** | ✅ **Chosen** | ❌ Rejected |

**Reason:** Running user-submitted code directly on the host is a severe security risk. A single malicious script could read, delete, or corrupt host files. Docker is non-negotiable.

---

### Decision 4: NestJS vs. Express

| | NestJS | Express |
|---|---|---|
| Structure | ✅ Enforced (modules, controllers, services) | You decide |
| TypeScript | ✅ First-class | Manual setup |
| Dependency injection | ✅ Built-in | Manual |
| Testing | ✅ Built-in utilities | Manual |
| Learning curve | Higher | Lower |
| Real-world relevance | ✅ High (used in industry) | Moderate |
| **Verdict** | ✅ **Chosen** | ❌ Rejected |

**Reason:** NestJS teaches patterns (DI, modules, guards, interceptors) used in real enterprise codebases. Express is simpler but teaches fewer transferable skills.

---

## 9. Deployment Architecture

### Local Development

```
┌─────────────────────────────────────────────┐
│              docker-compose.yml             │
│                                             │
│  ┌───────────────┐   ┌────────────────────┐ │
│  │ react-dev     │   │ nestjs-dev         │ │
│  │ Vite HMR      │   │ ts-node + watch    │ │
│  │ port: 5173    │   │ port: 3001         │ │
│  └───────────────┘   └────────────────────┘ │
│                                             │
│  ┌───────────────┐                          │
│  │ postgres      │                          │
│  │ port: 5432    │                          │
│  └───────────────┘                          │
└─────────────────────────────────────────────┘
```

Start everything: `docker-compose up`

---

### Production (Single Server)

```
Internet
   │
   ▼
[ Nginx ] ← reverse proxy, SSL termination
   │           port 80 → 443
   ├──► /api  ──► [ NestJS (PM2) ]  port 3001
   │                    │
   └──► /     ──► [ Static files (dist/) ]
                        │
               [ PostgreSQL ] ← managed by Docker
               [ Docker Engine ] ← for code execution
```

**Services managed by:**
- **PM2** — Keeps NestJS alive, auto-restarts on crash, log management
- **systemd** — Starts PM2 and Docker on server boot
- **Nginx** — Handles HTTPS, serves static frontend, proxies API requests

---

## 10. Potential Pain Points & Solutions

| Pain Point | Why It Happens | Solution |
|---|---|---|
| **Docker cold starts** | First execution pulls the Docker image (~200MB) | Pre-pull all images on server startup with a boot script |
| **WebSocket debugging** | Events are invisible in standard Network tab | Use Browser DevTools → WS tab; add verbose server-side logging |
| **Execution timeouts** | Code with infinite loops hangs the container | Set `--stop-timeout 5` on Docker; watchdog SIGKILL after 5s |
| **Database migrations** | Schema changes break existing data | Always use `prisma migrate dev` — never edit the DB manually |
| **JWT expiration** | Users get logged out mid-session | Implement silent token refresh — re-issue JWT if user is active |
| **Monaco Editor bundle size** | Monaco is ~5MB; slow initial load | Use dynamic import (`React.lazy`) so it loads after the page shell |
| **Docker permission errors** | NestJS process can't reach Docker socket | Add the app user to the `docker` group on the server |
| **CORS errors** | Browser blocks cross-origin requests | Set `CORS_ORIGIN=http://localhost:5173` in NestJS config |
| **Prisma schema drift** | DB schema and Prisma schema are out of sync | Run `prisma db pull` to re-sync, then `prisma generate` |
| **Port conflicts** | Two services on same port | Define all ports in `.env`; never hardcode port numbers |

---

## Summary

CodeVerse uses a clean, 4-layer architecture that separates concerns clearly:

```
What the user sees  ──►  React (Presentation)
How requests flow   ──►  NestJS (API)
Where data lives    ──►  PostgreSQL (Data)
Where code runs     ──►  Docker (Execution)
```

Every technology choice prioritises:
1. **Security** — untrusted code never touches the host
2. **Type safety** — TypeScript + Prisma catch errors before they reach production
3. **Learning value** — NestJS, Prisma, Docker are industry-standard tools
4. **Simplicity now, scale later** — built for 10 users; designed to grow to 100+

---

*Document prepared for CodeVerse v1.0 — System Architecture*
*© 2026 CodeVerse Project*
