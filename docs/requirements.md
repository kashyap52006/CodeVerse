# CodeVerse — Online Code Compiler
## Software Requirements Specification (SRS)

> **Document Version:** 1.0.0
> **Date:** July 3, 2026
> **Status:** Draft — Pending Stakeholder Review
> **Classification:** Internal / Educational Project

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Overview](#2-product-overview)
3. [User Personas](#3-user-personas)
4. [Use Cases & User Stories](#4-use-cases--user-stories)
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [System Architecture Overview](#7-system-architecture-overview)
8. [Constraints & Assumptions](#8-constraints--assumptions)
9. [Out of Scope](#9-out-of-scope)
10. [Success Criteria](#10-success-criteria)
11. [Risk Analysis](#11-risk-analysis)
12. [Timeline Estimates](#12-timeline-estimates)
13. [Glossary](#13-glossary)

---

## 1. Executive Summary

**CodeVerse** is a self-hosted online code compiler and execution platform designed for students and beginner programmers. It provides a browser-based coding environment that eliminates the need for local development tool installation, enabling learners to write, compile, and execute code in **C, C++, Python, Java, and JavaScript** directly from their browser.

The platform is architected for a small cohort of **5–10 concurrent users** — ideal for a classroom, study group, or individual learning — while being designed with future scalability in mind. CodeVerse combines a professional-grade Monaco code editor (the same editor powering VS Code), real-time output streaming, a personal code snippet library, and robust security through Docker-isolated code execution.

**Core Value Proposition:**

| Benefit | Description |
|---|---|
| Zero Setup | Students run code in any supported language without installing compilers |
| Always Available | Self-hosted; accessible on any device with a browser |
| Safe Execution | All code runs in isolated Docker containers — no risk to the host system |
| Personalized | Each user has a private snippet library and execution history |
| Beginner-Friendly | Clear error messages, familiar VS Code-like editor, guided UI |

---

## 2. Product Overview

| Attribute | Value |
|---|---|
| **Product Name** | CodeVerse |
| **Type** | Online Code Compiler / Execution Platform |
| **Target Users** | Students, beginner programmers |
| **Concurrent Users** | 5–10 (initial), scalable to 50+ |
| **Supported Languages** | C, C++, Python 3, Java, JavaScript (Node.js) |
| **Deployment Model** | Self-hosted (local machine or single Linux server) |
| **Access Method** | Web browser (no client installation required) |
| **Authentication** | Email/Password + Google OAuth |

### 2.1 Product Goals

1. Provide a reliable, browser-based code execution environment for learners.
2. Remove the friction of compiler installation and environment configuration.
3. Allow users to save, revisit, and manage their code snippets across sessions.
4. Ensure all code execution is sandboxed and secure.
5. Deliver a professional UI that motivates learning.

---

## 3. User Personas

### Persona 1 — The Undergraduate Student

> **Name:** Arjun Mehta | **Age:** 19 | **Background:** Computer Science, Year 1

Arjun is in his first semester of CS and studying C and C++ as part of his curriculum. His laptop is underpowered and setting up GCC on Windows gave him dependency errors. He wants to do his lab assignments without spending hours fighting the toolchain.

- **Goals:** Write, compile, and test assignments quickly; save code to revisit later.
- **Pain Points:** Environment setup complexity; cryptic compiler error messages.
- **Tech Comfort:** Low–Medium. Familiar with basic code but new to compilers.
- **Expectations:** Simple UI, helpful errors, works every time.

---

### Persona 2 — The Self-Taught Learner

> **Name:** Priya Nair | **Age:** 24 | **Background:** Marketing professional learning Python

Priya is taking an online Python course to transition into data roles. She uses CodeVerse from her office browser during lunch breaks. She doesn't want to install anything on her work computer.

- **Goals:** Run Python snippets from tutorials; save experiments for later.
- **Pain Points:** Can't install software on work machines; forgets code between sessions.
- **Tech Comfort:** Low. Non-technical background; needs forgiving error messages.
- **Expectations:** Zero setup, auto-save, easy to pick up where she left off.

---

### Persona 3 — The Coding Instructor

> **Name:** Dr. Ramesh Kumar | **Age:** 42 | **Background:** College lecturer, teaches DSA in Java

Dr. Kumar self-hosts CodeVerse for his 8-student lab section. He uses it to demonstrate algorithms live during class and wants students to run the same code themselves in real-time.

- **Goals:** Demonstrate code live; have students run examples without setup delays.
- **Pain Points:** Lab computers have inconsistent JDK versions; students lose code.
- **Tech Comfort:** High. Can manage a Linux server and Docker.
- **Expectations:** Reliable multi-user support, isolated environments, consistent Java version.

---

### Persona 4 — The Competitive Programming Hobbyist

> **Name:** Yusuf Adeyemi | **Age:** 21 | **Background:** Engineering student, practices on LeetCode-style problems

Yusuf uses CodeVerse as a scratchpad when solving algorithm problems. He switches frequently between C++ and Python, needs fast execution, and wants to test code with custom stdin inputs.

- **Goals:** Quick compile-and-run loop; stdin support for test cases; language switching.
- **Pain Points:** Slow online judges; no custom input on some platforms.
- **Tech Comfort:** Medium–High. Comfortable with editors and command-line basics.
- **Expectations:** Fast execution, stdin input box, Monaco editor shortcuts.

---

### Persona 5 — The Returning Beginner

> **Name:** Sara Chen | **Age:** 28 | **Background:** Former CS student returning to coding after 5 years

Sara started coding in college but stopped after graduation. She's using JavaScript to build small projects and needs a quick environment to test snippets without setting up Node.js locally.

- **Goals:** Test JavaScript snippets; save useful utility functions; dark mode.
- **Pain Points:** Overwhelmed by full IDE setup; wants something in the browser.
- **Tech Comfort:** Medium. Remembers basics; needs gentle relearning curve.
- **Expectations:** Modern UI, dark mode, familiar editor feel, history of recent runs.

---

## 4. Use Cases & User Stories

### Use Case Matrix

| ID | Use Case | Primary Actor | Priority |
|---|---|---|---|
| UC-01 | Register and set up account | New User | Must Have |
| UC-02 | Log in with Google OAuth | Returning User | Must Have |
| UC-03 | Write and execute code | Authenticated User | Must Have |
| UC-04 | Provide stdin input during execution | Authenticated User | Must Have |
| UC-05 | Save code snippet to library | Authenticated User | Must Have |
| UC-06 | Browse and manage saved snippets | Authenticated User | Must Have |
| UC-07 | View execution history | Authenticated User | Should Have |
| UC-08 | Reset forgotten password | Unauthenticated User | Must Have |
| UC-09 | Toggle dark/light mode | Any User | Should Have |
| UC-10 | Change account password | Authenticated User | Should Have |

---

### UC-01: Register and Set Up Account

**Actor:** New User
**Precondition:** User has a valid email address and is not already registered.

**User Story:**
> *As a new student, I want to register with my email and password so that I can create a personal account and start writing code without asking an admin for access.*

**Main Flow:**
1. User navigates to the Authentication Page.
2. User selects "Sign Up" tab and enters name, email, and password.
3. System validates inputs (email format, password strength ≥ 8 characters).
4. System hashes password with bcrypt and stores user record.
5. System issues a JWT token and redirects user to the Compiler Page.

**Alternative Flow (Email already exists):**
- System displays: *"An account with this email already exists. Try logging in."*

**Acceptance Criteria:**
- [ ] Passwords are stored as bcrypt hashes (never plaintext).
- [ ] Duplicate emails are rejected with a clear message.
- [ ] Successful registration immediately logs the user in.
- [ ] JWT token is issued with a 24-hour expiry.

---

### UC-02: Log In with Google OAuth

**Actor:** Returning User
**Precondition:** User has a Google account.

**User Story:**
> *As a student who uses Google Workspace, I want to log in with my Google account so that I don't have to remember another password.*

**Main Flow:**
1. User clicks "Continue with Google" on the Authentication Page.
2. System redirects to Google OAuth consent screen.
3. User grants permission; Google returns user profile (name, email, avatar).
4. System checks if a CodeVerse account exists for that email.
5a. (Existing user) — System issues JWT and logs user in.
5b. (New user) — System creates account from Google profile, issues JWT.

**Acceptance Criteria:**
- [ ] Google OAuth flow completes without errors.
- [ ] Google-authenticated users can access all features identical to email-registered users.
- [ ] On first OAuth login, a new account is provisioned automatically.

---

### UC-03: Write and Execute Code

**Actor:** Authenticated User
**Precondition:** User is logged in and on the Compiler Page.

**User Story:**
> *As a student practicing DSA, I want to write C++ code in a familiar editor and click Run so that I can instantly see if my solution produces the correct output.*

**Main Flow:**
1. User selects "C++" from the language dropdown.
2. User writes code in the Monaco editor.
3. User clicks the **Run** button.
4. System sends code + language + stdin to the backend execution API.
5. Backend spawns an isolated Docker container for C++.
6. Container compiles the code (g++), then executes the binary.
7. Stdout and stderr stream back in real-time via WebSocket.
8. Output console displays results; compilation errors show file + line number.
9. Container is destroyed after execution completes.

**Alternative Flows:**
- **Compilation Error:** Output console shows error with line number highlighted.
- **Runtime Error:** Output console shows runtime exception; execution terminates.
- **Timeout (>5s):** Execution is killed; message displayed: *"Execution timed out (5s limit)."*

**Acceptance Criteria:**
- [ ] All 5 languages execute successfully for a Hello World program.
- [ ] Compilation errors include line numbers.
- [ ] Execution completes within 5 seconds for typical programs.
- [ ] Timeout kills the container after 5 seconds.
- [ ] Each execution runs in its own isolated Docker container.

---

### UC-04: Provide Stdin Input During Execution

**Actor:** Authenticated User
**Precondition:** User is on the Compiler Page with code that reads from stdin.

**User Story:**
> *As a student testing a number-sorting program, I want to type my test input in an input box so that my program reads it as if I typed it in a terminal.*

**Main Flow:**
1. User writes code that reads from stdin (e.g., `scanf` in C, `input()` in Python).
2. User types test input in the **Input Console** (a dedicated textarea).
3. User clicks **Run**.
4. System passes the input textarea content as stdin to the container.
5. Program consumes the input and produces output normally.

**Acceptance Criteria:**
- [ ] Multi-line stdin input is supported.
- [ ] Stdin is piped to the program before execution starts (pre-supplied, not interactive).
- [ ] Programs that don't consume stdin work correctly regardless.

---

### UC-05: Save Code Snippet to Library

**Actor:** Authenticated User
**Precondition:** User has code in the editor and is logged in.

**User Story:**
> *As a learner, I want to save my current code with a name and language tag so that I can find it again later without losing my work.*

**Main Flow:**
1. User clicks the **Save** button (or auto-save triggers after 30s).
2. System prompts for a snippet name (if not already saved).
3. System saves snippet with: name, code, language, timestamp, user ID.
4. Confirmation toast: *"Snippet saved successfully."*
5. Snippet appears in the user's Dashboard.

**Acceptance Criteria:**
- [ ] Snippets are associated with the logged-in user only.
- [ ] Auto-save triggers every 30 seconds when code has changed.
- [ ] Users cannot see other users' snippets.
- [ ] Snippet name is editable after creation.

---

### UC-06: Browse and Manage Saved Snippets

**Actor:** Authenticated User
**Precondition:** User has at least one saved snippet and is on the Dashboard Page.

**User Story:**
> *As a student returning after a week, I want to find my Binary Search implementation from last session so that I can continue working on it.*

**Main Flow:**
1. User navigates to the Dashboard Page.
2. System displays all user's snippets in a list/card view (name, language, date).
3. User optionally uses the search bar or language filter to narrow results.
4. User clicks a snippet to open it in the Compiler Page.
5. Alternatively, user clicks **Delete** to remove a snippet (with confirmation dialog).

**Acceptance Criteria:**
- [ ] Snippet list loads within 2 seconds.
- [ ] Search filters by snippet name (case-insensitive).
- [ ] Language filter shows only snippets for selected language.
- [ ] Delete requires a confirmation step to prevent accidents.
- [ ] Clicking a snippet loads its code and language into the editor.

---

### UC-07: View Execution History

**Actor:** Authenticated User
**Precondition:** User has executed at least one program in this account's history.

**User Story:**
> *As a student, I want to see the last 10 times I ran code so that I can reference what I tried before and see the outputs.*

**Main Flow:**
1. User navigates to the Dashboard Page.
2. System displays "Recent Executions" section with last 10 runs.
3. Each entry shows: language, snippet name (or "Unsaved"), timestamp, exit status.
4. User can click an entry to view the code and output from that run.

**Acceptance Criteria:**
- [ ] History shows a maximum of 10 entries.
- [ ] History is sorted newest-first.
- [ ] Each entry accurately reflects the code run and its output.

---

### UC-08: Reset Forgotten Password

**Actor:** Unauthenticated User
**Precondition:** User has a registered email/password account.

**User Story:**
> *As a student who forgot my password, I want to receive a reset link to my email so that I can regain access to my account without needing admin help.*

**Main Flow:**
1. User clicks "Forgot Password?" on the Authentication Page.
2. User enters their registered email address.
3. System generates a secure, time-limited reset token (expiry: 1 hour) and emails a reset link.
4. User clicks the link, enters a new password, confirms it.
5. System updates the password hash; old sessions are invalidated.
6. User is redirected to login.

**Acceptance Criteria:**
- [ ] Reset link expires after 1 hour.
- [ ] Reset link is single-use (invalidated after use).
- [ ] Email is sent only if the address exists (no user enumeration in error messages).
- [ ] New password must meet strength requirements (≥ 8 characters).

---

### UC-09: Toggle Dark/Light Mode

**Actor:** Any Authenticated User
**Precondition:** User is on any page of the application.

**User Story:**
> *As someone who codes at night, I want to switch to dark mode so that the bright white interface doesn't strain my eyes.*

**Main Flow:**
1. User clicks the theme toggle (sun/moon icon) in the navigation bar.
2. System immediately switches the UI between dark and light themes.
3. Monaco Editor theme switches accordingly (e.g., `vs-dark` / `vs-light`).
4. User's preference is saved to localStorage and persists across sessions.

**Acceptance Criteria:**
- [ ] Theme toggles without page reload.
- [ ] All UI components (editor, consoles, sidebar) respect the active theme.
- [ ] Preference persists when the user returns in a new browser session.

---

### UC-10: Change Account Password

**Actor:** Authenticated User
**Precondition:** User is logged in and navigates to Profile/Settings Page.

**User Story:**
> *As a user, I want to update my password from my settings page so that I can keep my account secure without logging out.*

**Main Flow:**
1. User navigates to Profile/Settings Page.
2. User enters current password, new password, and confirms new password.
3. System verifies the current password against the bcrypt hash.
4. System hashes and stores the new password.
5. Confirmation: *"Password updated successfully."*

**Acceptance Criteria:**
- [ ] Current password must be verified before change is accepted.
- [ ] New password must meet strength requirements.
- [ ] All existing JWT sessions (except current) are invalidated on password change.

---

## 5. Functional Requirements

### 5.1 Authentication System

#### 5.1.1 User Registration

| ID | Requirement |
|---|---|
| AUTH-01 | The system SHALL allow users to register using a unique email address and password. |
| AUTH-02 | Passwords SHALL be a minimum of 8 characters and include at least one number or special character. |
| AUTH-03 | All passwords SHALL be hashed using bcrypt (minimum cost factor: 12) before storage. |
| AUTH-04 | The system SHALL validate email format during registration and reject invalid formats. |
| AUTH-05 | The system SHALL prevent registration with an email that already exists in the database. |
| AUTH-06 | On successful registration, the system SHALL automatically log the user in by issuing a JWT token. |

#### 5.1.2 User Login

| ID | Requirement |
|---|---|
| AUTH-07 | The system SHALL allow users to log in using email and password. |
| AUTH-08 | Failed login attempts SHALL return a generic error (no hint whether email or password is wrong). |
| AUTH-09 | The system SHALL issue a signed JWT token with a 24-hour expiry upon successful login. |
| AUTH-10 | JWT tokens SHALL be stored in HTTP-only cookies to prevent XSS access. |

#### 5.1.3 Google OAuth

| ID | Requirement |
|---|---|
| AUTH-11 | The system SHALL support Google OAuth 2.0 login via a "Continue with Google" button. |
| AUTH-12 | On first Google OAuth login, the system SHALL automatically create a user account from the Google profile. |
| AUTH-13 | Google OAuth users who try to log in with email/password SHALL be redirected to use Google login. |

#### 5.1.4 Password Reset

| ID | Requirement |
|---|---|
| AUTH-14 | The system SHALL provide a "Forgot Password" flow that sends a reset link to the user's email. |
| AUTH-15 | Password reset tokens SHALL expire after 1 hour and be invalidated after single use. |
| AUTH-16 | The reset email SHALL contain only the reset link and SHALL NOT expose any sensitive data. |

#### 5.1.5 Session Management

| ID | Requirement |
|---|---|
| AUTH-17 | The system SHALL provide a Logout function that clears the JWT cookie and invalidates the token server-side. |
| AUTH-18 | All protected routes SHALL redirect unauthenticated users to the Authentication Page. |
| AUTH-19 | JWT tokens SHALL be refreshed silently if the user is actively using the application near expiry. |

---

### 5.2 Compiler Interface

#### 5.2.1 Code Editor

| ID | Requirement |
|---|---|
| EDIT-01 | The system SHALL embed the Monaco Editor as the primary code editing surface. |
| EDIT-02 | The editor SHALL display line numbers at all times. |
| EDIT-03 | The editor SHALL support syntax highlighting for C, C++, Python, Java, and JavaScript. |
| EDIT-04 | The editor SHALL support Tab key for indentation (configurable: 2 or 4 spaces). |
| EDIT-05 | The editor SHALL support Enter key for auto-indentation based on language context. |
| EDIT-06 | The editor theme SHALL update when the user toggles dark/light mode. |
| EDIT-07 | The editor SHALL display a character/line count in the status bar. |

#### 5.2.2 Language Selector

| ID | Requirement |
|---|---|
| EDIT-08 | The system SHALL provide a dropdown to select the active language: C, C++, Python, Java, JavaScript. |
| EDIT-09 | Changing the language SHALL update the Monaco editor's syntax highlighting mode immediately. |
| EDIT-10 | When a language is changed, the system SHALL warn the user if the current code will be lost (if unsaved). |

#### 5.2.3 Console Areas

| ID | Requirement |
|---|---|
| EDIT-11 | The system SHALL provide an **Input Console** (textarea) for users to supply stdin before execution. |
| EDIT-12 | The system SHALL provide an **Output Console** for displaying stdout and stderr from execution. |
| EDIT-13 | Stderr output SHALL be visually differentiated from stdout (e.g., red text or labeled prefix). |
| EDIT-14 | The Output Console SHALL have a **Clear** button to reset the output display. |
| EDIT-15 | The Input Console SHALL have a **Clear** button to reset the stdin content. |

#### 5.2.4 Action Buttons

| ID | Requirement |
|---|---|
| EDIT-16 | The system SHALL provide a **Run** button that initiates code execution. |
| EDIT-17 | The system SHALL provide a **Stop** button that terminates the currently running execution. |
| EDIT-18 | The **Run** button SHALL be disabled and replaced with a loading state while execution is in progress. |
| EDIT-19 | The system SHALL provide a **Save** button that saves the current snippet to the user's library. |

---

### 5.3 Code Execution Engine

#### 5.3.1 Supported Languages & Runtimes

| Language | Runtime/Compiler | Command |
|---|---|---|
| C | GCC (latest) | `gcc -o out main.c && ./out` |
| C++ | G++ (latest) | `g++ -o out main.cpp && ./out` |
| Python | Python 3.11+ | `python3 main.py` |
| Java | OpenJDK 17+ | `javac Main.java && java Main` |
| JavaScript | Node.js 20 LTS | `node main.js` |

| ID | Requirement |
|---|---|
| EXEC-01 | The system SHALL execute code for all 5 supported languages within isolated Docker containers. |
| EXEC-02 | Each execution SHALL use a separate, ephemeral Docker container that is destroyed after the run. |
| EXEC-03 | The system SHALL capture and return the complete stdout from the executed program. |
| EXEC-04 | The system SHALL capture and return the complete stderr from the executed program. |
| EXEC-05 | Compilation errors (C, C++, Java) SHALL be returned as stderr with file name and line number. |
| EXEC-06 | Runtime errors (segfaults, exceptions) SHALL be captured and returned as stderr. |

#### 5.3.2 Security Constraints for Execution

| ID | Requirement |
|---|---|
| EXEC-07 | Docker containers SHALL run as a non-root, unprivileged user. |
| EXEC-08 | Containers SHALL have **no network access** (isolated network namespace). |
| EXEC-09 | Containers SHALL mount **no host filesystem volumes** (code is passed via ephemeral copy). |
| EXEC-10 | Container CPU shall be limited to **0.5 CPU cores** per execution. |
| EXEC-11 | Container memory SHALL be limited to **128 MB** per execution. |
| EXEC-12 | Execution SHALL be automatically killed if it exceeds **5 seconds**. |
| EXEC-13 | The system SHALL reject code submissions exceeding **64 KB** in size. |

#### 5.3.3 Output Streaming

| ID | Requirement |
|---|---|
| EXEC-14 | The system SHALL stream output to the client in real-time via WebSocket as the program produces it. |
| EXEC-15 | When execution completes, the system SHALL send a terminal "done" event with exit code. |
| EXEC-16 | Exit code 0 SHALL be displayed as "Execution successful"; non-zero as "Execution failed (exit code N)". |

---

### 5.4 User Dashboard

| ID | Requirement |
|---|---|
| DASH-01 | The Dashboard SHALL display all code snippets belonging to the authenticated user. |
| DASH-02 | Each snippet card SHALL display: name, language tag, last modified date, and action buttons. |
| DASH-03 | The Dashboard SHALL provide a search field to filter snippets by name (real-time, no page reload). |
| DASH-04 | The Dashboard SHALL provide a language filter dropdown to show snippets of a specific language. |
| DASH-05 | The user SHALL be able to create a new snippet (redirects to Compiler Page with a blank editor). |
| DASH-06 | The user SHALL be able to delete a snippet after confirming via a modal dialog. |
| DASH-07 | The Dashboard SHALL display a "Recent Executions" section showing the last 10 runs. |
| DASH-08 | Each execution history entry SHALL show: language, timestamp, status (success/error/timeout). |
| DASH-09 | The Dashboard SHALL display a user profile section with name, email, and avatar. |
| DASH-10 | The Dashboard SHALL provide a "Change Password" option for email-registered users. |

---

### 5.5 Real-Time Features

| ID | Requirement |
|---|---|
| RT-01 | The system SHALL use WebSockets to stream execution output to the client in real-time. |
| RT-02 | The editor content SHALL be auto-saved to the server every **30 seconds** if changes were detected. |
| RT-03 | Auto-save SHALL display a subtle status indicator (e.g., "Saving…" → "Saved"). |
| RT-04 | WebSocket connection loss SHALL be handled gracefully with an automatic reconnect attempt. |
| RT-05 | Live syntax errors from Monaco's built-in language services SHALL be displayed inline without requiring a full execution. |

---

### 5.6 UI & User Experience

| ID | Requirement |
|---|---|
| UX-01 | The system SHALL provide a dark mode and a light mode, toggleable by the user. |
| UX-02 | The user's theme preference SHALL persist in localStorage across browser sessions. |
| UX-03 | The application SHALL be fully functional on desktops (1280px+) and tablets (768px+). |
| UX-04 | The application SHALL be viewable (read-only graceful degradation) on mobile screens (<768px). |
| UX-05 | All form validation errors SHALL be displayed inline, adjacent to the erroneous field. |
| UX-06 | All user-facing error messages SHALL be written in plain English, not raw exception traces. |
| UX-07 | Loading states (spinner/skeleton) SHALL be shown for all async operations >300ms. |
| UX-08 | Toast notifications SHALL confirm successful actions (save, delete, password change). |

---

## 6. Non-Functional Requirements

### 6.1 Performance

| ID | Requirement | Target |
|---|---|---|
| PERF-01 | Initial page load time (Compiler Page) | < 2 seconds on local network |
| PERF-02 | Code execution end-to-end (submission → first output byte) | < 1 second (container warmup excluded) |
| PERF-03 | Maximum code execution duration | ≤ 5 seconds (enforced by timeout kill) |
| PERF-04 | WebSocket output latency | < 100 ms per chunk |
| PERF-05 | Snippet list load time on Dashboard | < 2 seconds for up to 100 snippets |
| PERF-06 | Auto-save round-trip time | < 500 ms |

### 6.2 Security

| ID | Requirement |
|---|---|
| SEC-01 | All passwords SHALL be hashed using **bcrypt** with cost factor ≥ 12. |
| SEC-02 | JWT tokens SHALL be signed using **HS256** with a server-side secret (min 256-bit). |
| SEC-03 | JWT tokens SHALL be stored in **HTTP-only, Secure, SameSite=Strict cookies**. |
| SEC-04 | JWT tokens SHALL expire after **24 hours**. |
| SEC-05 | All API endpoints SHALL validate input with a schema validation library (e.g., Zod, Joi). |
| SEC-06 | The database ORM SHALL use parameterized queries to prevent SQL injection. |
| SEC-07 | The system SHALL enforce **rate limiting**: 10 execution requests per minute per user. |
| SEC-08 | All user-submitted code SHALL execute in Docker containers with no network, no host filesystem, and resource limits (CPU, RAM, time). |
| SEC-09 | The system SHALL set security headers: `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`. |
| SEC-10 | Google OAuth client secrets SHALL be stored in environment variables, never in code or version control. |

### 6.3 Reliability

| ID | Requirement |
|---|---|
| REL-01 | Code execution failures (container crashes) SHALL be caught and returned to the user as a readable error. |
| REL-02 | The backend service SHALL automatically restart on crash (e.g., via PM2 or Docker restart policy). |
| REL-03 | The database SHALL be backed up daily (automated backup script or Docker volume snapshot). |
| REL-04 | The system SHALL handle up to 10 simultaneous code executions without degradation. |
| REL-05 | If a WebSocket connection is lost, the client SHALL display a reconnect notification and retry automatically (up to 5 times with exponential backoff). |

### 6.4 Scalability

| ID | Requirement |
|---|---|
| SCALE-01 | The initial deployment SHALL support 5–10 concurrent users. |
| SCALE-02 | The architecture SHALL be container-based (Dockerized services) to allow horizontal scaling. |
| SCALE-03 | The execution engine SHALL be designed as an independent microservice, enabling future scaling independently of the web server. |
| SCALE-04 | The database schema SHALL use proper indexing on foreign keys and frequently queried fields. |

### 6.5 Maintainability

| ID | Requirement |
|---|---|
| MAINT-01 | All environment configuration (DB URL, JWT secret, OAuth keys) SHALL use `.env` files. |
| MAINT-02 | The codebase SHALL use consistent code style enforced by a linter (ESLint/Prettier for JS). |
| MAINT-03 | Docker Compose SHALL be provided to start all services (frontend, backend, database) with a single command. |
| MAINT-04 | The README SHALL include complete setup instructions for a new developer. |

---

## 7. System Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT BROWSER                     │
│  ┌─────────────────┐  ┌──────────┐  ┌───────────────┐   │
│  │  Monaco Editor  │  │ Dashboard│  │  Auth Page    │   │
│  │  (React/Vite)   │  │  Page    │  │  (Login/Reg)  │   │
│  └────────┬────────┘  └────┬─────┘  └───────┬───────┘   │
│           │  REST API      │                │           │
│           │  WebSocket     │                │           │
└───────────┼────────────────┼────────────────┼───────────┘
            │                │                │
┌───────────▼────────────────▼────────────────▼───────────┐
│                   BACKEND (Node.js / Express)           │
│  ┌──────────────┐  ┌─────────────┐  ┌────────────────┐  │
│  │  Auth Service│  │ Snippet API │  │ Execution API  │  │
│  │  (JWT/OAuth) │  │  (CRUD)     │  │  (Dispatcher)  │  │
│  └──────────────┘  └──────┬──────┘  └───────┬────────┘  │
│                           │                 │           │
│  ┌────────────────────┐   │  ┌──────────────▼────────┐  │
│  │  WebSocket Server  │◄──┤  │  Docker Executor      │  │
│  │  (Socket.io)       │   │  │  (Spawn Container)    │  │
│  └────────────────────┘   │  └──────────────────────┘  │
└───────────────────────────┼─────────────────────────────┘
                            │
            ┌───────────────▼──────────────┐
            │   PostgreSQL / SQLite DB      │
            │   (Users, Snippets, History)  │
            └───────────────────────────────┘
                                |
            ┌───────────────────▼──────────────┐
            │   Docker Engine (Host)            │
            │   ┌──────┐  ┌──────┐  ┌──────┐   │
            │   │ C/C++│  │Python│  │ Java │   │
            │   │  Box │  │  Box │  │  Box │   │
            │   └──────┘  └──────┘  └──────┘   │
            └──────────────────────────────────┘
```

### Technology Stack (Recommended)

| Layer | Technology | Rationale |
|---|---|---|
| Frontend Framework | React + Vite | Fast dev server, modern ecosystem |
| Code Editor | Monaco Editor (`@monaco-editor/react`) | Industry-standard, VS Code feel |
| Styling | Vanilla CSS / CSS Modules | Full control, no heavy framework |
| Backend | Node.js + Express | JavaScript end-to-end, beginner-friendly |
| WebSockets | Socket.io | Handles reconnects, rooms, events |
| Auth | jsonwebtoken + bcryptjs | Industry standard JWT/bcrypt |
| OAuth | Passport.js (Google Strategy) | Mature OAuth library for Node |
| Database | PostgreSQL (prod) / SQLite (dev) | Relational, good for snippets/users |
| ORM | Prisma | Type-safe, auto-migrations, beginner-friendly |
| Code Execution | Docker SDK for Node.js (`dockerode`) | Programmatic container management |
| Email | Nodemailer + SMTP | Password reset emails |
| Rate Limiting | express-rate-limit | API request throttling |

---

## 8. Constraints & Assumptions

### 8.1 Technical Constraints

| # | Constraint |
|---|---|
| C-01 | The host machine MUST have Docker Engine installed and the backend process must have permission to create Docker containers. |
| C-02 | The host machine MUST have sufficient RAM to handle concurrent containers (minimum 4 GB RAM recommended for 10 users). |
| C-03 | The server must have internet access for Google OAuth redirect URIs to function. |
| C-04 | Email password reset requires a working SMTP server or service (e.g., Gmail SMTP, Mailgun free tier). |
| C-05 | Monaco Editor requires a modern browser (Chrome 90+, Firefox 90+, Safari 15+, Edge 90+). |

### 8.2 Business Constraints

| # | Constraint |
|---|---|
| C-06 | The platform is for educational/personal use; no SLA or uptime guarantee is required. |
| C-07 | The system must be deployable by a single developer with no DevOps background (Docker Compose single command). |
| C-08 | All third-party services used must have a free tier suitable for the stated user volume. |

### 8.3 Assumptions

| # | Assumption |
|---|---|
| A-01 | Users have a modern web browser and a stable internet/intranet connection. |
| A-02 | The host server runs Linux (Ubuntu 22.04 LTS recommended); Windows Server is not a target. |
| A-03 | All users are known students/trusted individuals — no public anonymous access is required. |
| A-04 | Users will not intentionally attempt to abuse the system (relaxed adversarial model vs. public platform). |
| A-05 | The instructor or developer is responsible for maintaining the host server and Docker runtime. |
| A-06 | Stdin is pre-supplied (not interactive terminal) — programs read all stdin at once at execution start. |
| A-07 | Docker images for each language will be pre-pulled on the server to avoid cold-start delays. |

---

## 9. Out of Scope

The following features are explicitly **excluded** from this version to maintain focus and scope:

| Feature | Reason for Exclusion |
|---|---|
| Collaborative/shared code editing | Requires complex CRDT algorithms; high implementation cost |
| Team workspaces and projects | Multi-tenancy complexity beyond current scale |
| Code templates library | Nice-to-have; can be added in v2 |
| Social features (upvotes, comments, sharing) | Out of educational scope |
| AI code assistance / Copilot integration | Requires external API costs and significant integration |
| Performance profiling and memory analysis | Advanced feature for experienced developers |
| Step-through debugging (breakpoints) | Requires DAP integration; significant complexity |
| CI/CD pipeline integrations | Enterprise feature; not relevant at this scale |
| Mobile native apps (iOS/Android) | Web-first approach; browser on mobile is sufficient |
| Support for additional languages (Go, Rust, PHP) | Can be added incrementally in v2+ |

---

## 10. Success Criteria

The project SHALL be considered successfully complete when all of the following criteria are met:

### 10.1 Functional Completeness

| Criterion | Measurement |
|---|---|
| All 5 languages compile and execute correctly | Hello World + a non-trivial program (e.g., Fibonacci) executes correctly in each language |
| Authentication system fully functional | Register, login, Google OAuth, password reset all work end-to-end |
| Snippet CRUD fully functional | Create, read, update, delete snippets work without data loss |
| Dashboard displays snippets and history | Data is accurate and matches actual executions |
| Auto-save works correctly | Code is saved without user action after 30 seconds of inactivity |
| WebSocket streaming works | Output appears in real-time during a long-running print loop |

### 10.2 Security Validation

| Criterion | Measurement |
|---|---|
| Passwords stored as bcrypt hashes | Direct DB inspection shows no plaintext passwords |
| Docker isolation confirmed | A malicious script attempting to read `/etc/passwd` from the host returns an error |
| Rate limiting active | 11th request within a minute is rejected with HTTP 429 |
| JWT stored in HTTP-only cookie | Browser DevTools → Application → Cookies shows HttpOnly flag |

### 10.3 Performance Benchmarks

| Criterion | Target | Measurement Method |
|---|---|---|
| Page load time | < 2 seconds | Chrome DevTools Network tab |
| Python execution (Hello World) | < 3 seconds | Client-side timestamp comparison |
| C++ execution (Hello World) | < 4 seconds | Client-side timestamp comparison |
| Snippet list load | < 2 seconds | Chrome DevTools |
| 5 concurrent executions | No crashes or timeout errors | Manual parallel testing |

### 10.4 User Acceptance

| Criterion |
|---|
| A non-technical student (Persona 2 equivalent) can register, write Python code, and run it within 5 minutes without assistance. |
| An instructor can demonstrate a Java algorithm in class with output visible to all on screen. |
| A returning user can find a snippet from a previous session within 30 seconds. |

---

## 11. Risk Analysis

### 11.1 Risk Register

| ID | Risk | Likelihood | Impact | Severity | Mitigation Strategy |
|---|---|---|---|---|---|
| R-01 | Docker container escapes / host filesystem access | Low | Critical | **HIGH** | Run containers as non-root; disable privileged mode; no volume mounts; apply seccomp profiles |
| R-02 | Infinite loop / fork bomb crashes the server | Medium | High | **HIGH** | Enforce CPU limit, memory limit, and 5-second execution timeout with SIGKILL |
| R-03 | Google OAuth misconfiguration causes login failure | Medium | Medium | **MEDIUM** | Test OAuth flow in staging; maintain email/password as fallback |
| R-04 | SMTP email delivery failure for password reset | Medium | Medium | **MEDIUM** | Use reliable SMTP service (Mailgun/SendGrid); test email flow; document manual reset procedure for admin |
| R-05 | Monaco Editor slow load on low-bandwidth networks | Low | Medium | **MEDIUM** | Self-host Monaco assets; enable Gzip compression; code-split the editor bundle |
| R-06 | Database corruption or data loss | Low | High | **MEDIUM** | Implement daily automated backups; store backups off-server |
| R-07 | Docker image not pre-pulled — cold start delays | Medium | Low | **LOW** | Add a startup script to pre-pull all language images on server boot |
| R-08 | JWT secret exposed in code repository | Low | Critical | **HIGH** | Use `.env` files; add `.env` to `.gitignore`; rotate secret if ever exposed |
| R-09 | Scope creep delays delivery | High | Medium | **MEDIUM** | Strictly enforce the Out of Scope list; defer all additions to v2 |
| R-10 | Single server becomes unavailable | Low | High | **MEDIUM** | Self-hosted context; document restart procedure; use Docker auto-restart policy |

### 11.2 Risk Priority Matrix

```
IMPACT
  │
C │          R-01        R-08
r │
i │    R-06      R-03
t │
i │          R-02  R-04
c │
a │    R-07  R-05    R-09  R-10
l │
  └──────────────────────────────► LIKELIHOOD
       Low       Medium      High
```

---

## 12. Timeline Estimates

> **Note:** Timeline assumes one developer working approximately 20–25 hours per week. Adjust based on team size and availability.

### Phase 1 — Foundation (Weeks 1–2)
**Goal:** Project scaffolding, auth system, and database.

| Task | Duration | Deliverable |
|---|---|---|
| Project setup (Vite + Express + Prisma) | 2 days | Mono-repo or separate repos running locally |
| Database schema design and migration | 1 day | Users, Snippets, ExecutionHistory tables |
| JWT auth system (register/login/logout) | 3 days | Working register, login, logout endpoints |
| Google OAuth integration | 2 days | "Continue with Google" functional |
| Password reset flow (email) | 2 days | Reset link sent, password updated |
| Authentication Page UI | 3 days | Polished login/register form with dark mode |

**Phase 1 Milestone:** A user can register, log in with Google, and reset their password. ✅

---

### Phase 2 — Core Compiler (Weeks 3–5)
**Goal:** Functional code execution for all 5 languages.

| Task | Duration | Deliverable |
|---|---|---|
| Monaco Editor integration | 2 days | Editor with syntax highlighting in all 5 languages |
| Compiler Page UI layout | 3 days | Editor + Input/Output consoles + buttons |
| Docker execution engine (single language) | 4 days | Python executes in isolated container |
| Extend Docker engine to all 5 languages | 3 days | All 5 languages execute |
| WebSocket streaming of output | 3 days | Output appears in real-time |
| Stop button (kill container) | 1 day | Running execution can be cancelled |
| Timeout + resource limits enforcement | 1 day | 5s timeout, 128 MB RAM, 0.5 CPU enforced |

**Phase 2 Milestone:** All 5 languages compile and run with real-time output streaming. ✅

---

### Phase 3 — Dashboard & Persistence (Week 6–7)
**Goal:** Snippet management and execution history.

| Task | Duration | Deliverable |
|---|---|---|
| Snippet CRUD API | 2 days | REST endpoints for create/read/update/delete |
| Auto-save (frontend polling) | 1 day | Code auto-saved every 30 seconds |
| Dashboard Page UI | 4 days | Snippet cards, search, filter |
| Execution history persistence | 2 days | Last 10 runs stored and displayed |
| Load snippet into editor | 1 day | Clicking a snippet opens it in the editor |

**Phase 3 Milestone:** Full snippet lifecycle working; dashboard complete. ✅

---

### Phase 4 — Polish & Security Hardening (Week 8–9)
**Goal:** Security review, UX polish, testing, deployment.

| Task | Duration | Deliverable |
|---|---|---|
| Input validation (all endpoints) | 2 days | Zod/Joi schemas on all API routes |
| Rate limiting implementation | 1 day | 10 req/min per user enforced |
| Security headers configuration | 1 day | CSP, X-Frame-Options etc. applied |
| Docker Compose setup for deployment | 2 days | `docker-compose up` starts everything |
| Responsive design testing | 2 days | Works on tablet; graceful on mobile |
| End-to-end testing (manual) | 3 days | All use cases verified manually |
| README and deployment documentation | 1 day | Complete setup guide |

**Phase 4 Milestone:** Production-ready, documented, deployable system. ✅

---

### Summary Timeline

```
Week:  1    2    3    4    5    6    7    8    9
       ├────┬────┼────┬────┬────┼────┬────┼────┤
       │ Phase 1 │    Phase 2   │ Phase 3│Phase4│
       │ Auth    │    Compiler  │ Dash   │Polish│
       └─────────┴──────────────┴────────┴──────┘
```

**Total Estimated Duration: 9 Weeks**
**Total Estimated Hours: ~180–225 hours**

---

## 13. Glossary

| Term | Definition |
|---|---|
| **bcrypt** | A password hashing algorithm designed to be computationally expensive, making brute-force attacks infeasible. |
| **Docker** | A containerization platform that packages applications and their dependencies into isolated units called containers. |
| **JWT (JSON Web Token)** | A compact, URL-safe token format used for securely transmitting authentication claims between parties. |
| **Monaco Editor** | The open-source code editor that powers Visual Studio Code, embeddable in web applications. |
| **OAuth 2.0** | An authorization framework enabling third-party login (e.g., "Continue with Google") without sharing passwords. |
| **Prisma** | A modern ORM (Object-Relational Mapping) tool for Node.js that provides type-safe database access. |
| **Rate Limiting** | A technique to restrict the number of API requests a user can make in a given time window. |
| **seccomp** | A Linux kernel security facility used to restrict system calls available to Docker containers. |
| **SRS** | Software Requirements Specification — a document describing what a software system must do. |
| **stdin/stdout/stderr** | Standard streams in Unix: input, output, and error output respectively. |
| **WebSocket** | A full-duplex communication protocol over a single TCP connection, enabling real-time server-to-client data push. |
| **Vite** | A fast frontend build tool and development server for modern JavaScript frameworks. |

---

## Document Sign-Off

| Role | Name | Date | Signature |
|---|---|---|---|
| Project Lead / Developer | _________________ | _________ | _________ |
| Reviewer / Instructor | _________________ | _________ | _________ |
| Approved By | _________________ | _________ | _________ |

---

*Document prepared for CodeVerse v1.0 — Educational Online Code Compiler*
*© 2026 CodeVerse Project. All rights reserved.*
