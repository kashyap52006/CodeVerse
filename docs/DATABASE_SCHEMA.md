# DATABASE SCHEMA — CodeVerse

> **Version:** 1.0.0
> **Date:** July 8, 2026
> **ORM:** Prisma 5.x
> **Database:** PostgreSQL 16.x
> **Status:** Approved — Ready for Implementation

---

## Table of Contents

1. [Overview](#1-overview)
2. [Entity Summary](#2-entity-summary)
3. [Entity: User](#3-entity-user)
4. [Entity: CodeSnippet](#4-entity-codesnippet)
5. [Entity: ExecutionHistory](#5-entity-executionhistory)
6. [Entity: RefreshToken](#6-entity-refreshtoken)
7. [Entity: OAuthAccount](#7-entity-oauthaccount)
8. [Relationships](#8-relationships)
9. [Index Strategy](#9-index-strategy)
10. [Soft Delete Strategy](#10-soft-delete-strategy)
11. [Normalization](#11-normalization)
12. [Query Examples](#12-query-examples)
13. [Security & Encryption](#13-security--encryption)

---

## 1. Overview

| Property | Value |
|---|---|
| **Primary Keys** | UUID v4 on all tables |
| **Timestamps** | `TIMESTAMPTZ` (UTC) |
| **Soft Delete** | `deletedAt` on `User` and `CodeSnippet` |
| **String Encoding** | UTF-8 |
| **JSON** | PostgreSQL `JSONB` for tags |
| **Enums** | Prisma enums → PostgreSQL native enums |

---

## 2. Entity Summary

| Entity | Purpose | Soft Delete | Immutable |
|---|---|---|---|
| `User` | Registered user accounts | Yes | No |
| `CodeSnippet` | User-saved code programs | Yes | No |
| `ExecutionHistory` | Record of every code run | No | **Yes** |
| `RefreshToken` | Long-lived session tokens | No (revoked) | No |
| `OAuthAccount` | Google OAuth linkage | No | No |

---

## 3. Entity: User

Central entity. Every other table references it.

### Field Definitions

| Column | Type | Null | Default | Constraint | Description |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PRIMARY KEY | Unique identifier |
| `email` | `VARCHAR(255)` | NO | — | UNIQUE | Login; stored lowercase |
| `password` | `VARCHAR(255)` | **YES** | NULL | — | bcrypt hash; NULL for OAuth-only users |
| `firstName` | `VARCHAR(100)` | NO | — | — | First name |
| `lastName` | `VARCHAR(100)` | NO | — | — | Last name |
| `profilePicture` | `VARCHAR(1024)` | YES | NULL | — | URL to avatar image |
| `bio` | `TEXT` | YES | NULL | — | Short description |
| `createdAt` | `TIMESTAMPTZ` | NO | `NOW()` | — | Account creation time |
| `updatedAt` | `TIMESTAMPTZ` | NO | `NOW()` | — | Last profile update |
| `deletedAt` | `TIMESTAMPTZ` | YES | NULL | — | NULL = active; SET = soft-deleted |

### Indexes

| Index Name | Type | Column(s) |
|---|---|---|
| `users_pkey` | PRIMARY | `id` |
| `users_email_key` | UNIQUE | `email` |
| `users_deleted_at_idx` | BTREE | `deletedAt` |

### Validation Rules

| Field | Rule |
|---|---|
| `email` | RFC 5322 format; max 254 chars |
| `password` | Min 8 chars; uppercase, lowercase, digit, special char |
| `firstName` | 1–50 characters |
| `lastName` | 1–50 characters |
| `bio` | Max 500 characters |

---

## 4. Entity: CodeSnippet

Stores all code programs a user saves. Supports soft delete so execution history remains intact after a snippet is deleted.

### Field Definitions

| Column | Type | Null | Default | Constraint | Description |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PRIMARY KEY | Unique identifier |
| `userId` | `UUID` | NO | — | FK → User.id | Owner of the snippet |
| `title` | `VARCHAR(255)` | NO | — | — | Human-readable name |
| `description` | `TEXT` | YES | NULL | — | Optional longer explanation |
| `language` | `VARCHAR(50)` | NO | — | ENUM | Execution language |
| `code` | `TEXT` | NO | — | Max 64 KB | Program source code |
| `input` | `TEXT` | YES | NULL | Max 8 KB | Pre-supplied stdin |
| `tags` | `JSONB` | NO | `'[]'` | — | Array of tag strings |
| `isPublic` | `BOOLEAN` | NO | `false` | — | Reserved for future sharing |
| `viewCount` | `INTEGER` | NO | `0` | — | Reserved for analytics |
| `createdAt` | `TIMESTAMPTZ` | NO | `NOW()` | — | Creation time |
| `updatedAt` | `TIMESTAMPTZ` | NO | `NOW()` | — | Last edit time |
| `deletedAt` | `TIMESTAMPTZ` | YES | NULL | — | Soft delete |

### Language Enum

```
python | javascript | c | cpp | java
```

### Indexes

| Index Name | Type | Column(s) | Optimises |
|---|---|---|---|
| `snippets_pkey` | PRIMARY | `id` | Lookup by ID |
| `snippets_user_id_idx` | BTREE | `userId` | List user's snippets |
| `snippets_language_idx` | BTREE | `language` | Filter by language |
| `snippets_created_at_idx` | BTREE | `createdAt DESC` | Sort by newest |
| `snippets_user_deleted_idx` | COMPOSITE | `userId, deletedAt` | Active snippets by user |
| `snippets_tags_idx` | GIN | `tags` | JSON array search |

### Validation Rules

| Field | Rule |
|---|---|
| `title` | 3–100 characters |
| `description` | Max 500 characters |
| `language` | Must be one of the enum values |
| `code` | Max 64 KB |
| `input` | Max 8 KB |
| `tags` | Max 10 items; each max 30 characters |

---

## 5. Entity: ExecutionHistory

**Immutable.** Every code run creates one record. Never updated, never soft-deleted. Stores its own copy of code and input because the original snippet may be edited or deleted.

### Field Definitions

| Column | Type | Null | Default | Constraint | Description |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PRIMARY KEY | Unique identifier |
| `userId` | `UUID` | NO | — | FK → User.id | Who executed |
| `snippetId` | `UUID` | **YES** | NULL | FK → CodeSnippet.id | Source snippet; NULL if run without saving |
| `language` | `VARCHAR(50)` | NO | — | ENUM | Language used for this run |
| `code` | `TEXT` | NO | — | — | Exact code that was executed |
| `input` | `TEXT` | YES | NULL | — | Exact stdin provided |
| `output` | `TEXT` | YES | NULL | — | Full stdout captured |
| `stderr` | `TEXT` | YES | NULL | — | Full stderr captured |
| `success` | `BOOLEAN` | NO | — | — | `true` = exit code 0 |
| `exitCode` | `INTEGER` | YES | NULL | — | Process exit code |
| `executionTime` | `DECIMAL(10,3)` | NO | `0` | >= 0 | Wall-clock time in seconds |
| `memory` | `INTEGER` | YES | NULL | >= 0 | Peak memory in MB |
| `errorType` | `VARCHAR(100)` | YES | NULL | ENUM | Error classification |
| `createdAt` | `TIMESTAMPTZ` | NO | `NOW()` | — | When executed |

### Error Type Enum

| Value | Meaning |
|---|---|
| `NULL` | Successful execution — no error |
| `CompilationError` | Failed to compile (C, C++, Java) |
| `RuntimeError` | Exception or crash during execution |
| `Timeout` | Killed after exceeding time limit |
| `MemoryError` | Killed after exceeding memory limit |

### Why Code Is Stored Here

This is the only intentional denormalization in the schema:

| Without Storing Code | With Storing Code |
|---|---|
| History loses code when snippet is deleted | History always shows exactly what ran |
| History shows wrong code after snippet is edited | History is always accurate |
| Audit is broken | Audit is complete and immutable |

### Indexes

| Index Name | Type | Column(s) | Optimises |
|---|---|---|---|
| `exechist_pkey` | PRIMARY | `id` | Lookup by ID |
| `exechist_user_id_idx` | BTREE | `userId` | User's history list |
| `exechist_snippet_id_idx` | BTREE | `snippetId` | Runs for a specific snippet |
| `exechist_created_at_idx` | BTREE | `createdAt DESC` | Sort by newest |
| `exechist_user_created_idx` | COMPOSITE | `userId, createdAt DESC` | Paginated history per user |

---

## 6. Entity: RefreshToken

Enables long-lived sessions and safe logout. JWTs alone cannot be invalidated server-side — this table provides revocation capability.

### Field Definitions

| Column | Type | Null | Default | Constraint | Description |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PRIMARY KEY | Unique identifier |
| `userId` | `UUID` | NO | — | FK → User.id | Token owner |
| `token` | `VARCHAR(1024)` | NO | — | UNIQUE | SHA-256 hash of token value |
| `expiresAt` | `TIMESTAMPTZ` | NO | — | — | Expiry time (+7 days from issue) |
| `createdAt` | `TIMESTAMPTZ` | NO | `NOW()` | — | When issued |
| `isRevoked` | `BOOLEAN` | NO | `false` | — | `true` = invalidated by logout |

### Token Lifecycle

```
Login      →  INSERT: isRevoked=false, expiresAt=NOW()+7days
Refresh    →  DELETE old row, INSERT new row
Logout     →  UPDATE SET isRevoked=true
Cleanup    →  DELETE WHERE expiresAt < NOW() OR isRevoked=true
```

### Indexes

| Index Name | Type | Column(s) | Optimises |
|---|---|---|---|
| `refresh_pkey` | PRIMARY | `id` | Lookup by ID |
| `refresh_token_key` | UNIQUE | `token` | Token validation |
| `refresh_user_id_idx` | BTREE | `userId` | Revoke all user tokens |
| `refresh_expires_idx` | BTREE | `expiresAt` | Weekly cleanup job |

---

## 7. Entity: OAuthAccount

Links a CodeVerse user to one or more OAuth providers. Designed to support multiple providers per user.

### Field Definitions

| Column | Type | Null | Default | Constraint | Description |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PRIMARY KEY | Unique identifier |
| `userId` | `UUID` | NO | — | FK → User.id | Linked CodeVerse user |
| `provider` | `VARCHAR(50)` | NO | — | ENUM | OAuth provider name |
| `providerUserId` | `VARCHAR(255)` | NO | — | — | User ID from the provider |
| `accessToken` | `VARCHAR(1024)` | NO | — | AES-256 encrypted | Provider access token |
| `refreshToken` | `VARCHAR(1024)` | YES | NULL | AES-256 encrypted | Provider refresh token |
| `tokenExpiresAt` | `TIMESTAMPTZ` | YES | NULL | — | When provider token expires |
| `createdAt` | `TIMESTAMPTZ` | NO | `NOW()` | — | When linked |
| `updatedAt` | `TIMESTAMPTZ` | NO | `NOW()` | — | Last token refresh |

### Provider Enum

```
google | github | microsoft
```

*(Only `google` implemented in v1.0)*

### Composite Unique Constraint

```sql
UNIQUE (provider, providerUserId)
```

One Google account can only link to one CodeVerse account.

### Indexes

| Index Name | Type | Column(s) | Optimises |
|---|---|---|---|
| `oauth_pkey` | PRIMARY | `id` | Lookup by ID |
| `oauth_provider_uid_key` | UNIQUE COMPOSITE | `provider, providerUserId` | OAuth login lookup |
| `oauth_user_id_idx` | BTREE | `userId` | List user's OAuth links |

---

## 8. Relationships

| Parent | Cardinality | Child | FK Column | On Delete |
|---|---|---|---|---|
| `User` | 1 → N | `CodeSnippet` | `CodeSnippet.userId` | RESTRICT |
| `User` | 1 → N | `ExecutionHistory` | `ExecutionHistory.userId` | RESTRICT |
| `User` | 1 → N | `RefreshToken` | `RefreshToken.userId` | CASCADE |
| `User` | 1 → N | `OAuthAccount` | `OAuthAccount.userId` | CASCADE |
| `CodeSnippet` | 1 → N | `ExecutionHistory` | `ExecutionHistory.snippetId` | SET NULL |

### On Delete Behaviour

| Behaviour | Applied To | Reason |
|---|---|---|
| `RESTRICT` | User → CodeSnippet | Soft-delete the user first; don't cascade-wipe snippets |
| `RESTRICT` | User → ExecutionHistory | Execution records must be preserved for audit |
| `CASCADE` | User → RefreshToken | Sessions are meaningless without the user |
| `CASCADE` | User → OAuthAccount | OAuth links are meaningless without the user |
| `SET NULL` | CodeSnippet → ExecutionHistory | History remains; snippet reference becomes NULL |

---

## 9. Index Strategy

### Complete Index Table

| Table | Index | Type | Columns | Purpose |
|---|---|---|---|---|
| User | PK | PRIMARY | `id` | Lookup by ID |
| User | UNIQUE | UNIQUE | `email` | Login, registration |
| User | `deleted_at_idx` | BTREE | `deletedAt` | Exclude soft-deleted |
| CodeSnippet | PK | PRIMARY | `id` | Lookup by ID |
| CodeSnippet | `user_id_idx` | BTREE | `userId` | List user's snippets |
| CodeSnippet | `language_idx` | BTREE | `language` | Filter by language |
| CodeSnippet | `created_at_idx` | BTREE | `createdAt DESC` | Sort newest first |
| CodeSnippet | `user_deleted_idx` | COMPOSITE | `userId, deletedAt` | Active snippets by user |
| CodeSnippet | `tags_idx` | GIN | `tags` | JSON array containment |
| ExecutionHistory | PK | PRIMARY | `id` | Lookup by ID |
| ExecutionHistory | `user_id_idx` | BTREE | `userId` | User's history |
| ExecutionHistory | `snippet_id_idx` | BTREE | `snippetId` | Runs per snippet |
| ExecutionHistory | `created_at_idx` | BTREE | `createdAt DESC` | Sort newest first |
| ExecutionHistory | `user_created_idx` | COMPOSITE | `userId, createdAt DESC` | Paginated history |
| RefreshToken | PK | PRIMARY | `id` | Lookup by ID |
| RefreshToken | `token_key` | UNIQUE | `token` | Token validation |
| RefreshToken | `user_id_idx` | BTREE | `userId` | Revoke user tokens |
| RefreshToken | `expires_idx` | BTREE | `expiresAt` | Cleanup job |
| OAuthAccount | PK | PRIMARY | `id` | Lookup by ID |
| OAuthAccount | `provider_uid_key` | UNIQUE COMPOSITE | `provider, providerUserId` | OAuth login |
| OAuthAccount | `user_id_idx` | BTREE | `userId` | User's OAuth links |

---

## 10. Soft Delete Strategy

### Active vs Deleted Record

```sql
-- Active:  deletedAt IS NULL
-- Deleted: deletedAt = <timestamp of deletion>
```

### Query Pattern (Always append this filter)

```sql
-- Correct: excludes soft-deleted records
SELECT * FROM "User" WHERE "deletedAt" IS NULL;

-- Incorrect: may return deleted records
SELECT * FROM "User";
```

### Account Deletion Sequence

```
User requests account deletion
        │
        ├── SET User.deletedAt = NOW()
        ├── SET CodeSnippet.deletedAt = NOW() (all user's snippets)
        ├── SET RefreshToken.isRevoked = true (all user's tokens)
        └── ExecutionHistory → untouched (immutable audit trail)
```

### Prisma Middleware (Auto-filter deleted records)

```typescript
prisma.$use(async (params, next) => {
  const softDeleteModels = ['User', 'CodeSnippet'];
  if (softDeleteModels.includes(params.model ?? '')) {
    if (['findFirst', 'findMany', 'findUnique'].includes(params.action)) {
      params.args.where = { ...params.args.where, deletedAt: null };
    }
  }
  return next(params);
});
```

---

## 11. Normalization

### Normal Form Status

| Form | Status | Notes |
|---|---|---|
| 1NF | ✅ Achieved | All atomic values; `tags` is JSONB (structured array) |
| 2NF | ✅ Achieved | All single-column PKs; no partial dependencies |
| 3NF | ✅ Achieved | No transitive dependencies |

### Intentional Denormalization in ExecutionHistory

| Denormalized Field | Why Stored Here Instead of Derived |
|---|---|
| `language` | Snippet language may change after execution |
| `code` | Snippet may be deleted after execution |
| `input` | Snippet input may change after execution |

These are **deliberate** exceptions for data immutability, not design mistakes.

---

## 12. Query Examples

### Q1 — List user's active snippets (paginated)

```sql
SELECT id, title, language, tags, "createdAt", "updatedAt"
FROM "CodeSnippet"
WHERE "userId" = $1 AND "deletedAt" IS NULL
ORDER BY "createdAt" DESC
LIMIT $2 OFFSET $3;
```

### Q2 — User execution history (last 20)

```sql
SELECT id, "snippetId", language, success, "exitCode", "executionTime", "createdAt"
FROM "ExecutionHistory"
WHERE "userId" = $1
ORDER BY "createdAt" DESC
LIMIT 20 OFFSET 0;
```

### Q3 — Login — find user by email

```sql
SELECT id, email, password, "firstName", "lastName"
FROM "User"
WHERE email = LOWER($1) AND "deletedAt" IS NULL;
```

### Q4 — Authorisation check (user owns snippet?)

```sql
SELECT id FROM "CodeSnippet"
WHERE id = $1 AND "userId" = $2 AND "deletedAt" IS NULL;
-- No row returned → 403 Forbidden
```

### Q5 — All runs of a specific snippet

```sql
SELECT id, success, "exitCode", "executionTime", "errorType", "createdAt"
FROM "ExecutionHistory"
WHERE "snippetId" = $1
ORDER BY "createdAt" DESC;
```

### Q6 — Validate a refresh token

```sql
SELECT id, "userId", "isRevoked", "expiresAt"
FROM "RefreshToken"
WHERE token = $1;
-- Then in app: check isRevoked=false AND expiresAt > NOW()
```

### Q7 — Google OAuth login (find or create)

```sql
-- Step 1: Find existing
SELECT u.* FROM "OAuthAccount" oa
JOIN "User" u ON oa."userId" = u.id
WHERE oa.provider = 'google' AND oa."providerUserId" = $1
  AND u."deletedAt" IS NULL;

-- Step 2 (if not found): Create user + link in a transaction
BEGIN;
  INSERT INTO "User" (id, email, "firstName", "lastName", "createdAt", "updatedAt")
  VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW());
  INSERT INTO "OAuthAccount" (id, "userId", provider, "providerUserId", ...)
  VALUES (gen_random_uuid(), <new_user_id>, 'google', $4, ...);
COMMIT;
```

### Q8 — Filter snippets by language

```sql
SELECT id, title, language, "createdAt"
FROM "CodeSnippet"
WHERE "userId" = $1 AND language = $2 AND "deletedAt" IS NULL
ORDER BY "createdAt" DESC
LIMIT $3 OFFSET $4;
```

### Q9 — Search snippets by title

```sql
SELECT id, title, language, "createdAt"
FROM "CodeSnippet"
WHERE "userId" = $1 AND "deletedAt" IS NULL
  AND LOWER(title) LIKE LOWER($2)
ORDER BY "createdAt" DESC
LIMIT $3 OFFSET $4;
-- $2 = '%searchterm%'
```

### Q10 — Weekly token cleanup job

```sql
DELETE FROM "RefreshToken"
WHERE "expiresAt" < NOW() OR "isRevoked" = true;
```

---

## 13. Security & Encryption

### Hashing vs Encryption

| Field | Method | Reversible | Reason |
|---|---|---|---|
| `User.password` | bcrypt (cost 12) | No | Passwords must be one-way hashed |
| `RefreshToken.token` | SHA-256 | No | Token never needs decryption |
| `OAuthAccount.accessToken` | AES-256-GCM | Yes | Must be decryptable to call OAuth APIs |
| `OAuthAccount.refreshToken` | AES-256-GCM | Yes | Must be decryptable to refresh OAuth |

### PII Classification

| Field | PII Level | Protection |
|---|---|---|
| `User.email` | High | Never logged; never returned in list APIs |
| `User.firstName / lastName` | Medium | Returned only to authenticated owner |
| `User.bio` | Low | User-controlled content |
| `ExecutionHistory.code` | Medium | Never returned to other users |

---

*Document: `DATABASE_SCHEMA.md` — CodeVerse v1.0*
