# CodeVerse — REST API Specification

> **Version:** 1.0.0
> **Date:** July 8, 2026
> **Status:** Approved — Ready for Implementation
> **Audience:** Frontend Developers, Backend Developers, QA Engineers

---

## Table of Contents

1. [Overview](#1-overview)
2. [Authentication Strategy](#2-authentication-strategy)
3. [Rate Limiting](#3-rate-limiting)
4. [Error Format](#4-error-format)
5. [Pagination](#5-pagination)
6. [Validation Rules](#6-validation-rules)
7. [Authentication Endpoints](#7-authentication-endpoints)
8. [User Endpoints](#8-user-endpoints)
9. [Snippet Endpoints](#9-snippet-endpoints)
10. [Execution Endpoints](#10-execution-endpoints)
11. [History Endpoints](#11-history-endpoints)
12. [System Endpoints](#12-system-endpoints)
13. [HTTP Status Code Reference](#13-http-status-code-reference)
14. [Security Considerations](#14-security-considerations)
15. [Endpoint Summary Table](#15-endpoint-summary-table)

---

## 1. Overview

### Base Configuration

| Property | Value |
|---|---|
| **Base URL** | `http://localhost:3000/api` |
| **API Version** | `v1` |
| **Content Type** | `application/json` |
| **Authentication** | Bearer JWT in `Authorization` header |
| **Rate Limit** | 10 requests / minute / user |
| **Charset** | UTF-8 |
| **Timestamps** | ISO 8601 — `2026-01-01T12:00:00Z` |
| **IDs** | UUID v4 strings |

### Request Headers

Every request that requires authentication must include:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
Accept: application/json
```

---

## 2. Authentication Strategy

### JWT Token Flow

```
1. Client sends credentials  →  POST /auth/login
2. Server validates          →  issues Access Token (24h) + Refresh Token (7d)
3. Client stores tokens         (HTTP-only cookie or secure memory)
4. Client attaches Access Token to every protected request
5. When Access Token expires →  POST /auth/refresh with Refresh Token
6. Server issues a new Access Token
```

### Token Specifications

| Token | Lifetime | Storage Recommendation |
|---|---|---|
| **Access Token (JWT)** | 24 hours | HTTP-only cookie or memory (not localStorage) |
| **Refresh Token** | 7 days | HTTP-only cookie |

### Authorization Header Format

```http
Authorization: Bearer <access_token>
```

**Example:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLXV1aWQiLCJpYXQiOjE3MDQwNjcyMDAsImV4cCI6MTcwNDE1MzYwMH0.signature
```

### JWT Payload Structure

```json
{
  "sub": "3f7a1234-bc56-7890-de12-f34567890abc",
  "email": "user@example.com",
  "iat": 1704067200,
  "exp": 1704153600
}
```

---

## 3. Rate Limiting

All authenticated endpoints are rate-limited. Rate limit headers are returned on every response.

### Response Headers

```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1704110460
```

| Header | Description |
|---|---|
| `X-RateLimit-Limit` | Maximum requests allowed per window |
| `X-RateLimit-Remaining` | Requests remaining in current window |
| `X-RateLimit-Reset` | Unix timestamp when the window resets |

### When Limit Is Exceeded

**Response: `429 Too Many Requests`**

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Try again in 45 seconds.",
    "retryAfter": 45,
    "timestamp": "2026-07-08T10:00:00Z"
  }
}
```

---

## 4. Error Format

All error responses follow a consistent structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description",
    "details": {},
    "timestamp": "2026-07-08T10:00:00Z"
  }
}
```

| Field | Type | Description |
|---|---|---|
| `code` | `string` | Machine-readable error identifier (use in frontend switch statements) |
| `message` | `string` | Plain English description for display |
| `details` | `object` | Field-level errors for validation failures (optional) |
| `timestamp` | `string` | When the error occurred (ISO 8601) |

### Error Code Reference

| Code | HTTP Status | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Request body failed validation |
| `EMAIL_EXISTS` | 400 | Email already registered |
| `INVALID_CREDENTIALS` | 400 | Wrong email or password |
| `INVALID_TOKEN` | 400 | Malformed or expired token |
| `WEAK_PASSWORD` | 400 | Password does not meet requirements |
| `UNAUTHORIZED` | 401 | Missing or invalid Authorization header |
| `FORBIDDEN` | 403 | Authenticated but not permitted |
| `NOT_FOUND` | 404 | Resource does not exist |
| `EXECUTION_TIMEOUT` | 408 | Code exceeded time limit |
| `PAYLOAD_TOO_LARGE` | 413 | Code or input exceeds size limit |
| `UNPROCESSABLE` | 422 | Valid JSON but semantically wrong |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `SERVICE_UNAVAILABLE` | 503 | Docker or database is down |
| `MEMORY_LIMIT_EXCEEDED` | 507 | Code exceeded memory limit |

### Validation Error Example (Field-Level Details)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "email": "Must be a valid email address",
      "password": "Must be at least 8 characters with one number and one special character"
    },
    "timestamp": "2026-07-08T10:00:00Z"
  }
}
```

---

## 5. Pagination

List endpoints use **offset-based pagination**.

### Query Parameters

| Parameter | Type | Default | Max | Description |
|---|---|---|---|---|
| `limit` | `integer` | `10` | `100` | Items per page |
| `offset` | `integer` | `0` | — | Number of items to skip |

### Paginated Response Structure

```json
{
  "data": [],
  "total": 47,
  "limit": 10,
  "offset": 0
}
```

### Pagination Example

```
Total items: 47

Page 1: GET /snippets?limit=10&offset=0   → items 1–10
Page 2: GET /snippets?limit=10&offset=10  → items 11–20
Page 3: GET /snippets?limit=10&offset=20  → items 21–30
```

---

## 6. Validation Rules

### Password Rules

| Rule | Requirement |
|---|---|
| Minimum length | 8 characters |
| Maximum length | 128 characters |
| Uppercase | At least 1 uppercase letter |
| Lowercase | At least 1 lowercase letter |
| Number | At least 1 digit |
| Special character | At least 1 (`!@#$%^&*`) |

**Valid:** `SecurePass123!`
**Invalid:** `password`, `12345678`, `ALLCAPS1`

### Email Rules

- Standard format: `local@domain.tld`
- Maximum 254 characters
- Case-insensitive (stored lowercase)

### Code Submission Rules

| Field | Limit |
|---|---|
| Code size | Max 64 KB |
| Input (stdin) size | Max 8 KB |
| Snippet title | 3–100 characters |
| Snippet description | Max 500 characters |
| Tags | Max 10 tags, each max 30 chars |

### Supported Language Values

Accepted values for the `language` field:

```
"c" | "cpp" | "python" | "java" | "javascript"
```

---

## 7. Authentication Endpoints

---

### `POST /auth/register`

Register a new user account.

**Auth Required:** No

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

| Field | Type | Required | Rules |
|---|---|---|---|
| `email` | `string` | Yes | Valid email, unique |
| `password` | `string` | Yes | See password rules |
| `firstName` | `string` | Yes | 1–50 characters |
| `lastName` | `string` | Yes | 1–50 characters |

**Response `201 Created`:**

```json
{
  "id": "3f7a1234-bc56-7890-de12-f34567890abc",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
  "expiresIn": 86400
}
```

**Error Responses:**

| Status | Code | Scenario |
|---|---|---|
| `400` | `EMAIL_EXISTS` | Email already registered |
| `400` | `WEAK_PASSWORD` | Password fails strength rules |
| `422` | `VALIDATION_ERROR` | Missing or invalid fields |

```json
{
  "error": {
    "code": "EMAIL_EXISTS",
    "message": "An account with this email already exists.",
    "timestamp": "2026-07-08T10:00:00Z"
  }
}
```

---

### `POST /auth/login`

Authenticate with email and password.

**Auth Required:** No

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response `200 OK`:**

```json
{
  "id": "3f7a1234-bc56-7890-de12-f34567890abc",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
  "expiresIn": 86400
}
```

**Error Responses:**

| Status | Code | Scenario |
|---|---|---|
| `400` | `INVALID_CREDENTIALS` | Wrong email or password |
| `422` | `VALIDATION_ERROR` | Missing or malformed fields |

> **Security Note:** Always return the same error message regardless of whether the
> email exists or the password is wrong. This prevents user enumeration attacks.
>
> Correct:   "Invalid email or password."
> Incorrect: "No account found with this email."

---

### `POST /auth/google`

Authenticate using a Google ID Token.

**Auth Required:** No

**Request Body:**

```json
{
  "googleToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6Ii..."
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `googleToken` | `string` | Yes | Google ID token from `google.accounts.id.initialize()` |

**Response `200 OK` (existing user) / `201 Created` (new user):**

```json
{
  "id": "3f7a1234-bc56-7890-de12-f34567890abc",
  "email": "john@gmail.com",
  "firstName": "John",
  "lastName": "Doe",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
  "expiresIn": 86400,
  "isNewUser": false
}
```

**Error Responses:**

| Status | Code | Scenario |
|---|---|---|
| `400` | `INVALID_TOKEN` | Google token is expired or malformed |
| `400` | `VALIDATION_ERROR` | `googleToken` field is missing |

---

### `POST /auth/refresh`

Exchange a Refresh Token for a new Access Token.

**Auth Required:** No

**Request Body:**

```json
{
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
}
```

**Response `200 OK`:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400
}
```

**Error Responses:**

| Status | Code | Scenario |
|---|---|---|
| `401` | `INVALID_TOKEN` | Refresh token expired, revoked, or malformed |

> A used refresh token is immediately invalidated. Store the latest refresh token from each response.

---

### `POST /auth/logout`

Revoke the current session tokens.

**Auth Required:** Yes

**Request Body:**

```json
{
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
}
```

**Response `200 OK`:**

```json
{
  "message": "Logged out successfully."
}
```

---

### `POST /auth/forgot-password`

Send a password reset link to the user's email.

**Auth Required:** No

**Request Body:**

```json
{
  "email": "john@example.com"
}
```

**Response `200 OK`:**

```json
{
  "message": "If an account exists with this email, a reset link has been sent."
}
```

> **Security Note:** Always return `200` regardless of whether the email exists.
> This prevents user enumeration.

---

### `POST /auth/reset-password`

Reset the user's password using the token from the email link.

**Auth Required:** No

**Request Body:**

```json
{
  "token": "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4",
  "newPassword": "NewSecurePass456!"
}
```

| Field | Type | Required | Rules |
|---|---|---|---|
| `token` | `string` | Yes | Hex token from reset email |
| `newPassword` | `string` | Yes | See password rules |

**Response `200 OK`:**

```json
{
  "message": "Password reset successfully. Please log in with your new password."
}
```

**Error Responses:**

| Status | Code | Scenario |
|---|---|---|
| `400` | `INVALID_TOKEN` | Token expired (over 1 hour), not found, or already used |
| `400` | `WEAK_PASSWORD` | New password fails strength rules |

---

## 8. User Endpoints

---

### `GET /users/me`

Retrieve the authenticated user's profile.

**Auth Required:** Yes

**Response `200 OK`:**

```json
{
  "id": "3f7a1234-bc56-7890-de12-f34567890abc",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Learning Python one snippet at a time.",
  "avatarUrl": null,
  "createdAt": "2026-01-15T08:30:00Z",
  "updatedAt": "2026-07-01T14:22:00Z"
}
```

---

### `PUT /users/me`

Update the authenticated user's profile information.

**Auth Required:** Yes

**Request Body:**

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "bio": "Backend developer learning system design."
}
```

| Field | Type | Required | Rules |
|---|---|---|---|
| `firstName` | `string` | No | 1–50 characters |
| `lastName` | `string` | No | 1–50 characters |
| `bio` | `string` | No | Max 500 characters |

> All fields are optional. Send only what you want to change.

**Response `200 OK`:** Full updated user object (same as `GET /users/me`).

---

### `PUT /users/me/password`

Change the authenticated user's password.

**Auth Required:** Yes

**Request Body:**

```json
{
  "currentPassword": "OldSecurePass123!",
  "newPassword": "NewSecurePass456!"
}
```

| Field | Type | Required | Rules |
|---|---|---|---|
| `currentPassword` | `string` | Yes | Must match stored password |
| `newPassword` | `string` | Yes | See password rules; must differ from current |

**Response `200 OK`:**

```json
{
  "message": "Password changed successfully. Please log in again."
}
```

**Error Responses:**

| Status | Code | Scenario |
|---|---|---|
| `400` | `INVALID_CREDENTIALS` | `currentPassword` is incorrect |
| `400` | `WEAK_PASSWORD` | `newPassword` fails strength rules |
| `400` | `VALIDATION_ERROR` | New password is same as current password |

> On successful password change, all existing refresh tokens are revoked.
> Redirect the user to the login page.

---

## 9. Snippet Endpoints

---

### Snippet Object Schema

```json
{
  "id": "a1b2c3d4-e5f6-7890-ab12-c3d4e5f67890",
  "userId": "3f7a1234-bc56-7890-de12-f34567890abc",
  "title": "Binary Search",
  "description": "Iterative binary search implementation",
  "language": "python",
  "code": "def binary_search(arr, target):\n    ...",
  "input": "5\n1 3 5 7 9\n5",
  "tags": ["algorithms", "searching"],
  "createdAt": "2026-06-01T10:00:00Z",
  "updatedAt": "2026-07-01T14:30:00Z"
}
```

---

### `POST /snippets`

Create a new code snippet.

**Auth Required:** Yes

**Request Body:**

```json
{
  "title": "Fibonacci Sequence",
  "description": "Recursive Fibonacci in Python",
  "language": "python",
  "code": "def fib(n):\n    if n <= 1:\n        return n\n    return fib(n-1) + fib(n-2)\n\nprint(fib(10))",
  "input": "",
  "tags": ["python", "recursion", "algorithms"]
}
```

| Field | Type | Required | Rules |
|---|---|---|---|
| `title` | `string` | Yes | 3–100 characters |
| `description` | `string` | No | Max 500 characters |
| `language` | `string` | Yes | One of the supported language values |
| `code` | `string` | Yes | Max 64 KB |
| `input` | `string` | No | Max 8 KB, default `""` |
| `tags` | `string[]` | No | Max 10 items, each max 30 chars |

**Response `201 Created`:** Full snippet object (see schema above).

---

### `GET /snippets`

List all snippets belonging to the authenticated user.

**Auth Required:** Yes

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `limit` | `integer` | `10` | Items per page (max 100) |
| `offset` | `integer` | `0` | Items to skip |
| `language` | `string` | — | Filter by language |
| `search` | `string` | — | Search in title (case-insensitive) |

**Example Request:**

```
GET /api/snippets?limit=10&offset=0&language=python&search=sort
```

**Response `200 OK`:**

```json
{
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-ab12-c3d4e5f67890",
      "title": "Bubble Sort",
      "language": "python",
      "tags": ["sorting"],
      "createdAt": "2026-06-01T10:00:00Z",
      "updatedAt": "2026-07-01T14:30:00Z"
    }
  ],
  "total": 2,
  "limit": 10,
  "offset": 0
}
```

> The list response omits `code` and `input` for performance. Use `GET /snippets/:snippetId` to get the full code.

---

### `GET /snippets/:snippetId`

Get a single snippet with full code content.

**Auth Required:** Yes

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `snippetId` | `string (UUID)` | ID of the snippet |

**Response `200 OK`:** Full snippet object (see schema above).

**Error Responses:**

| Status | Code | Scenario |
|---|---|---|
| `403` | `FORBIDDEN` | Snippet exists but belongs to another user |
| `404` | `NOT_FOUND` | Snippet ID does not exist |

---

### `PUT /snippets/:snippetId`

Update an existing snippet.

**Auth Required:** Yes

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `snippetId` | `string (UUID)` | ID of the snippet to update |

**Request Body:** Any subset of snippet fields (all optional).

```json
{
  "title": "Bubble Sort — Optimised",
  "code": "def bubble_sort(arr):\n    ...",
  "description": "Optimised with early exit flag"
}
```

**Response `200 OK`:** Full updated snippet object.

**Error Responses:**

| Status | Code | Scenario |
|---|---|---|
| `403` | `FORBIDDEN` | Snippet belongs to another user |
| `404` | `NOT_FOUND` | Snippet does not exist |
| `422` | `VALIDATION_ERROR` | Invalid field values |

---

### `DELETE /snippets/:snippetId`

Permanently delete a snippet and its execution history.

**Auth Required:** Yes

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `snippetId` | `string (UUID)` | ID of the snippet to delete |

**Response `204 No Content`:** Empty body.

**Error Responses:**

| Status | Code | Scenario |
|---|---|---|
| `403` | `FORBIDDEN` | Snippet belongs to another user |
| `404` | `NOT_FOUND` | Snippet does not exist |

---

## 10. Execution Endpoints

---

### Execution Result Object Schema

```json
{
  "id": "exec-a1b2c3d4-e5f6-7890",
  "snippetId": null,
  "language": "python",
  "success": true,
  "output": "Hello\n",
  "stderr": "",
  "executionTime": 0.123,
  "memoryUsed": 12,
  "exitCode": 0,
  "executedAt": "2026-07-08T10:05:00Z"
}
```

---

### `POST /execute`

Compile and run code directly (without saving a snippet).

**Auth Required:** Yes
**Rate Limited:** Yes (10 requests/minute)

**Request Body:**

```json
{
  "language": "python",
  "code": "n = int(input())\nfor i in range(1, n+1):\n    print(i)",
  "input": "5",
  "timeLimit": 5,
  "memoryLimit": 128
}
```

| Field | Type | Required | Rules |
|---|---|---|---|
| `language` | `string` | Yes | One of the supported language values |
| `code` | `string` | Yes | Max 64 KB |
| `input` | `string` | No | Stdin for the program, max 8 KB |
| `timeLimit` | `integer` | No | Seconds, 1–10, default `5` |
| `memoryLimit` | `integer` | No | MB, 64–256, default `128` |

**Response `200 OK` — Successful Execution:**

```json
{
  "id": "exec-a1b2c3d4-e5f6-7890",
  "success": true,
  "output": "1\n2\n3\n4\n5\n",
  "stderr": "",
  "executionTime": 0.087,
  "memoryUsed": 9,
  "exitCode": 0,
  "executedAt": "2026-07-08T10:05:00Z"
}
```

**Response `200 OK` — Compilation Error:**

```json
{
  "id": "exec-b2c3d4e5-f6a7-8901",
  "success": false,
  "output": "",
  "stderr": "  File \"main.py\", line 2\n    for i in range(1, n+1)\n                          ^\nSyntaxError: expected ':'\n",
  "errorType": "CompilationError",
  "exitCode": 1,
  "executedAt": "2026-07-08T10:05:00Z"
}
```

**Response `200 OK` — Runtime Error:**

```json
{
  "id": "exec-c3d4e5f6-a7b8-9012",
  "success": false,
  "output": "",
  "stderr": "Traceback (most recent call last):\n  File \"main.py\", line 1\nZeroDivisionError: division by zero\n",
  "errorType": "RuntimeError",
  "exitCode": 1,
  "executedAt": "2026-07-08T10:05:00Z"
}
```

**Error Responses:**

| Status | Code | Scenario |
|---|---|---|
| `408` | `EXECUTION_TIMEOUT` | Code ran longer than `timeLimit` |
| `413` | `PAYLOAD_TOO_LARGE` | Code or input exceeded size limit |
| `429` | `RATE_LIMIT_EXCEEDED` | Too many execution requests |
| `503` | `SERVICE_UNAVAILABLE` | Docker engine is unavailable |
| `507` | `MEMORY_LIMIT_EXCEEDED` | Code exceeded memory limit |

```json
{
  "error": {
    "code": "EXECUTION_TIMEOUT",
    "message": "Execution exceeded the 5-second time limit. Check for infinite loops.",
    "timestamp": "2026-07-08T10:05:00Z"
  }
}
```

---

### `POST /execute/:snippetId`

Run a saved snippet. Optionally override its stored stdin input.

**Auth Required:** Yes

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `snippetId` | `string (UUID)` | ID of the snippet to run |

**Request Body:**

```json
{
  "input": "10"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `input` | `string` | No | Overrides the snippet's stored input. Omit to use the snippet's saved input. |

**Response `200 OK`:** Same structure as `POST /execute`.

**Error Responses:**

| Status | Code | Scenario |
|---|---|---|
| `403` | `FORBIDDEN` | Snippet belongs to another user |
| `404` | `NOT_FOUND` | Snippet does not exist |
| `408` | `EXECUTION_TIMEOUT` | Code exceeded time limit |
| `503` | `SERVICE_UNAVAILABLE` | Docker engine unavailable |

---

## 11. History Endpoints

---

### `GET /executions`

List the user's past execution runs.

**Auth Required:** Yes

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `limit` | `integer` | `20` | Items per page (max 100) |
| `offset` | `integer` | `0` | Items to skip |
| `snippetId` | `string (UUID)` | — | Filter by a specific snippet |
| `language` | `string` | — | Filter by language |

**Example Request:**

```
GET /api/executions?limit=10&offset=0&language=python
```

**Response `200 OK`:**

```json
{
  "data": [
    {
      "id": "exec-a1b2c3d4-e5f6-7890",
      "snippetId": "a1b2c3d4-e5f6-7890-ab12-c3d4e5f67890",
      "snippetTitle": "Bubble Sort",
      "language": "python",
      "success": true,
      "exitCode": 0,
      "executionTime": 0.087,
      "executedAt": "2026-07-08T10:05:00Z"
    },
    {
      "id": "exec-b2c3d4e5-f6a7-8901",
      "snippetId": null,
      "snippetTitle": null,
      "language": "javascript",
      "success": false,
      "exitCode": 1,
      "executionTime": 0.045,
      "executedAt": "2026-07-08T09:50:00Z"
    }
  ],
  "total": 84,
  "limit": 10,
  "offset": 0
}
```

---

### `GET /executions/:executionId`

Get full details of a specific execution including code and full output.

**Auth Required:** Yes

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `executionId` | `string (UUID)` | ID of the execution record |

**Response `200 OK`:**

```json
{
  "id": "exec-a1b2c3d4-e5f6-7890",
  "snippetId": "a1b2c3d4-e5f6-7890-ab12-c3d4e5f67890",
  "snippetTitle": "Bubble Sort",
  "language": "python",
  "code": "def bubble_sort(arr):\n    ...",
  "input": "",
  "success": true,
  "output": "[12, 22, 25, 34, 64]\n",
  "stderr": "",
  "exitCode": 0,
  "executionTime": 0.087,
  "memoryUsed": 9,
  "executedAt": "2026-07-08T10:05:00Z"
}
```

**Error Responses:**

| Status | Code | Scenario |
|---|---|---|
| `403` | `FORBIDDEN` | Execution belongs to another user |
| `404` | `NOT_FOUND` | Execution record does not exist |

---

## 12. System Endpoints

---

### `GET /health`

Check if the API server is running.

**Auth Required:** No

**Response `200 OK`:**

```json
{
  "status": "ok",
  "timestamp": "2026-07-08T10:00:00Z",
  "version": "1.0.0",
  "uptime": 86400
}
```

---

### `GET /health/db`

Check if the database connection is active.

**Auth Required:** No

**Response `200 OK` — Connected:**

```json
{
  "status": "connected",
  "latency": 3
}
```

**Response `503 Service Unavailable` — Disconnected:**

```json
{
  "status": "disconnected",
  "error": "Connection refused"
}
```

---

### `GET /languages`

List all supported programming languages and their runtime versions.

**Auth Required:** No

**Response `200 OK`:**

```json
[
  {
    "id": "c",
    "name": "C",
    "version": "GCC 13.2.0",
    "extensions": [".c"],
    "monacoLanguage": "c"
  },
  {
    "id": "cpp",
    "name": "C++",
    "version": "G++ 13.2.0",
    "extensions": [".cpp", ".cc", ".cxx"],
    "monacoLanguage": "cpp"
  },
  {
    "id": "python",
    "name": "Python 3",
    "version": "3.11.0",
    "extensions": [".py"],
    "monacoLanguage": "python"
  },
  {
    "id": "java",
    "name": "Java",
    "version": "OpenJDK 17.0.8",
    "extensions": [".java"],
    "monacoLanguage": "java"
  },
  {
    "id": "javascript",
    "name": "JavaScript",
    "version": "Node.js 20.10.0",
    "extensions": [".js"],
    "monacoLanguage": "javascript"
  }
]
```

---

## 13. HTTP Status Code Reference

| Code | Name | When Used |
|---|---|---|
| `200` | OK | Successful GET, PUT, POST |
| `201` | Created | Resource successfully created |
| `204` | No Content | Successful DELETE (no body) |
| `400` | Bad Request | Invalid credentials, weak password, email exists |
| `401` | Unauthorized | Missing or invalid JWT token |
| `403` | Forbidden | Authenticated but accessing another user's resource |
| `404` | Not Found | Resource ID does not exist |
| `408` | Request Timeout | Code execution exceeded time limit |
| `413` | Payload Too Large | Code or input exceeds size limit |
| `422` | Unprocessable Entity | Validation failed on request body |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Unexpected server-side error |
| `503` | Service Unavailable | Docker engine or database is offline |
| `507` | Insufficient Storage | Code exceeded memory limit |

---

## 14. Security Considerations

### Authentication Security

| Risk | Mitigation |
|---|---|
| Password brute-force | Rate limiting (10 req/min) + bcrypt hashing (cost 12) |
| JWT theft via XSS | Store JWT in HTTP-only cookie — not accessible to JavaScript |
| JWT forgery | Signed with 256-bit HS256 secret stored in environment variable |
| User enumeration on login | Always return: "Invalid email or password" |
| User enumeration on forgot-password | Always return: "If an account exists..." |
| CSRF attacks | SameSite=Strict cookie attribute + CORS origin restriction |
| Replay on reset tokens | Tokens are single-use and expire after 1 hour |

### Code Execution Security

| Risk | Mitigation |
|---|---|
| File system access from code | Container has read-only filesystem; only /tmp is writable |
| Network exfiltration from code | Container runs with --network none |
| Fork bomb / resource exhaustion | CPU capped at 0.5 cores; memory limited; 5s timeout with SIGKILL |
| Privilege escalation | Container runs as non-root user (UID 1000) |
| Host container escape | No privileged mode; no capability grants |
| Oversized code payloads | Request rejected at 64 KB with 413 |

### API Security

| Risk | Mitigation |
|---|---|
| SQL injection | Prisma uses parameterised queries — no raw SQL interpolation |
| CORS attacks | Access-Control-Allow-Origin restricted to frontend origin |
| Clickjacking | X-Frame-Options: DENY header via Helmet |
| MIME sniffing | X-Content-Type-Options: nosniff header |
| Secrets in code | All secrets via .env; never committed to version control |
| Mass assignment | Explicit DTO whitelisting; unknown fields are stripped |

---

## 15. Endpoint Summary Table

| # | Method | Endpoint | Auth | Description |
|---|---|---|---|---|
| 1 | `POST` | `/auth/register` | No | Register new user |
| 2 | `POST` | `/auth/login` | No | Login with email/password |
| 3 | `POST` | `/auth/google` | No | Login with Google OAuth |
| 4 | `POST` | `/auth/refresh` | No | Refresh access token |
| 5 | `POST` | `/auth/logout` | Yes | Logout and revoke tokens |
| 6 | `POST` | `/auth/forgot-password` | No | Send password reset email |
| 7 | `POST` | `/auth/reset-password` | No | Reset password with token |
| 8 | `GET` | `/users/me` | Yes | Get current user profile |
| 9 | `PUT` | `/users/me` | Yes | Update profile |
| 10 | `PUT` | `/users/me/password` | Yes | Change password |
| 11 | `POST` | `/snippets` | Yes | Create snippet |
| 12 | `GET` | `/snippets` | Yes | List user's snippets |
| 13 | `GET` | `/snippets/:snippetId` | Yes | Get snippet by ID |
| 14 | `PUT` | `/snippets/:snippetId` | Yes | Update snippet |
| 15 | `DELETE` | `/snippets/:snippetId` | Yes | Delete snippet |
| 16 | `POST` | `/execute` | Yes | Execute code directly |
| 17 | `POST` | `/execute/:snippetId` | Yes | Run saved snippet |
| 18 | `GET` | `/executions` | Yes | List execution history |
| 19 | `GET` | `/executions/:executionId` | Yes | Get execution details |
| 20 | `GET` | `/health` | No | API health check |
| 21 | `GET` | `/health/db` | No | Database health check |
| 22 | `GET` | `/languages` | No | List supported languages |

---

*Document prepared for CodeVerse v1.0 — REST API Specification*
*Frontend developers can begin implementation directly from this document.*
