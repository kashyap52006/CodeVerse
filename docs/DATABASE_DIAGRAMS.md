# DATABASE DIAGRAMS — CodeVerse

> **Version:** 1.0.0
> **Date:** July 8, 2026
> **Database:** PostgreSQL 16.x | **ORM:** Prisma 5.x

---

## Table of Contents

1. [Entity-Relationship Diagram (Full)](#1-entity-relationship-diagram-full)
2. [Simplified ERD (Crow's Foot Notation)](#2-simplified-erd-crows-foot-notation)
3. [Table Column Diagrams](#3-table-column-diagrams)
4. [Relationship Flow Diagram](#4-relationship-flow-diagram)
5. [Data Flow: User Registration](#5-data-flow-user-registration)
6. [Data Flow: Code Execution](#6-data-flow-code-execution)
7. [Data Flow: OAuth Login](#7-data-flow-oauth-login)
8. [Token Lifecycle Diagram](#8-token-lifecycle-diagram)
9. [Soft Delete State Diagram](#9-soft-delete-state-diagram)
10. [Index Coverage Map](#10-index-coverage-map)

---

## 1. Entity-Relationship Diagram (Full)

Complete ERD showing all columns, types, keys, and foreign key arrows.

```
┌──────────────────────────────────────────────────┐
│                      USER                        │
├──────────────────────────────────────────────────┤
│ PK  id              UUID          NOT NULL        │
│     email           VARCHAR(255)  NOT NULL UNIQUE │
│     password        VARCHAR(255)  NULL            │
│     firstName       VARCHAR(100)  NOT NULL        │
│     lastName        VARCHAR(100)  NOT NULL        │
│     profilePicture  VARCHAR(1024) NULL            │
│     bio             TEXT          NULL            │
│     createdAt       TIMESTAMPTZ   NOT NULL        │
│     updatedAt       TIMESTAMPTZ   NOT NULL        │
│     deletedAt       TIMESTAMPTZ   NULL            │
└────────┬─────────────────────────────────────────┘
         │ id
         │
    ┌────┴─────────────────────────────────────────────────────────────┐
    │                    │                     │                       │
    │ userId             │ userId              │ userId                │ userId
    ▼                    ▼                     ▼                       ▼
┌──────────────────┐ ┌────────────────────┐ ┌────────────────────┐ ┌──────────────────┐
│   CODESNIPPET    │ │  EXECUTIONHISTORY  │ │   REFRESHTOKEN     │ │  OAUTHACCOUNT    │
├──────────────────┤ ├────────────────────┤ ├────────────────────┤ ├──────────────────┤
│ PK id   UUID     │ │ PK id   UUID       │ │ PK id   UUID       │ │ PK id   UUID     │
│ FK userId  UUID  │ │ FK userId  UUID    │ │ FK userId  UUID    │ │ FK userId  UUID  │
│    title  VC255  │ │ FK snippetId UUID? │ │    token   VC1024  │ │    provider VC50 │
│    desc   TEXT?  │ │    language VC50   │ │    expiresAt TSZ   │ │  providerUID VC  │
│    language VC50 │ │    code     TEXT   │ │    createdAt TSZ   │ │  accessToken VC  │
│    code   TEXT   │ │    input    TEXT?  │ │    isRevoked BOOL  │ │  refreshToken VC?│
│    input  TEXT?  │ │    output   TEXT?  │ └────────────────────┘ │  tokenExpires TSZ│
│    tags   JSONB  │ │    stderr   TEXT?  │                        │    createdAt TSZ │
│    isPublic BOOL │ │    success  BOOL   │                        │    updatedAt TSZ │
│    viewCount INT │ │    exitCode INT?   │                        └──────────────────┘
│    createdAt TSZ │ │    execTime DEC    │
│    updatedAt TSZ │ │    memory   INT?   │
│    deletedAt TSZ?│ │    errorType VC?   │
└────────┬─────────┘ │    createdAt TSZ   │
         │ id        └────────┬───────────┘
         │                    │ snippetId (nullable)
         └────────────────────┘
         CodeSnippet (1) ──── (N) ExecutionHistory
```

---

## 2. Simplified ERD (Crow's Foot Notation)

```
                              ┌──────────────────┐
                              │       USER        │
                              └────────┬──────────┘
                                       │
              ┌────────────────────────┼─────────────────────────┐
              │                        │                         │
              │                        │                         │
         one-to-many             one-to-many               one-to-many
              │                        │                         │
              ▼                        ▼                         ▼
   ┌──────────────────┐    ┌───────────────────┐    ┌─────────────────────┐
   │   CODESNIPPET    │    │  REFRESHTOKEN     │    │   OAUTHACCOUNT      │
   └────────┬─────────┘    └───────────────────┘    └─────────────────────┘
            │
       one-to-many
            │
            ▼
   ┌──────────────────┐
   │ EXECUTIONHISTORY │
   │  (also links to  │
   │     USER)        │
   └──────────────────┘


Cardinality Key:
  ─── one
  ─<  many
  ──o zero or one (nullable FK)
```

---

## 3. Table Column Diagrams

Compact view of all tables side-by-side.

```
USER                    CODESNIPPET             EXECUTIONHISTORY
─────────────────────   ─────────────────────   ─────────────────────
PK  id          UUID    PK  id          UUID    PK  id          UUID
    email       VC255   FK  userId      UUID    FK  userId      UUID
    password    VC255?      title       VC255   FK  snippetId   UUID?
    firstName   VC100       description TEXT?       language    VC50
    lastName    VC100       language    VC50        code        TEXT
    profilePic  VC1024?     code        TEXT        input       TEXT?
    bio         TEXT?       input       TEXT?       output      TEXT?
    createdAt   TSZ         tags        JSONB       stderr      TEXT?
    updatedAt   TSZ         isPublic    BOOL        success     BOOL
    deletedAt   TSZ?        viewCount   INT         exitCode    INT?
                            createdAt   TSZ         execTime    DEC
                            updatedAt   TSZ         memory      INT?
                            deletedAt   TSZ?        errorType   VC100?
                                                    createdAt   TSZ

REFRESHTOKEN            OAUTHACCOUNT
─────────────────────   ─────────────────────
PK  id          UUID    PK  id          UUID
FK  userId      UUID    FK  userId      UUID
    token       VC1024      provider    VC50
    expiresAt   TSZ         providerUID VC255
    createdAt   TSZ         accessToken VC1024
    isRevoked   BOOL        refreshToken VC1024?
                            tokenExpires TSZ?
                            createdAt   TSZ
                            updatedAt   TSZ

LEGEND:
  PK  = Primary Key       UUID  = UUID v4
  FK  = Foreign Key       TSZ   = TIMESTAMPTZ
  ?   = Nullable          VC    = VARCHAR
  DEC = DECIMAL(10,3)     BOOL  = BOOLEAN
  INT = INTEGER           TEXT  = Unlimited text
```

---

## 4. Relationship Flow Diagram

Shows how data flows between all entities with relationship labels.

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   USER ─────────────── "owns" ──────────────────► CODESNIPPET   │
│    │                                                    │        │
│    │                                                    │        │
│    │ "has sessions"                           "has runs"│        │
│    │                                                    │        │
│    ▼                                                    ▼        │
│  REFRESHTOKEN                              EXECUTIONHISTORY      │
│                                              ▲                   │
│    │ "has OAuth links"                       │                   │
│    │                                "run by" │                   │
│    ▼                                         │                   │
│  OAUTHACCOUNT                            USER (also)             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

Relationship Types:
  USER → CODESNIPPET        (1:N)  One user has many snippets
  USER → EXECUTIONHISTORY   (1:N)  One user has many runs
  USER → REFRESHTOKEN       (1:N)  One user has many sessions
  USER → OAUTHACCOUNT       (1:N)  One user has many OAuth links
  CODESNIPPET → EXECHISTORY (1:N)  One snippet has many runs
```

---

## 5. Data Flow: User Registration

Shows which database tables are written during user registration.

```
Client
  │
  │  POST /auth/register
  │  { email, password, firstName, lastName }
  │
  ▼
NestJS (AuthService)
  │
  ├── 1. Check email uniqueness
  │      SELECT FROM User WHERE email = $1
  │         → EXISTS → 400 Email Already Exists
  │         → NOT EXISTS → continue
  │
  ├── 2. Hash password
  │      bcrypt.hash(password, 12) → passwordHash
  │
  ├── 3. Create user record
  │      INSERT INTO User → new User row
  │
  ├── 4. Issue JWT access token
  │      sign({ sub: userId, email }) → accessToken
  │
  ├── 5. Create refresh token
  │      sha256(randomBytes(64)) → tokenHash
  │      INSERT INTO RefreshToken → new token row
  │
  └── 6. Return tokens to client
         { id, email, token, refreshToken, expiresIn }

Tables Written:
  ✏️  User              (INSERT)
  ✏️  RefreshToken      (INSERT)
```

---

## 6. Data Flow: Code Execution

Shows which tables are read and written during a code execution run.

```
Client
  │
  │  POST /execute  { language, code, input }
  │  Authorization: Bearer <jwt>
  │
  ▼
NestJS (ExecutionService)
  │
  ├── 1. Validate JWT
  │      Decode token → extract userId
  │
  ├── 2. Rate limit check
  │      In-memory counter per userId
  │         → Exceeded → 429 Too Many Requests
  │
  ├── 3. Validate request body
  │      language in enum?  code < 64KB?  input < 8KB?
  │
  ├── 4. Spawn Docker container
  │      docker run --network none --memory 128m --cpus 0.5
  │      → Write code to /tmp/main.<ext>
  │      → Pipe input as stdin
  │      → Set 5s timeout watchdog
  │
  ├── 5. Stream output
  │      stdout/stderr → WebSocket → Client (real-time)
  │
  ├── 6. Container exits (or is killed)
  │      Collect: output, stderr, exitCode, executionTime, memory
  │
  ├── 7. Save execution record
  │      INSERT INTO ExecutionHistory
  │         userId, snippetId (or null), language,
  │         code, input, output, stderr, success,
  │         exitCode, executionTime, memory, errorType
  │
  └── 8. Return result to client
         { success, output, stderr, executionTime, ... }

Tables Read:    (none — execution doesn't query DB first)
Tables Written: ✏️  ExecutionHistory  (INSERT)
```

---

## 7. Data Flow: OAuth Login (Google)

Shows the database operations for Google Sign-In.

```
Client
  │
  │  POST /auth/google  { googleToken }
  │
  ▼
NestJS (AuthService)
  │
  ├── 1. Verify Google token
  │      Call Google tokeninfo API → { sub, email, name }
  │         → Invalid → 400 Invalid Token
  │
  ├── 2. Look up existing OAuth link
  │      SELECT User FROM OAuthAccount
  │      WHERE provider='google' AND providerUserId = $sub
  │
  ├── 3a. EXISTING USER PATH
  │      └── Update OAuthAccount tokens (accessToken, updatedAt)
  │          UPDATE OAuthAccount SET accessToken=... WHERE id=...
  │          → Skip to step 5
  │
  ├── 3b. NEW USER PATH
  │      └── Create User + OAuthAccount in a transaction
  │          BEGIN
  │            INSERT INTO User   → new user row
  │            INSERT INTO OAuthAccount → new link row
  │          COMMIT
  │
  ├── 4. Issue JWT + refresh token
  │      INSERT INTO RefreshToken → new token row
  │
  └── 5. Return to client
         { id, email, token, refreshToken, isNewUser }

Tables Read:    🔍 OAuthAccount (SELECT)
Tables Written: ✏️  User (INSERT if new)
                ✏️  OAuthAccount (INSERT or UPDATE)
                ✏️  RefreshToken (INSERT)
```

---

## 8. Token Lifecycle Diagram

State machine for RefreshToken records.

```
                    ┌─────────────────────────────┐
                    │          ISSUED              │
                    │   isRevoked = false          │
                    │   expiresAt = NOW() + 7d     │
                    └──────────────┬──────────────-┘
                                   │
              ┌────────────────────┼─────────────────────┐
              │                    │                     │
              ▼                    ▼                     ▼
    ┌─────────────────┐  ┌──────────────────┐  ┌──────────────────┐
    │    REFRESHED    │  │    EXPIRED       │  │    REVOKED       │
    │                 │  │                  │  │                  │
    │ Old row deleted │  │ expiresAt < NOW()│  │ isRevoked = true │
    │ New row inserted│  │ (naturally done) │  │ (logout action)  │
    └────────┬────────┘  └──────────────────┘  └──────────────────┘
             │                    │                     │
             ▼                    └─────────┬───────────┘
    Back to ISSUED                          ▼
                                   ┌──────────────────┐
                                   │  CLEANUP JOB     │
                                   │  DELETE FROM     │
                                   │  RefreshToken    │
                                   │  WHERE expired   │
                                   │  OR revoked      │
                                   └──────────────────┘
```

---

## 9. Soft Delete State Diagram

State transitions for entities with `deletedAt`.

```
Applies to: User, CodeSnippet

                        ┌────────────────────────────┐
                        │          ACTIVE             │
                        │   deletedAt IS NULL         │
                        │   Visible in all queries    │
                        └───────────────┬─────────────┘
                                        │
                                        │ User requests deletion
                                        │ SET deletedAt = NOW()
                                        │
                                        ▼
                        ┌────────────────────────────┐
                        │         SOFT DELETED        │
                        │   deletedAt IS NOT NULL     │
                        │   Filtered out by default   │
                        │   Still in database         │
                        └───────────────┬─────────────┘
                                        │
                                        │ (future: admin restore)
                                        │ SET deletedAt = NULL
                                        │
                                        ▼
                                 Back to ACTIVE


When User is soft-deleted:
  ┌─────────────────────────────────────────────────┐
  │  User.deletedAt          SET = NOW()            │
  │  CodeSnippet.deletedAt   SET = NOW() (all)      │
  │  RefreshToken.isRevoked  SET = true (all)       │
  │  ExecutionHistory        UNTOUCHED (immutable)  │
  │  OAuthAccount            UNTOUCHED              │
  └─────────────────────────────────────────────────┘
```

---

## 10. Index Coverage Map

Visual map of which indexes cover which query patterns.

```
QUERY PATTERN                          INDEX USED
─────────────────────────────────────────────────────────────

Login — find user by email
  WHERE email = $1 AND deletedAt IS NULL
  ├── email          → users_email_key (UNIQUE) ✅
  └── deletedAt      → users_deleted_at_idx ✅

List user's snippets
  WHERE userId = $1 AND deletedAt IS NULL ORDER BY createdAt DESC
  └── userId + deletedAt → snippets_user_deleted_idx (COMPOSITE) ✅

Filter snippets by language
  WHERE userId = $1 AND language = $2 AND deletedAt IS NULL
  ├── userId         → snippets_user_id_idx ✅
  └── language       → snippets_language_idx ✅

Sort snippets by newest
  ORDER BY createdAt DESC
  └── createdAt      → snippets_created_at_idx ✅

Search snippets by tag
  WHERE tags @> '["python"]'
  └── tags           → snippets_tags_idx (GIN) ✅

User's execution history
  WHERE userId = $1 ORDER BY createdAt DESC
  └── userId + createdAt → exechist_user_created_idx (COMPOSITE) ✅

Runs of a specific snippet
  WHERE snippetId = $1 ORDER BY createdAt DESC
  └── snippetId      → exechist_snippet_id_idx ✅

Validate a refresh token
  WHERE token = $1
  └── token          → refresh_token_key (UNIQUE) ✅

Revoke all user's tokens
  WHERE userId = $1
  └── userId         → refresh_user_id_idx ✅

Weekly cleanup job
  WHERE expiresAt < NOW() OR isRevoked = true
  └── expiresAt      → refresh_expires_idx ✅

Google OAuth login
  WHERE provider = $1 AND providerUserId = $2
  └── provider + providerUserId → oauth_provider_uid_key (UNIQUE COMPOSITE) ✅

─────────────────────────────────────────────────────────────
ALL critical query patterns are covered by indexes ✅
```

---

*Document: `DATABASE_DIAGRAMS.md` — CodeVerse v1.0*
