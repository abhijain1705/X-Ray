# Architecture Overview

This document describes the design and architecture of X-Ray.

## System Design

X-Ray follows a **snapshot-based observability** model:

```
Application Code
    ↓ (calls SDK)
SDK (in-memory buffering)
    ↓ (on completion)
POST /executions snapshot
    ↓
Backend (validation + persistence)
    ↓
Supabase (Postgres)
    ↓
Dashboard (visualization)
```

## Key Principles

### 1. Snapshot-Based, Not Event-Based

Instead of publishing events as steps occur, X-Ray buffers steps in memory and flushes a single snapshot when the execution completes or fails.

**Advantages:**

- No per-step network overhead
- Simple failure semantics (one failed request loses one execution, not a cascade)
- No need for message queues or streaming infrastructure

**Trade-offs:**

- Lost snapshots if the backend is unreachable
- Latency between execution and dashboard visibility
- Not suitable for real-time observability

### 2. Non-Blocking

Recording steps never blocks your application. All network I/O is async and best-effort.

```typescript
execution.recordStep({ ... });  // ~0.1ms, synchronous
execution.completeExecution();  // Triggers async POST, returns immediately
```

### 3. Stateless Backend

The backend validates all requests via API keys. No session state, no user login for SDK clients.

- **SDK clients** authenticate via `x-api-key` header
- **Dashboard users** authenticate via Clerk

### 4. No Durability Guarantees

Snapshots can be lost. This is intentional and acceptable for observability (not transactional) data.

The backend responds with `{ "success": false }` if ingestion fails, but the client never retries automatically.

## Components

### SDK (packages/xray-sdk)

**What it does:**

- Provides API for recording decision steps
- Buffers steps in memory
- Flushes snapshot to backend on completion

**Key files:**

- `src/index.ts` — Main SDK class
- `src/types.ts` — TypeScript types
- `src/util.ts` — Serialization helpers

**Dependencies:**

- None (zero external deps)

**Execution flow:**

```typescript
const xray = new XRaySDK({ apiKey, appId, pipeline });
const exec = xray.startExecution();

// Steps buffered in memory
exec.recordStep({ name: 'step1', ... });
exec.recordStep({ name: 'step2', ... });

// Snapshot flushed asynchronously
exec.completeExecution();
// → POST http://localhost:4000/executions with snapshot
```

### Backend (server)

**What it does:**

- Receives execution snapshots from SDK
- Validates API keys against `apps` table
- Persists executions and steps to Supabase
- Syncs Clerk users to local `users` table

**Key files:**

- `src/index.ts` — Express app, endpoints, middleware

**Dependencies:**

- `express` — HTTP server
- `@supabase/supabase-js` — Database client
- `dotenv` — Environment variables

**Key endpoints:**

| Method | Path              | Purpose                                          |
| ------ | ----------------- | ------------------------------------------------ |
| POST   | `/executions`     | Ingest execution snapshot (auth via `x-api-key`) |
| POST   | `/apps`           | Create new app (returns API key)                 |
| POST   | `/auth/sync-user` | Sync Clerk user to database                      |
| GET    | `/`               | Health check                                     |

**Middleware:**

```typescript
authenticateSDK(req, res, next) {
  // Validate x-api-key header
  // Look up app in Supabase
  // Attach app record to req
  // Call next()
}
```

### Dashboard (frontend)

**What it does:**

- Authenticates users via Clerk
- Displays executions and steps
- Lists applications
- Shows decision timelines

**Key files:**

- `src/app/layout.tsx` — Root layout with Clerk provider
- `src/app/page.tsx` — Home/redirect page
- `src/app/dashboard/` — Protected dashboard pages
- `src/components/` — Reusable UI components

**Dependencies:**

- `next` — React framework
- `@clerk/nextjs` — User authentication
- `@radix-ui/*` — UI primitives
- `tailwindcss` — Styling

**Key pages:**

| Route                 | Purpose                                  |
| --------------------- | ---------------------------------------- |
| `/`                   | Home (redirects to dashboard or sign-in) |
| `/auth/sign-in`       | Clerk sign-in page                       |
| `/auth/sign-up`       | Clerk sign-up page                       |
| `/dashboard/overview` | List recent executions                   |
| `/dashboard/profile`  | User account page                        |

## Database Schema

### users

Synced from Clerk. Used for ownership and RBAC.

```
id (UUID) → clerk_user_id (TEXT, unique) → email → created_at
```

### apps

API keys and app metadata. Owned by users.

```
id (UUID) → user_id (FK) → name (TEXT) → api_key (TEXT, unique) → created_at
```

API key format: `xr_<uuid>`

### executions

Execution snapshots. Owned by apps.

```
id (UUID, from SDK) → app_id (FK) → pipeline (TEXT) → status (TEXT)
  → started_at (TIMESTAMP) → ended_at (TIMESTAMP, nullable) → created_at
```

