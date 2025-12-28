# API Reference

Complete API documentation for the X-Ray backend.

## Base URL

- **Development:** `http://localhost:4000`
- **Production:** `https://your-domain.com`

## Authentication

All endpoints that modify data require an `x-api-key` header:

```bash
curl -H "x-api-key: xr_..." http://localhost:4000/executions
```

API keys are issued by the `/apps` endpoint and have the format `xr_<uuid>`.

## Error Handling

Responses use standard HTTP status codes:

- `200` — Success
- `400` — Bad request (missing/invalid fields)
- `401` — Unauthorized (missing/invalid API key)
- `500` — Server error

**Error response format:**

```json
{
  "error": "Human-readable error message"
}
```

## Endpoints

### 1. Ingestion

#### POST /executions

Ingest an execution snapshot from the SDK.

**Headers:**

```
Content-Type: application/json
x-api-key: xr_...
```

**Request Body:**

```json
{
  "executionId": "uuid",
  "appId": "application-identifier",
  "pipeline": "workflow-name",
  "environment": "prod",
  "status": "completed",
  "steps": [
    {
      "name": "step_name",
      "timestamp": 1234567890000,
      "status": "completed",
      "input": { "key": "value" },
      "output": { "result": "value" },
      "reasoning": "Why this decision was made",
      "metadata": { "custom": "data" }
    }
  ],
  "timestamps": {
    "start": 1234567890000,
    "end": 1234567895000
  }
}
```

**Response (Success):**

```json
{ "success": true }
```

**Response (Auth Failure):**

```
HTTP/1.1 401 Unauthorized
{ "error": "Invalid API key" }
```

**Response (Bad Request):**

```
HTTP/1.1 400 Bad Request
{ "error": "Missing field: executionId" }
```

**Notes:**

- The backend uses best-effort semantics. Even if ingestion fails, a `{ "success": false }` response is still returned (not a 5xx status).
- Invalid snapshot fields are persisted as-is (no validation).
- The API key must belong to an existing app in the `apps` table.

**Example:**

```bash
curl -X POST http://localhost:4000/executions \
  -H "Content-Type: application/json" \
  -H "x-api-key: xr_abc123" \
  -d '{
    "executionId": "550e8400-e29b-41d4-a716-446655440000",
    "appId": "loan-approval",
    "pipeline": "underwriting",
    "environment": "prod",
    "status": "completed",
    "steps": [
      {
        "name": "fetch_credit_score",
        "output": { "score": 750 },
        "status": "completed"
      }
    ],
    "timestamps": {
      "start": 1704067200000,
      "end": 1704067205000
    }
  }'
```

---

### 2. App Management

#### POST /apps

Create a new application and generate an API key.

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "userId": "user-uuid",
  "name": "Application Name"
}
```

**Response:**

```json
{
  "id": "app-uuid",
  "user_id": "user-uuid",
  "name": "Application Name",
  "api_key": "xr_abc123...",
  "created_at": "2025-01-01T00:00:00Z"
}
```

**Error Responses:**

```
HTTP/1.1 400 Bad Request
{ "error": "Missing fields" }
```

**Notes:**

- The `userId` should be the UUID from the `users` table.
- The `api_key` is randomly generated and unique.
- Store the API key securely — it's used by the SDK to authenticate snapshots.
- The API key can be rotated by deleting the app and creating a new one (no key rotation endpoint yet).

**Example:**

```bash
curl -X POST http://localhost:4000/apps \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "My Loan Processor"
  }'
```

---

### 3. User Management

#### POST /auth/sync-user

Sync a Clerk user with the local database.

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "clerkUserId": "user_...",
  "email": "user@example.com"
}
```

**Response (New User):**

```json
{
  "id": "user-uuid",
  "clerk_user_id": "user_...",
  "email": "user@example.com",
  "created_at": "2025-01-01T00:00:00Z"
}
```

**Response (Existing User):**

```json
{
  "id": "user-uuid",
  "clerk_user_id": "user_...",
  "email": "user@example.com",
  "created_at": "2024-12-01T00:00:00Z"
}
```

**Error Responses:**

```
HTTP/1.1 400 Bad Request
{ "error": "Missing clerkUserId" }
```

**Notes:**

- Called automatically by the dashboard after Clerk authentication.
- If the user already exists, returns the existing record.
- The `clerkUserId` must match Clerk's user ID format (`user_...`).

**Example:**

