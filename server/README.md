# X-Ray Backend

**Ingestion and data persistence service.**

The backend is a Node.js + Express server that:

- Receives execution snapshots from the SDK
- Validates API keys
- Persists executions and steps to Supabase
- Manages user authentication (Clerk)
- Exposes read APIs for the dashboard

## Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account (free tier)
- Clerk account
- `dotenv` configured (via `.env.local`)

## Installation

```bash
cd server
npm install
```

## Configuration

### Environment Variables

Create a `.env.local` file with:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Clerk (for dashboard user sync)
CLERK_SECRET_KEY=your-clerk-secret

# Server
PORT=4000
NODE_ENV=development
```

See [.env.example](.env.example) for all variables.

**Important:** Use the **service role key** for production (not the anon key). It has full access to all tables.

### Supabase Schema

Before running the server, set up the Supabase database:

1. In the Supabase dashboard, go to **SQL Editor**
2. Create a new query and paste the contents of [`docs/schema.sql`](../../docs/schema.sql)
3. Run the query
4. Verify tables are created: `apps`, `users`, `executions`, `steps`

See [docs/schema.sql](../../docs/schema.sql) for the full schema.

## Running the Server

### Development

```bash
npm run start
```

The server runs on `http://localhost:4000` by default.

**Watch mode:**

```bash
npm run dev
```

(Nodemon automatically restarts on file changes.)

### Production

```bash
npm run build
npm start
```

(Note: Currently no build step — just runs the TypeScript directly via `ts-node`.)

## API Endpoints

### Ingestion

#### `POST /executions`

Receives an execution snapshot from the SDK.

**Headers:**

- `x-api-key`: API key (validated against `apps` table)
- `Content-Type: application/json`

**Request Body:**

```json
{
  "executionId": "uuid",
  "appId": "my-loan-app",
  "pipeline": "loan-approval",
  "environment": "prod",
  "status": "completed",
  "steps": [
    {
      "name": "fetch_credit_score",
      "timestamp": 1234567890000,
      "input": { "userId": "123" },
      "output": { "score": 750 },
      "status": "completed"
    }
  ],
  "timestamps": {
    "start": 1234567890000,
    "end": 1234567891000
  }
}
```

**Response:**

```json
{ "success": true }
```

**Error Responses:**

- `401 { "error": "Missing API key" }` — if `x-api-key` header is missing
- `401 { "error": "Invalid API key" }` — if the API key is not found in the `apps` table
- `400 { "error": "..." }` — if the request body is invalid

**Notes:**

- Snapshots are best-effort. If ingestion fails, the response is still `{ "success": false }` (not an error status code).
- The backend does not validate the snapshot schema. Invalid data is persisted as-is.
- If steps are missing, the execution is created with no steps.

#### `POST /apps`

Creates a new application and generates an API key.

**Headers:**

- `Content-Type: application/json`

**Request Body:**

```json
{
  "userId": "user-uuid",
  "name": "My Loan App"
}
```

**Response:**

```json
{
  "id": "app-uuid",
  "user_id": "user-uuid",
  "name": "My Loan App",
  "api_key": "xr_abc123...",
  "created_at": "2025-01-01T00:00:00Z"
}
```

**Error Responses:**

- `400 { "error": "Missing fields" }` — if `userId` or `name` is missing
- `500 { "error": "..." }` — if database insertion fails

**Notes:**

- The API key format is `xr_<uuid>`.
- Store this API key securely. It's used to authenticate snapshot ingestion.

#### `POST /auth/sync-user`

Syncs a Clerk user with the local `users` table.

**Headers:**

- `Content-Type: application/json`

**Request Body:**

```json
{
  "clerkUserId": "user_...",
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "id": "user-uuid",
  "clerk_user_id": "user_...",
  "email": "user@example.com",
  "created_at": "2025-01-01T00:00:00Z"
}
```

**Notes:**

- Called by the dashboard after Clerk authentication.
- If the user already exists, returns the existing record.

### Utility

#### `GET /`

Health check.

**Response:**

```
Welcome to my server!
```

## Database Schema

### `apps` table

Stores applications and their API keys.