Status values: `pending`, `in_progress`, `completed`, `failed`

### steps

Individual steps within an execution.

```
id (UUID) → execution_id (FK) → name (TEXT) → timestamp (TIMESTAMP)
  → input (JSONB, nullable) → output (JSONB, nullable)
  → reasoning (TEXT, nullable) → metadata (JSONB, nullable) → created_at
```

## Authentication & Authorization

### SDK (Machine)

- **Auth mechanism:** `x-api-key` header
- **Issued by:** Backend `/apps` endpoint
- **Validated by:** Backend looks up key in `apps` table
- **Scope:** Can only write to the associated app

### Dashboard (User)

- **Auth mechanism:** Clerk (OpenID Connect)
- **Session:** JWT token managed by Clerk
- **Validated by:** Clerk middleware in Next.js
- **Scope:** Can see apps owned by the user (future: RBAC)

## Data Flow

### Example: Loan Approval Decision

1. **Application** calls SDK to start execution

   ```typescript
   const exec = xray.startExecution();
   ```

2. **SDK** creates in-memory execution object with UUID

   ```typescript
   executionId: "550e8400-e29b-41d4-a716-446655440000";
   status: "pending";
   steps: [];
   ```

3. **Application** records steps

   ```typescript
   exec.recordStep({ name: "fetch_credit_score", output: { score: 750 } });
   ```

4. **SDK** appends step to in-memory array

   ```typescript
   steps: [
     { name: 'fetch_credit_score', ..., timestamp: 1234567890 }
   ]
   ```

5. **Application** completes execution

   ```typescript
   exec.completeExecution();
   ```

6. **SDK** sets status to `completed` and triggers async POST

7. **SDK** sends HTTP POST to backend

   ```json
   POST /executions
   x-api-key: xr_...
   {
     "executionId": "550e8400-...",
     "appId": "my-loan-app",
     "pipeline": "loan-approval",
     "status": "completed",
     "steps": [...],
     "timestamps": { "start": 1234567890, "end": 1234567895 }
   }
   ```

8. **Backend** receives request

   - Validates API key
   - Looks up app in Supabase
   - Inserts execution record
   - Inserts step records (bulk)
   - Returns `{ "success": true }`

9. **Backend** persists to Supabase

   ```sql
   INSERT INTO executions (id, app_id, pipeline, status, started_at, ended_at)
   VALUES ('550e8400-...', 'app_uuid', 'loan-approval', 'completed', ...)

   INSERT INTO steps (execution_id, name, ...) VALUES (...)
   ```

10. **Dashboard** user logs in via Clerk

11. **Dashboard** queries backend API (future) or Supabase directly

12. **Dashboard** displays execution timeline
    ```
    Execution: 550e8400-...
    └─ Step: fetch_credit_score → 750
    └─ Step: calculate_risk_tier → A
    └─ Step: check_approval_rules → approved
    Duration: 5ms
    ```

## Performance Characteristics

### SDK

- **Step recording:** ~0.1ms per step (synchronous, array append)
- **Snapshot creation:** ~0.5ms for 100 steps
- **Network:** Asynchronous, non-blocking
- **Memory:** ~1KB per step (estimates for typical data)

### Backend

- **Request latency:** ~50-100ms (1 query for auth, 1 insert for execution, N inserts for steps)
- **Throughput:** ~100 snapshots/sec on small server (with Supabase)
- **Bottleneck:** Database writes (no batch optimization yet)

### Dashboard

- **Page load:** ~1-2s (Next.js + Clerk + API calls)
- **Navigation:** ~100-200ms between pages

## Limitations (v0.1)

1. **No real-time updates** — executions appear in dashboard after network roundtrip
2. **No rate limiting** — deploy behind reverse proxy if needed
3. **No encryption at rest** — data stored plaintext in Supabase
4. **No audit logging** — no record of who accessed what
5. **Single instance** — no clustering or HA
6. **No data retention** — you must manage cleanup
7. **No retries** — failed snapshots are silently dropped
8. **Read-only dashboard** — no execution editing/replay

## Future Improvements

- [ ] Rate limiting (token bucket)
- [ ] Request signing (HMAC)
- [ ] Batch inserts for steps
- [ ] WebSocket support for real-time updates
- [ ] Execution replay/debugging
- [ ] Team collaboration
- [ ] RBAC
- [ ] Prometheus metrics
- [ ] Audit logging
- [ ] Data retention policies

## Security Considerations

See [SECURITY.md](../SECURITY.md) for detailed security information.

**Key points:**

- Do not record sensitive data (PII, tokens, passwords) in steps
- Use HTTPS in production
- Rotate API keys regularly
- Protect Supabase credentials (especially service role key)
- Limit Supabase RLS policies as needed

---

For implementation details, see component README files:

- [SDK Documentation](../packages/xray-sdk/README.md)
- [Backend Documentation](../server/README.md)
- [Dashboard Documentation](../frontend/README.md)
