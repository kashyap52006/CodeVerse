# CodeVerse — Database Schema Design Document

> **Version:** 1.0.0
> **Date:** July 8, 2026
> **Status:** Approved — Ready for Implementation
> **Audience:** Backend Developers, Database Engineers
> **ORM Target:** Prisma + PostgreSQL

---

## Table of Contents

1. [Overview](#1-overview)
2. [Entity-Relationship Diagram](#2-entity-relationship-diagram)
3. [Entity Definitions](#3-entity-definitions)
   - [User](#31-user)
   - [CodeSnippet](#32-codesnippet)
   - [ExecutionHistory](#33-executionhistory)
   - [RefreshToken](#34-refreshtoken)
   - [OAuthAccount](#35-oauthaccount)
4. [Relationships & Cardinality](#4-relationships--cardinality)
5. [Normalization Analysis](#5-normalization-analysis)
6. [Index Strategy](#6-index-strategy)
7. [Soft Delete Strategy](#7-soft-delete-strategy)
8. [Query Examples](#8-query-examples)
9. [Security & Privacy](#9-security--privacy)
10. [Prisma Schema](#10-prisma-schema)
11. [Future Scalability](#11-future-scalability)

---

## 1. Overview

### Database Technology

| Property | Value |
|---|---|
| **Database** | PostgreSQL 16.x |
| **ORM** | Prisma 5.x |
| **ID Strategy** | UUID v4 (all primary keys) |
| **Timestamp Strategy** | UTC, stored as `TIMESTAMP WITH TIME ZONE` |
| **String Encoding** | UTF-8 |
| **Soft Delete** | `deletedAt` column (Users and Snippets) |
| **Normalization** | Third Normal Form (3NF) with one intentional denormalization |

### Entity Summary

| Entity | Purpose | Rows (Expected) |
|---|---|---|
| `User` | Account storage | Low (10–50) |
| `CodeSnippet` | User's saved code | Medium (100–1000) |
| `ExecutionHistory` | Immutable run records | High (10,000+) |
| `RefreshToken` | Session management | Low-Medium |
| `OAuthAccount` | Google OAuth linkage | Low |

---

## 2. Entity-Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CodeVerse Database                             │
└─────────────────────────────────────────────────────────────────────────┘

  ┌───────────────────────────┐
  │           User            │
  ├───────────────────────────┤
  │ PK  id          UUID      │
  │     email       VARCHAR   │◄── UNIQUE
  │     password    VARCHAR   │
  │     firstName   VARCHAR   │
  │     lastName    VARCHAR   │
  │     profilePic  VARCHAR   │
  │     bio         TEXT      │
  │     createdAt   TIMESTAMP │
  │     updatedAt   TIMESTAMP │
  │     deletedAt   TIMESTAMP │◄── NULL = active
  └──────────┬────────────────┘
             │
             │ 1
             │
     ┌───────┴──────────────────────────────────────────┐
     │               │                │                 │
     │ many          │ many           │ many            │ many
     ▼               ▼                ▼                 ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ CodeSnippet  │ │ExecutionHist │ │ RefreshToken │ │ OAuthAccount │
├──────────────┤ ├──────────────┤ ├──────────────┤ ├──────────────┤
│ PK id  UUID  │ │ PK id  UUID  │ │ PK id  UUID  │ │ PK id  UUID  │
│ FK userId    │ │ FK userId    │ │ FK userId    │ │ FK userId    │
│    title     │ │ FK snippetId │ │    token     │ │    provider  │
│    language  │ │    language  │ │    expiresAt │ │ providerUID  │
│    code      │ │    code      │ │    isRevoked │ │ accessToken  │
│    input     │ │    input     │ │    createdAt │ │ refreshToken │
│    tags      │ │    output    │ └──────────────┘ │ tokenExpires │
│    isPublic  │ │    stderr    │                  │    createdAt │
│    viewCount │ │    success   │                  │    updatedAt │
│    createdAt │ │    exitCode  │                  └──────────────┘
│    updatedAt │ │    execTime  │
│    deletedAt │ │    memory    │
└──────┬───────┘ │    errorType │
       │         │    createdAt │
       │ 1       └──────┬───────┘
       │                │
       └──── many ──────┘
     (snippet has many execution records)
```

### Cardinality Summary

```
User         (1) ────────── (N) CodeSnippet
User         (1) ────────── (N) ExecutionHistory
User         (1) ────────── (N) RefreshToken
User         (1) ────────── (N) OAuthAccount
CodeSnippet  (1) ────────── (N) ExecutionHistory
```

---

## 3. Entity Definitions

---

### 3.1 User

Stores registered user accounts. The central entity — all other entities reference it.

#### Fields

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `email` | `VARCHAR(255)` | NOT NULL, UNIQUE | Login credential; stored lowercase |
| `password` | `VARCHAR(255)` | NULLABLE | bcrypt hash; NULL for OAuth-only users |
| `firstName` | `VARCHAR(100)` | NOT NULL | Display name — first |
| `lastName` | `VARCHAR(100)` | NOT NULL | Display name — last |
| `profilePicture` | `VARCHAR(1024)` | NULLABLE | URL to avatar image |
| `bio` | `TEXT` | NULLABLE | Short user description |
| `createdAt` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Account creation time |
| `updatedAt` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Last profile update |
| `deletedAt` | `TIMESTAMPTZ` | NULLABLE | NULL = active; SET = soft-deleted |

#### Design Decisions

| Decision | Reason |
|---|---|
| `password` is nullable | OAuth-only users (Google login) have no password |
| `email` stored lowercase | Prevents duplicate registrations from case variations |
| `deletedAt` soft delete | Preserves audit trail; execution history remains intact |
| `profilePicture` is a URL | Images stored externally (S3/CDN); only URL stored in DB |

#### Indexes

| Name | Type | Columns | Purpose |
|---|---|---|---|
| `users_pkey` | PRIMARY | `id` | Primary key lookup |
| `users_email_key` | UNIQUE | `email` | Login query; prevent duplicates |
| `users_deleted_at_idx` | INDEX | `deletedAt` | Filter out soft-deleted accounts |

---

### 3.2 CodeSnippet

Stores code programs saved by users. Supports soft delete so execution history is preserved after deletion.

#### Fields

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PRIMARY KEY | Unique identifier |
| `userId` | `UUID` | NOT NULL, FK → User.id | Owner of the snippet |
| `title` | `VARCHAR(255)` | NOT NULL | Human-readable name |
| `description` | `TEXT` | NULLABLE | Longer explanation |
| `language` | `VARCHAR(50)` | NOT NULL | Execution language |
| `code` | `TEXT` | NOT NULL | The program source code |
| `input` | `TEXT` | NULLABLE | Pre-supplied stdin |
| `tags` | `JSONB` | NULLABLE, DEFAULT '[]' | Array of tag strings |
| `isPublic` | `BOOLEAN` | NOT NULL, DEFAULT false | Reserved for future sharing |
| `viewCount` | `INTEGER` | NOT NULL, DEFAULT 0 | Reserved for future analytics |
| `createdAt` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Creation time |
| `updatedAt` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Last edit time |
| `deletedAt` | `TIMESTAMPTZ` | NULLABLE | Soft delete |

#### Language Enum Values

```
'python' | 'javascript' | 'c' | 'cpp' | 'java'
```

#### Why `tags` is JSONB (not a separate table)

For CodeVerse's scale (10–50 users, ~1000 snippets), a separate `Tag` table would add join complexity with no performance benefit. JSONB:
- Allows `WHERE tags @> '["python"]'` queries natively in PostgreSQL
- Stores arrays without a join table
- Can be indexed with a GIN index if needed later

#### Indexes

| Name | Type | Columns | Purpose |
|---|---|---|---|
| `snippets_pkey` | PRIMARY | `id` | Primary key lookup |
| `snippets_user_id_idx` | INDEX | `userId` | List user's snippets |
| `snippets_language_idx` | INDEX | `language` | Filter by language |
| `snippets_created_at_idx` | INDEX | `createdAt` | Sort by recent |
| `snippets_user_deleted_idx` | COMPOSITE INDEX | `userId, deletedAt` | Optimised active-snippet-by-user query |
| `snippets_tags_idx` | GIN INDEX | `tags` | JSON array containment queries |

---

### 3.3 ExecutionHistory

Immutable record of every code execution. Never soft-deleted. Stores a copy of the code and input because the snippet may be edited or deleted later.

#### Fields

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PRIMARY KEY | Unique identifier |
| `userId` | `UUID` | NOT NULL, FK → User.id | Who executed |
| `snippetId` | `UUID` | NULLABLE, FK → CodeSnippet.id | Source snippet; NULL if run without saving |
| `language` | `VARCHAR(50)` | NOT NULL | Language used |
| `code` | `TEXT` | NOT NULL | Exact code that was run |
| `input` | `TEXT` | NULLABLE | Exact stdin that was provided |
| `output` | `TEXT` | NULLABLE | Full stdout captured |
| `stderr` | `TEXT` | NULLABLE | Full stderr captured |
| `success` | `BOOLEAN` | NOT NULL | true = exit code 0 |
| `exitCode` | `INTEGER` | NULLABLE | Process exit code |
| `executionTime` | `DECIMAL(10,3)` | NOT NULL, DEFAULT 0 | Wall-clock time in seconds |
| `memory` | `INTEGER` | NULLABLE | Peak memory usage in MB |
| `errorType` | `VARCHAR(100)` | NULLABLE | Error classification |
| `createdAt` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | When executed |

#### Error Type Values

```
NULL               → No error (successful execution)
'CompilationError' → Code failed to compile (C, C++, Java)
'RuntimeError'     → Exception or crash during execution
'Timeout'          → Killed after exceeding time limit
'MemoryError'      → Killed after exceeding memory limit
```

#### Why Code Is Stored Here (Intentional Denormalization)

This is the only intentional denormalization in the schema.

| Concern | Without Storing Code | With Storing Code |
|---|---|---|
| Snippet deleted | History shows no code | History shows exact code run |
| Snippet edited | History shows new code, not what ran | History is accurate |
| Audit accuracy | Broken | Complete |
| Storage cost | Lower | Higher (acceptable at this scale) |

**Decision: Store the code.** Execution records must be immutable and self-contained.

#### Indexes

| Name | Type | Columns | Purpose |
|---|---|---|---|
| `exechist_pkey` | PRIMARY | `id` | Primary key lookup |
| `exechist_user_id_idx` | INDEX | `userId` | User's history list |
| `exechist_snippet_id_idx` | INDEX | `snippetId` | Runs for a specific snippet |
| `exechist_created_at_idx` | INDEX | `createdAt` | Sort by most recent |
| `exechist_user_created_idx` | COMPOSITE INDEX | `userId, createdAt DESC` | Optimised paginated history query |

---

### 3.4 RefreshToken

Stores active refresh tokens to support long-lived sessions and safe logout. JWTs cannot be invalidated server-side alone — this table provides revocation capability.

#### Fields

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PRIMARY KEY | Unique identifier |
| `userId` | `UUID` | NOT NULL, FK → User.id | Token owner |
| `token` | `VARCHAR(1024)` | NOT NULL, UNIQUE | The refresh token value (hashed) |
| `expiresAt` | `TIMESTAMPTZ` | NOT NULL | When this token expires (7 days) |
| `createdAt` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | When issued |
| `isRevoked` | `BOOLEAN` | NOT NULL, DEFAULT false | true = invalidated by logout |

#### Token Lifecycle

```
Issue          →  POST /auth/login or /auth/register
                  → Insert row: isRevoked=false, expiresAt=+7days

Rotate         →  POST /auth/refresh
                  → Delete old token row
                  → Insert new token row

Revoke (logout)→  POST /auth/logout
                  → Set isRevoked=true for this token

Cleanup        →  Scheduled job (weekly)
                  → DELETE WHERE expiresAt < NOW() OR isRevoked = true
```

#### Why Store the Token Hashed

The token value in the database should be stored as a SHA-256 hash. If the database is breached, raw tokens cannot be used to authenticate.

#### Indexes

| Name | Type | Columns | Purpose |
|---|---|---|---|
| `refresh_pkey` | PRIMARY | `id` | Primary key |
| `refresh_token_key` | UNIQUE | `token` | Lookup by token value |
| `refresh_user_id_idx` | INDEX | `userId` | Revoke all tokens for a user |
| `refresh_expires_idx` | INDEX | `expiresAt` | Cleanup job |

---

### 3.5 OAuthAccount

Links a CodeVerse user account to one or more OAuth provider accounts. Supports multiple providers per user.

#### Fields

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PRIMARY KEY | Unique identifier |
| `userId` | `UUID` | NOT NULL, FK → User.id | Linked CodeVerse user |
| `provider` | `VARCHAR(50)` | NOT NULL | OAuth provider name |
| `providerUserId` | `VARCHAR(255)` | NOT NULL | User ID from the provider |
| `accessToken` | `VARCHAR(1024)` | NOT NULL | AES-256 encrypted provider token |
| `refreshToken` | `VARCHAR(1024)` | NULLABLE | AES-256 encrypted refresh token |
| `tokenExpiresAt` | `TIMESTAMPTZ` | NULLABLE | When provider access token expires |
| `createdAt` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | When linked |
| `updatedAt` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Last token refresh |

#### Provider Enum Values

```
'google' | 'github' | 'microsoft'
```

*(Only Google is implemented in v1.0)*

#### Composite Unique Constraint

```sql
UNIQUE (provider, providerUserId)
```

A provider user ID can only be linked to one CodeVerse account. This prevents the same Google account from being attached to two different users.

#### Indexes

| Name | Type | Columns | Purpose |
|---|---|---|---|
| `oauth_pkey` | PRIMARY | `id` | Primary key |
| `oauth_provider_uid_key` | UNIQUE COMPOSITE | `provider, providerUserId` | One Google account → one user |
| `oauth_user_id_idx` | INDEX | `userId` | List all OAuth links for a user |

---

## 4. Relationships & Cardinality

### Full Relationship Table

| Parent Entity | Child Entity | Cardinality | FK Column | On Delete |
|---|---|---|---|---|
| `User` | `CodeSnippet` | One-to-Many | `CodeSnippet.userId` | RESTRICT |
| `User` | `ExecutionHistory` | One-to-Many | `ExecutionHistory.userId` | RESTRICT |
| `User` | `RefreshToken` | One-to-Many | `RefreshToken.userId` | CASCADE |
| `User` | `OAuthAccount` | One-to-Many | `OAuthAccount.userId` | CASCADE |
| `CodeSnippet` | `ExecutionHistory` | One-to-Many | `ExecutionHistory.snippetId` | SET NULL |

### On Delete Behaviour Explained

| Behaviour | Applied To | Reason |
|---|---|---|
| `RESTRICT` | User → CodeSnippet | Cannot delete a user with active snippets; use soft delete first |
| `RESTRICT` | User → ExecutionHistory | Execution records must be preserved even if user deletes account |
| `CASCADE` | User → RefreshToken | When user is deleted, all their sessions are also deleted |
| `CASCADE` | User → OAuthAccount | OAuth links are meaningless without the user |
| `SET NULL` | CodeSnippet → ExecutionHistory | When a snippet is deleted, history records remain but lose their snippet reference |

---

## 5. Normalization Analysis

### First Normal Form (1NF) ✅

- All columns contain atomic values
- No repeating groups
- `tags` is stored as JSONB — a deliberate PostgreSQL-native choice; logically it is a structured array

### Second Normal Form (2NF) ✅

- All tables have a single-column primary key (UUID)
- No partial dependencies (all non-key columns depend on the full PK)

### Third Normal Form (3NF) ✅

- No transitive dependencies
- `ExecutionHistory.language` could be derived from the snippet, but is stored directly because: the snippet's language may change; the history must be immutable

### Intentional Denormalization

| Table | Denormalized Field | Justification |
|---|---|---|
| `ExecutionHistory` | `language` | Snippet language may change; history must reflect what was run |
| `ExecutionHistory` | `code` | Snippet may be deleted; history must remain self-contained |
| `ExecutionHistory` | `input` | Same reason as code |

These are conscious exceptions to 3NF made for data integrity and immutability, not for performance.

---

## 6. Index Strategy

### All Indexes Across All Tables

| Table | Index Name | Type | Columns | Query Pattern |
|---|---|---|---|---|
| `User` | `users_pkey` | PRIMARY | `id` | Lookup by ID |
| `User` | `users_email_key` | UNIQUE | `email` | Login, registration |
| `User` | `users_deleted_at_idx` | BTREE | `deletedAt` | Filter active users |
| `CodeSnippet` | `snippets_pkey` | PRIMARY | `id` | Lookup by ID |
| `CodeSnippet` | `snippets_user_id_idx` | BTREE | `userId` | List user's snippets |
| `CodeSnippet` | `snippets_language_idx` | BTREE | `language` | Filter by language |
| `CodeSnippet` | `snippets_created_at_idx` | BTREE | `createdAt DESC` | Sort by newest |
| `CodeSnippet` | `snippets_user_deleted_idx` | BTREE COMPOSITE | `userId, deletedAt` | Active snippets by user |
| `CodeSnippet` | `snippets_tags_idx` | GIN | `tags` | JSON array search |
| `ExecutionHistory` | `exechist_pkey` | PRIMARY | `id` | Lookup by ID |
| `ExecutionHistory` | `exechist_user_id_idx` | BTREE | `userId` | User's history |
| `ExecutionHistory` | `exechist_snippet_id_idx` | BTREE | `snippetId` | Runs per snippet |
| `ExecutionHistory` | `exechist_created_at_idx` | BTREE | `createdAt DESC` | Sort by newest |
| `ExecutionHistory` | `exechist_user_created_idx` | BTREE COMPOSITE | `userId, createdAt DESC` | Paginated history |
| `RefreshToken` | `refresh_pkey` | PRIMARY | `id` | Lookup by ID |
| `RefreshToken` | `refresh_token_key` | UNIQUE | `token` | Validate token |
| `RefreshToken` | `refresh_user_id_idx` | BTREE | `userId` | Revoke all user tokens |
| `RefreshToken` | `refresh_expires_idx` | BTREE | `expiresAt` | Cleanup job |
| `OAuthAccount` | `oauth_pkey` | PRIMARY | `id` | Lookup by ID |
| `OAuthAccount` | `oauth_provider_uid_key` | UNIQUE COMPOSITE | `provider, providerUserId` | OAuth login lookup |
| `OAuthAccount` | `oauth_user_id_idx` | BTREE | `userId` | User's OAuth links |

---

## 7. Soft Delete Strategy

### Entities with Soft Delete

| Entity | Has Soft Delete | Strategy |
|---|---|---|
| `User` | Yes | `deletedAt` column |
| `CodeSnippet` | Yes | `deletedAt` column |
| `ExecutionHistory` | No | Immutable — never deleted |
| `RefreshToken` | No | Revoked with `isRevoked`; cleaned up by job |
| `OAuthAccount` | No | Hard delete on account disconnect |

### How Soft Delete Works

```sql
-- Active record:  deletedAt IS NULL
-- Deleted record: deletedAt = <timestamp>

-- Correct query (excludes soft-deleted):
SELECT * FROM "User" WHERE "deletedAt" IS NULL;

-- Incorrect (includes deleted users):
SELECT * FROM "User";
```

### Prisma Middleware for Automatic Soft Delete Filtering

In Prisma, a middleware is added to automatically append `WHERE deletedAt IS NULL` to all find queries on `User` and `CodeSnippet`. This prevents accidentally returning deleted records.

```typescript
// Applied globally in Prisma middleware:
if (params.model === 'User' || params.model === 'CodeSnippet') {
  if (params.action === 'findMany' || params.action === 'findFirst') {
    params.args.where = {
      ...params.args.where,
      deletedAt: null,
    };
  }
}
```

### Account Deletion Flow

```
User requests account deletion
          │
          ▼
SET User.deletedAt = NOW()          ← soft delete user
SET CodeSnippet.deletedAt = NOW()   ← soft delete all snippets
SET RefreshToken.isRevoked = true   ← invalidate all sessions
OAuthAccount: leave as-is           ← preserve for potential reactivation
ExecutionHistory: leave as-is       ← immutable; never deleted
```

---

## 8. Query Examples

All queries are written as parameterised SQL. In Prisma, these map to type-safe method calls.

---

### Q1 — List a user's active snippets (paginated, sorted newest first)

```sql
SELECT
  id, title, language, tags, "createdAt", "updatedAt"
FROM "CodeSnippet"
WHERE
  "userId" = $1
  AND "deletedAt" IS NULL
ORDER BY "createdAt" DESC
LIMIT $2 OFFSET $3;
```

**Prisma equivalent:**
```typescript
await prisma.codeSnippet.findMany({
  where: { userId, deletedAt: null },
  select: { id: true, title: true, language: true, tags: true, createdAt: true },
  orderBy: { createdAt: 'desc' },
  take: limit,
  skip: offset,
});
```

---

### Q2 — Get execution history for a user (last 20 runs)

```sql
SELECT
  id, "snippetId", language, success, "exitCode",
  "executionTime", "createdAt"
FROM "ExecutionHistory"
WHERE "userId" = $1
ORDER BY "createdAt" DESC
LIMIT 20 OFFSET 0;
```

---

### Q3 — Find user by email (login)

```sql
SELECT id, email, password, "firstName", "lastName"
FROM "User"
WHERE email = $1 AND "deletedAt" IS NULL;
```

---

### Q4 — Authorisation check (does user own this snippet?)

```sql
SELECT id FROM "CodeSnippet"
WHERE id = $1 AND "userId" = $2 AND "deletedAt" IS NULL;
```

**If no row returned → 403 Forbidden**

---

### Q5 — Get all execution runs for a specific snippet

```sql
SELECT
  id, success, "exitCode", "executionTime", memory, "errorType", "createdAt"
FROM "ExecutionHistory"
WHERE "snippetId" = $1
ORDER BY "createdAt" DESC;
```

---

### Q6 — Validate a refresh token

```sql
SELECT id, "userId", "isRevoked", "expiresAt"
FROM "RefreshToken"
WHERE token = $1;
-- Then check in application: isRevoked = false AND expiresAt > NOW()
```

---

### Q7 — Find or create user via Google OAuth

```sql
-- Step 1: Find existing OAuth link
SELECT u.*
FROM "OAuthAccount" oa
JOIN "User" u ON oa."userId" = u.id
WHERE oa.provider = 'google' AND oa."providerUserId" = $1
  AND u."deletedAt" IS NULL;

-- Step 2 (if not found): Create user + OAuthAccount in a transaction
BEGIN;
  INSERT INTO "User" (id, email, "firstName", "lastName", "createdAt", "updatedAt")
  VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW());

  INSERT INTO "OAuthAccount" (id, "userId", provider, "providerUserId", ...)
  VALUES (gen_random_uuid(), <new_user_id>, 'google', $4, ...);
COMMIT;
```

---

### Q8 — Filter snippets by language

```sql
SELECT id, title, language, "createdAt"
FROM "CodeSnippet"
WHERE "userId" = $1 AND language = $2 AND "deletedAt" IS NULL
ORDER BY "createdAt" DESC
LIMIT $3 OFFSET $4;
```

---

### Q9 — Search snippets by title (case-insensitive)

```sql
SELECT id, title, language, "createdAt"
FROM "CodeSnippet"
WHERE
  "userId" = $1
  AND "deletedAt" IS NULL
  AND LOWER(title) LIKE LOWER($2)  -- $2 = '%searchterm%'
ORDER BY "createdAt" DESC
LIMIT $3 OFFSET $4;
```

---

### Q10 — Token cleanup job (weekly)

```sql
DELETE FROM "RefreshToken"
WHERE "expiresAt" < NOW() OR "isRevoked" = true;
```

---

## 9. Security & Privacy

### What Is Hashed vs Encrypted

| Field | Method | Reason |
|---|---|---|
| `User.password` | bcrypt (one-way hash, cost 12) | One-way hash; cannot be reversed |
| `OAuthAccount.accessToken` | AES-256-GCM (application layer) | Must be decryptable to make OAuth API calls |
| `OAuthAccount.refreshToken` | AES-256-GCM (application layer) | Must be decryptable to refresh OAuth access |
| `RefreshToken.token` | SHA-256 hash | Token value never needs decryption |

### What Requires Validation

| Field | Rule | Enforced At |
|---|---|---|
| `User.email` | RFC 5322 email format | API + DB UNIQUE constraint |
| `User.password` | Min 8 chars, upper, lower, digit, special | API layer |
| `CodeSnippet.language` | Enum: python, javascript, c, cpp, java | API layer + DB CHECK |
| `CodeSnippet.code` | Max 64 KB | API layer (413 response) |
| `ExecutionHistory.executionTime` | `>= 0`, `<= 30` | Application layer |
| `ExecutionHistory.memory` | `>= 0`, `<= 512` | Application layer |
| `RefreshToken.expiresAt` | Must be in the future | Application layer |

### What Is Personally Identifiable Information (PII)

| Field | PII Level | Handling |
|---|---|---|
| `User.email` | High | Never logged; never exposed in list APIs |
| `User.firstName / lastName` | Medium | Returned only to authenticated user |
| `User.bio` | Low | User-controlled; optionally public |
| `User.profilePicture` | Low | URL only; no image data in DB |
| `ExecutionHistory.code` | Medium | Never exposed to other users |

### Database Access Controls

| Role | Permissions | Used By |
|---|---|---|
| `codeverse_app` | SELECT, INSERT, UPDATE, DELETE on all tables | NestJS application |
| `codeverse_readonly` | SELECT only | Monitoring, analytics (future) |
| `postgres` (superuser) | All | Migrations only; never used by app |

---

## 10. Prisma Schema

Complete, implementation-ready Prisma schema file.

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────

enum Language {
  python
  javascript
  c
  cpp
  java
}

enum OAuthProvider {
  google
  github
  microsoft
}

enum ErrorType {
  CompilationError
  RuntimeError
  Timeout
  MemoryError
}

// ─────────────────────────────────────────────────────────
// User
// ─────────────────────────────────────────────────────────

model User {
  id             String    @id @default(uuid()) @db.Uuid
  email          String    @unique @db.VarChar(255)
  password       String?   @db.VarChar(255)
  firstName      String    @db.VarChar(100)
  lastName       String    @db.VarChar(100)
  profilePicture String?   @db.VarChar(1024)
  bio            String?   @db.Text
  createdAt      DateTime  @default(now()) @db.Timestamptz
  updatedAt      DateTime  @updatedAt @db.Timestamptz
  deletedAt      DateTime? @db.Timestamptz

  // Relations
  snippets         CodeSnippet[]
  executionHistory ExecutionHistory[]
  refreshTokens    RefreshToken[]
  oauthAccounts    OAuthAccount[]

  // Indexes
  @@index([deletedAt])
  @@map("User")
}

// ─────────────────────────────────────────────────────────
// CodeSnippet
// ─────────────────────────────────────────────────────────

model CodeSnippet {
  id          String    @id @default(uuid()) @db.Uuid
  userId      String    @db.Uuid
  title       String    @db.VarChar(255)
  description String?   @db.Text
  language    Language
  code        String    @db.Text
  input       String?   @db.Text
  tags        Json      @default("[]") @db.JsonB
  isPublic    Boolean   @default(false)
  viewCount   Int       @default(0)
  createdAt   DateTime  @default(now()) @db.Timestamptz
  updatedAt   DateTime  @updatedAt @db.Timestamptz
  deletedAt   DateTime? @db.Timestamptz

  // Relations
  user             User               @relation(fields: [userId], references: [id], onDelete: Restrict)
  executionHistory ExecutionHistory[]

  // Indexes
  @@index([userId])
  @@index([language])
  @@index([createdAt(sort: Desc)])
  @@index([userId, deletedAt])
  @@map("CodeSnippet")
}

// ─────────────────────────────────────────────────────────
// ExecutionHistory
// ─────────────────────────────────────────────────────────

model ExecutionHistory {
  id            String     @id @default(uuid()) @db.Uuid
  userId        String     @db.Uuid
  snippetId     String?    @db.Uuid
  language      Language
  code          String     @db.Text
  input         String?    @db.Text
  output        String?    @db.Text
  stderr        String?    @db.Text
  success       Boolean
  exitCode      Int?
  executionTime Decimal    @default(0) @db.Decimal(10, 3)
  memory        Int?
  errorType     ErrorType?
  createdAt     DateTime   @default(now()) @db.Timestamptz

  // Relations
  user    User         @relation(fields: [userId], references: [id], onDelete: Restrict)
  snippet CodeSnippet? @relation(fields: [snippetId], references: [id], onDelete: SetNull)

  // Indexes
  @@index([userId])
  @@index([snippetId])
  @@index([createdAt(sort: Desc)])
  @@index([userId, createdAt(sort: Desc)])
  @@map("ExecutionHistory")
}

// ─────────────────────────────────────────────────────────
// RefreshToken
// ─────────────────────────────────────────────────────────

model RefreshToken {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @db.Uuid
  token     String   @unique @db.VarChar(1024)
  expiresAt DateTime @db.Timestamptz
  createdAt DateTime @default(now()) @db.Timestamptz
  isRevoked Boolean  @default(false)

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Indexes
  @@index([userId])
  @@index([expiresAt])
  @@map("RefreshToken")
}

// ─────────────────────────────────────────────────────────
// OAuthAccount
// ─────────────────────────────────────────────────────────

model OAuthAccount {
  id             String        @id @default(uuid()) @db.Uuid
  userId         String        @db.Uuid
  provider       OAuthProvider
  providerUserId String        @db.VarChar(255)
  accessToken    String        @db.VarChar(1024)
  refreshToken   String?       @db.VarChar(1024)
  tokenExpiresAt DateTime?     @db.Timestamptz
  createdAt      DateTime      @default(now()) @db.Timestamptz
  updatedAt      DateTime      @updatedAt @db.Timestamptz

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Unique: one Google account links to one CodeVerse user
  @@unique([provider, providerUserId])
  @@index([userId])
  @@map("OAuthAccount")
}
```

---

## 11. Future Scalability

The current schema supports all v1.0 features and is designed for clean extension.

### New Tables to Add Without Breaking Changes

| Future Feature | New Table | Links To |
|---|---|---|
| Public snippet gallery | `PublicSnippet` | `CodeSnippet.id` |
| Social follows | `UserFollow` | `User.id` (follower + followee) |
| Comments on snippets | `Comment` | `CodeSnippet.id`, `User.id` |
| Notifications | `Notification` | `User.id` |
| Admin roles | `UserRole` | `User.id` |
| GitHub OAuth | Add `'github'` to `OAuthProvider` enum | No new table |

### Columns to Add to Existing Tables

| Table | Future Column | Reason |
|---|---|---|
| `User` | `role` (ENUM: user, admin) | Access control |
| `CodeSnippet` | `forkCount` (INTEGER) | Snippet forking feature |
| `CodeSnippet` | `forkedFromId` (UUID, FK) | Track snippet lineage |
| `ExecutionHistory` | `containerId` (VARCHAR) | Debugging; trace to Docker container |

### Archiving Strategy (When ExecutionHistory grows large)

After 6 months, move records older than 90 days to an `ExecutionHistoryArchive` table. The application reads from both tables transparently. This prevents the main table from becoming too large to index efficiently.

---

*Document prepared for CodeVerse v1.0 — Database Schema Design*
*Implementation target: Prisma 5.x + PostgreSQL 16.x*
