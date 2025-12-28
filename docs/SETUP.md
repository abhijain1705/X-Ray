# Local Setup Guide

This guide walks you through setting up X-Ray locally for development or testing.

## Prerequisites

- **Node.js 18+** — [Download](https://nodejs.org)
- **Git** — [Download](https://git-scm.com)
- **Docker** (optional) — [Download](https://docker.com)
- A **Supabase account** — [Sign up](https://supabase.com)
- A **Clerk account** — [Sign up](https://clerk.com)

## Step 1: Clone the Repository

```bash
git clone https://github.com/abhijain1705/x-ray.git
cd x-ray
```

## Step 2: Install Dependencies

```bash
npm install
```

This installs dependencies for all packages (SDK, backend, dashboard) thanks to the monorepo setup.

## Step 3: Set Up Supabase

### Create a Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click **New Project**
3. Choose a name, database password, and region
4. Wait for the project to initialize (~2 minutes)

### Get Your Credentials

From your Supabase dashboard:

1. Go to **Settings > API**
2. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public key** → `SUPABASE_ANON_KEY`
   - **service_role secret key** → `SUPABASE_SERVICE_ROLE_KEY`

Keep these safe! The service role key has full database access.

### Create the Schema

1. In your Supabase project, go to **SQL Editor**
2. Click **New Query**
3. Copy the contents of [`docs/schema.sql`](schema.sql)
4. Paste into the query editor
5. Click **Run**
6. Verify the tables were created: `users`, `apps`, `executions`, `steps`

## Step 4: Set Up Clerk

### Create a Clerk Application

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Click **Create Application**
3. Name it (e.g., "X-Ray Dev")
4. Choose sign-in methods (Email, Google, GitHub, etc.)
5. Click **Create Application**

### Get Your Credentials

From your Clerk application:

1. Go to **API Keys**
2. Copy:
   - **Publishable Key** → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - **Secret Key** → `CLERK_SECRET_KEY`

### Configure Redirect URLs

1. Go to **Settings > URLs**
2. Under **Allowed Redirect URLs**, add:
   ```
   http://localhost:3000/auth/clerk/callback
   ```
   (For production, also add your actual domain.)

## Step 5: Configure Environment Variables

### Backend (.env.local)

```bash
cd server
cp .env.example .env.local
```

Edit `server/.env.local`:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Clerk
CLERK_SECRET_KEY=your-clerk-secret

# Server
PORT=4000
NODE_ENV=development
```

### Dashboard (.env.local)

```bash
cd ../frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-publishable-key
CLERK_SECRET_KEY=your-clerk-secret

# API
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

### SDK

The SDK reads from environment variables or accepts config at runtime:

```env
XRAY_API_KEY=xr_...
XRAY_ENDPOINT=http://localhost:4000
```

(You'll get the API key after creating an app via the dashboard.)

## Step 6: Start All Services

You have two options:

### Option A: Run All at Once (Recommended)

From the root directory:

```bash
npm run dev
```

This starts:

- Backend on `http://localhost:4000`
- Dashboard on `http://localhost:3000`

### Option B: Run Separately

**Terminal 1 — Backend:**

```bash
cd server
npm run start
```

**Terminal 2 — Dashboard:**

```bash
cd frontend
npm run dev
```

## Step 7: Test the Setup

### 1. Create an App via API

```bash
curl -X POST http://localhost:4000/apps \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-1",
    "name": "My Test App"
  }'
```

You'll get a response with an `api_key`. Copy it.

### 2. Send a Test Snapshot

```bash
curl -X POST http://localhost:4000/executions \
  -H "Content-Type: application/json" \
  -H "x-api-key: xr_..." \
  -d '{
    "executionId": "test-exec-1",
    "appId": "test-app",
    "pipeline": "test",
    "environment": "dev",
    "status": "completed",
    "steps": [
      {
        "name": "step1",
        "timestamp": '$(date +%s%3N)',
        "output": { "result": "ok" }
      }
    ],
    "timestamps": {
      "start": '$(date +%s%3N)',
      "end": '$(date +%s%3N)'
    }
  }'
```

Expected response: `{ "success": true }`

### 3. Check the Database

In Supabase > **Table Editor**:

- Go to `executions` table
- You should see your test execution
- Go to `steps` table
- You should see your test step

### 4. Open the Dashboard

Visit `http://localhost:3000`

1. Click **Sign In**
2. Create an account or sign in with a provider
3. Explore the dashboard (currently shows mock data)

## Step 8: Use the SDK in Your App

Install the SDK from your monorepo:

```bash
npm install ../packages/xray-sdk
```

Or, if publishing to npm:

```bash
npm install @xray/sdk
```

Use it in your code:

```typescript
import XRaySDK from "@xray/sdk";

const xray = new XRaySDK({
  apiKey: process.env.XRAY_API_KEY || "xr_...",
  appId: "my-app",
  pipeline: "my-workflow",
});

const execution = xray.startExecution();

execution.recordStep({
  name: "my-decision",
  output: { approved: true },
});

execution.completeExecution();
```

## Troubleshooting

### "Cannot connect to Supabase"

- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Check your Supabase project is active (not paused)
- Test the connection: curl your Supabase URL

### "Clerk key is missing"

- Verify `.env.local` has both `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
- Reload the dashboard after adding env vars

### "Port 4000 already in use"

Change the port:

```bash
PORT=5000 npm run start
```

### Tables not appearing in Supabase

- Run the schema.sql query again
- Check for SQL errors in the Supabase query editor
- Verify you're in the correct database

### SDK snapshots not appearing in the backend

- Check the API key is correct and exists in the `apps` table
- Verify the backend is running and reachable
- Check server logs for errors

## Next Steps

- Read [SDK Documentation](../packages/xray-sdk/README.md)
- Read [Backend Documentation](../server/README.md)
- Read [Dashboard Documentation](../frontend/README.md)
- Check out the [Architecture Overview](../README.md#architecture)

## Tips

- Use **VS Code** with the **Supabase** extension for better DX
- Enable **Clerk logging** in the browser DevTools (Network tab)
- Check **Terminal output** for errors (both backend and dashboard)
- Use **Postman** or **Insomnia** to test the backend API

---

Need help? Open an issue on [GitHub](https://github.com/abhijain1705/x-ray/issues).
