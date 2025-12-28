# Quick Start Card

**TL;DR for getting X-Ray running in 5 minutes.**

## 1. Prerequisites ✓

- Node.js 18+
- Supabase account (free tier)
- Clerk account (free tier)

## 2. Clone & Install

```bash
git clone https://github.com/abhijain1705/x-ray.git
cd x-ray
npm install
```

## 3. Set Up Supabase

1. Create project at [supabase.com](https://supabase.com)
2. Go to **Settings > API**
3. Copy `Project URL` and `anon public key`
4. In Supabase **SQL Editor**, run contents of `docs/schema.sql`

## 4. Set Up Clerk

1. Create app at [clerk.com](https://clerk.com)
2. Go to **API Keys** → copy both keys
3. Add redirect URL: `http://localhost:3000/auth/clerk/callback`

## 5. Environment Variables

### Backend (`server/.env.local`)

```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
CLERK_SECRET_KEY=sk_test_...
PORT=4000
NODE_ENV=development
```

### Dashboard (`frontend/.env.local`)

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

## 6. Start Services

```bash
# Terminal 1: Backend
cd server
npm run start
# → http://localhost:4000

# Terminal 2: Dashboard
cd frontend
npm run dev
# → http://localhost:3000
```

## 7. Create Test App

```bash
curl -X POST http://localhost:4000/apps \
  -H "Content-Type: application/json" \
  -d '{"userId": "test", "name": "My App"}'

# Copy the api_key from response
```

## 8. Send Test Snapshot

```bash
curl -X POST http://localhost:4000/executions \
  -H "x-api-key: xr_..." \
  -H "Content-Type: application/json" \
  -d '{
    "executionId": "test-1",
    "appId": "test-app",
    "pipeline": "test",
    "environment": "dev",
    "status": "completed",
    "steps": [{"name": "step1", "output": {"ok": true}}],
    "timestamps": {"start": '$(date +%s%3N)', "end": '$(date +%s%3N)'}
  }'
```

## 9. Open Dashboard

Visit `http://localhost:3000`

1. Click **Sign In**
2. Create account
3. View dashboard (shows mock data in v0.1)

## 10. Use SDK in Your App

```typescript
import XRaySDK from "@xray/sdk";

const xray = new XRaySDK({
  apiKey: "xr_...", // from step 7
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

---

## 📚 Full Docs

- **Setup:** [docs/SETUP.md](docs/SETUP.md)
- **Architecture:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **API:** [docs/API.md](docs/API.md)
- **SDK:** [packages/xray-sdk/README.md](packages/xray-sdk/README.md)
- **Environment Vars:** [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md)
- **FAQ:** [docs/FAQ.md](docs/FAQ.md)

---

## 🚀 Deploy to Production

- **Backend:** [server/README.md#deployment](server/README.md#deployment)
- **Dashboard:** [frontend/README.md#deployment](frontend/README.md#deployment)
- **Publishing SDK:** [docs/PUBLISHING.md](docs/PUBLISHING.md)

---

## ❓ Stuck?

1. Check [docs/FAQ.md](docs/FAQ.md)
2. Check [docs/SETUP.md#troubleshooting](docs/SETUP.md#troubleshooting)
3. [Open an issue](https://github.com/abhijain1705/x-ray/issues)

---

**That's it! You're ready to go.** 🎉