```sql
CREATE TABLE apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  api_key TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Columns:**

- `id` — Unique application ID
- `user_id` — Owner of the application (foreign key to `users`)
- `name` — Human-readable application name
- `api_key` — API key for SDK authentication (format: `xr_...`)
- `created_at` — Timestamp of creation

### `users` table

Stores users synced from Clerk.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Columns:**

- `id` — Unique user ID
- `clerk_user_id` — Clerk's user ID (used for syncing)
- `email` — User email
- `created_at` — Timestamp of creation

### `executions` table

Stores decision execution snapshots.

```sql
CREATE TABLE executions (
  id UUID PRIMARY KEY,
  app_id UUID NOT NULL REFERENCES apps(id),
  pipeline TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Columns:**

- `id` — Execution ID (UUID from SDK)
- `app_id` — Application that created the execution (foreign key)
- `pipeline` — Pipeline/workflow name
- `status` — `pending`, `in_progress`, `completed`, or `failed`
- `started_at` — When execution started
- `ended_at` — When execution ended (null if still running)
- `created_at` — When the server persisted it

### `steps` table

Stores individual steps within an execution.

```sql
CREATE TABLE steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID NOT NULL REFERENCES executions(id),
  name TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  input JSONB,
  output JSONB,
  reasoning TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Columns:**

- `id` — Unique step ID
- `execution_id` — Which execution this step belongs to (foreign key)
- `name` — Step identifier
- `timestamp` — When the step was recorded
- `input` — Step input (stored as JSON)
- `output` — Step output (stored as JSON)
- `reasoning` — Decision reasoning (text)
- `metadata` — Custom metadata (stored as JSON)
- `created_at` — When the server persisted it

## Local Development

### 1. Set up Supabase locally (optional)

To run Supabase locally, use Docker:

```bash
docker run --rm \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres \
  postgres:15
```

Then update `.env.local`:

```env
SUPABASE_URL=http://localhost:3000
SUPABASE_ANON_KEY=your-local-key
```

(For local development, just use a real Supabase project for simplicity.)

### 2. Run the server

```bash
npm run start
```

### 3. Test the API

**Create an app:**

```bash
curl -X POST http://localhost:4000/apps \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user-id", "name": "Test App"}'
```

Copy the `api_key` from the response.

**Send a snapshot:**

```bash
curl -X POST http://localhost:4000/executions \
  -H "Content-Type: application/json" \
  -H "x-api-key: xr_..." \
  -d '{
    "executionId": "test-exec-1",
    "appId": "test-app",
    "pipeline": "test-pipeline",
    "environment": "dev",
    "status": "completed",
    "steps": [
      {
        "name": "step1",
        "output": { "result": true }
      }
    ],
    "timestamps": { "start": '$(date +%s%3N)', "end": '$(date +%s%3N)' }
  }'
```

**Check the database:**

In Supabase dashboard, query the `executions` and `steps` tables to verify data was persisted.

## Error Handling

The backend uses a **best-effort ingestion model**:

- If the snapshot is malformed, it's still inserted (with whatever fields are valid)
- If the database is down, the client gets a `{ "success": false }` response (not a 5xx status)
- If the API key is invalid, a `401` is returned (client should retry or alert)

Errors are logged to stdout. Monitor them in production.

## Performance Considerations

- **No database connection pooling** — each request opens a new connection (okay for small volume)
- **No batch writes** — each step is inserted individually (fine for < 100 steps/execution)
- **No caching** — every API key lookup hits the database
- **No rate limiting** — deploy behind a reverse proxy (Nginx, CloudFlare) if needed

## Deployment

### Hosting Options

- **Vercel** (if using serverless Node)
- **Railway** (recommended for simplicity)
- **AWS EC2, DigitalOcean, Fly.io** (for traditional servers)

### Environment Setup

1. Set all env vars in your host (use their secrets manager)
2. Deploy the code (Git push, Docker, etc.)
3. Verify the `/` endpoint responds
4. Monitor server logs for errors

### Database Migrations

Currently, there's no migration system. Manually run the SQL schema in your production Supabase project.

For future versions, consider:

- Supabase migrations
- Flyway
- Node.js-based migration tool

## Monitoring

- **Logs**: Check stdout/stderr for errors and request logs
- **Database**: Monitor Supabase dashboard for slow queries, table size
- **Uptime**: Use a health check service (e.g., Healthchecks.io, Sentry)

## Troubleshooting

### "Invalid API key"

- Verify the `x-api-key` header matches an entry in the `apps` table
- Check the API key format (should start with `xr_`)

### "Cannot find SUPABASE_URL"

- Ensure `.env.local` exists and contains `SUPABASE_URL`
- Check `dotenv` is imported at the top of `src/index.ts`

### "Executions not appearing in database"

- Verify the API key is valid (insert a test record in the `apps` table)
- Check the POST request includes the `x-api-key` header
- Look at server logs for errors

### High database CPU

- Check if there are slow queries (view in Supabase dashboard)
- Add indexes to frequently queried columns (e.g., `app_id`, `created_at`)

## Future Improvements

- [ ] Rate limiting
- [ ] Request signing (HMAC)
- [ ] Metrics/observability (Prometheus)
- [ ] Batch inserts for steps
- [ ] Query APIs for dashboard
- [ ] User RBAC (who can see which apps)
- [ ] Data retention policies

---

## Support

- **Issues**: [GitHub Issues](https://github.com/abhijain1705/x-ray/issues)
- **Discussions**: [GitHub Discussions](https://github.com/abhijain1705/x-ray/discussions)

## License

MIT. See [LICENSE](../../LICENSE) for details.