```bash
curl -X POST http://localhost:4000/auth/sync-user \
  -H "Content-Type: application/json" \
  -d '{
    "clerkUserId": "user_123456789",
    "email": "john@example.com"
  }'
```

---

### 4. Health Check

#### GET /

Server health check.

**Response:**

```
Welcome to my server!
```

**Notes:**

- Always returns `200 OK` if the server is running.
- No authentication required.

**Example:**

```bash
curl http://localhost:4000/
```

---

## Query APIs (Future)

The following endpoints are planned for v0.2:

```
GET /executions?appId=...&status=...&limit=...&offset=...
GET /steps?executionId=...
GET /apps/:appId
```

For now, query the Supabase database directly.

---

## Rate Limiting

v0.1 has no built-in rate limiting. For production, deploy behind a reverse proxy:

**Nginx example:**

```nginx
limit_req_zone $http_x_api_key zone=api:10m rate=100r/m;

server {
  location /executions {
    limit_req zone=api burst=10;
    proxy_pass http://backend:4000;
  }
}
```

---

## Request/Response Size Limits

- **Max request size:** 10MB (configurable via Express middleware)
- **Max snapshot size:** Unlimited, but recommend < 1MB

---

## Timestamps

All timestamps are Unix milliseconds (since epoch):

```
1704067200000  // January 1, 2024 00:00:00 UTC
```

To convert:

- JavaScript: `new Date(1704067200000)`
- Python: `datetime.fromtimestamp(1704067200 / 1000)`
- Go: `time.Unix(0, 1704067200000 * int64(time.Millisecond))`

---

## UUIDs

All IDs are version 4 (random) UUIDs:

```
550e8400-e29b-41d4-a716-446655440000
```

JavaScript: `crypto.randomUUID()`

---

## Data Types

### execution object

```typescript
{
  executionId: string;          // UUID
  appId: string;                // Application identifier
  pipeline: string;             // Workflow/pipeline name
  environment?: "dev" | "prod"; // Optional
  status: "pending" | "in_progress" | "completed" | "failed";
  steps: step[];
  timestamps: {
    start: number;              // Unix ms
    end?: number;               // Unix ms (optional)
  };
}
```

### step object

```typescript
{
  name: string;                      // Required
  timestamp?: number;                // Unix ms (optional)
  status?: "pending" | "in_progress" | "completed" | "failed"; // Optional
  input?: any;                       // JSON-serializable
  output?: any;                      // JSON-serializable
  reasoning?: string;                // Human-readable explanation
  metadata?: Record<string, any>;    // Custom data
}
```

### app object

```typescript
{
  id: string; // UUID
  user_id: string; // UUID (foreign key)
  name: string; // Human-readable name
  api_key: string; // Format: xr_<uuid>
  created_at: string; // ISO 8601 timestamp
}
```

### user object

```typescript
{
  id: string;            // UUID
  clerk_user_id: string; // Clerk's user ID
  email?: string;        // Optional
  created_at: string;    // ISO 8601 timestamp
}
```

---

## Examples

### Complete Workflow

```bash
# 1. Create a user (called by dashboard after Clerk auth)
curl -X POST http://localhost:4000/auth/sync-user \
  -H "Content-Type: application/json" \
  -d '{
    "clerkUserId": "user_abc",
    "email": "alice@example.com"
  }'
# Response: { id: "user-uuid", ... }

# 2. Create an app
USER_ID="user-uuid"
curl -X POST http://localhost:4000/apps \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"name\": \"Loan Processor\"
  }"
# Response: { api_key: "xr_...", ... }

# 3. SDK sends a snapshot
API_KEY="xr_..."
curl -X POST http://localhost:4000/executions \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{
    "executionId": "exec-1",
    "appId": "Loan Processor",
    "pipeline": "approval",
    "status": "completed",
    "steps": [
      { "name": "verify_income", "output": { "verified": true } },
      { "name": "check_credit", "output": { "score": 750 } },
      { "name": "make_decision", "output": { "approved": true } }
    ],
    "timestamps": { "start": 1704067200000, "end": 1704067205000 }
  }'
# Response: { success: true }
```

---

## Support

- **Issues:** [GitHub Issues](https://github.com/abhijain1705/x-ray/issues)
- **Discussions:** [GitHub Discussions](https://github.com/abhijain1705/x-ray/discussions)
- **Security:** See [SECURITY.md](../SECURITY.md)

---

**Last Updated:** January 2025  
**API Version:** 0.1
