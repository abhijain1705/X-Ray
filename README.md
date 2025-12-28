# X-Ray

**Decision observability for production systems.**

X-Ray is a lightweight SDK + backend that records multi-step decision executions, persists them, and visualizes timelines in a dashboard. It's designed for systems where you need visibility into how decisions were made without incurring the overhead of event streaming or complex infrastructure.

## Overview

X-Ray consists of three components:

- **SDK** (`packages/xray-sdk`) — TypeScript library that instruments code and records decision steps
- **Backend** (`server`) — Node.js + Express service that ingests execution snapshots and persists to Supabase
- **Dashboard** (`apps/dashboard`) — Next.js application for viewing executions and decision timelines

## Design Philosophy

X-Ray takes a **snapshot-based** approach to observability:

1. Your code calls the SDK to record steps in a decision execution
2. Steps are buffered in memory (no network overhead per step)
3. When the execution completes or fails, a single snapshot is flushed to the backend
4. The backend validates the API key, persists the snapshot, and breaks it into steps
5. The dashboard queries the backend to display decision timelines

**Why snapshots?** They trade real-time visibility for simplicity. You don't need a message queue, streaming infrastructure, or complex retry logic. The SDK is non-blocking and best-effort. If the network is down when the snapshot flushes, it's silently dropped — this is acceptable for observability, not for transactional data.

## Key Properties

- **Non-blocking** — recording steps never blocks your application
- **Best-effort** — no retries or durability guarantees for network failures
- **Lightweight** — zero external dependencies in the SDK
- **Stateless** — backend validates all data via API key
- **Simple schema** — three tables: apps, executions, steps

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account (free tier works fine)
- Clerk account (for dashboard auth)

### Quick Start

1. Clone and install dependencies:

```bash
git clone https://github.com/abhijain1705/x-ray.git
cd x-ray
npm install
```

2. Set up Supabase:

   - Create a new Supabase project
   - Run the schema SQL (see `docs/schema.sql`)
   - Copy your `SUPABASE_URL` and `SUPABASE_ANON_KEY`

3. Set up Clerk:

   - Create a new Clerk application
   - Copy your `CLERK_SECRET_KEY` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

4. Configure environment variables:

```bash
# Backend
cd server
cp .env.example .env.local
# Fill in SUPABASE_URL, SUPABASE_ANON_KEY, CLERK_SECRET_KEY

# Dashboard
cd ../frontend
cp .env.example .env.local
# Fill in NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, NEXT_PUBLIC_API_BASE_URL
```

5. Run all services:

```bash
# Terminal 1: Backend
cd server
npm run start

# Terminal 2: Dashboard
cd frontend
npm run dev

# In your application code:
npm install @xray/sdk
```

See individual READMEs for detailed setup:

- [SDK Documentation](packages/xray-sdk/README.md)
- [Backend Documentation](server/README.md)
- [Dashboard Documentation](frontend/README.md)

## Example Usage

```typescript
import XRaySDK from "@xray/sdk";

const xray = new XRaySDK({
  apiKey: process.env.XRAY_API_KEY || "xr_...",
  appId: "my-loan-app",
  pipeline: "loan-approval",
  environment: "prod",
});

const execution = xray.startExecution();

// Record decision steps
execution.recordStep({
  name: "fetch_credit_score",
  input: { userId: "123" },
  output: { score: 750 },
  status: "completed",
});

execution.recordStep({
  name: "calculate_risk_tier",
  input: { score: 750 },
  output: { tier: "A" },
  status: "completed",
});

execution.recordStep({
  name: "check_approval_rules",
  input: { tier: "A" },
  output: { approved: true, reason: "Score >= 700" },
  reasoning: "Applied rule: tier A applicants always approved",
  status: "completed",
});

// Mark complete - triggers snapshot flush to backend
execution.completeExecution();

// Or if an error occurred:
// execution.failExecution();
```

The snapshot is flushed asynchronously. You don't wait for it.

## Architecture

```
┌──────────────────────────────────────┐
│  Your Application                    │
│  ├─ SDK (buffers steps in memory)   │
│  └─ On complete: flush snapshot     │
└──────────┬───────────────────────────┘
           │ HTTP POST /executions
           │ { executionId, appId, pipeline, steps, ... }
           │
┌──────────▼───────────────────────────┐
│  Backend (Node.js + Express)         │
│  ├─ Validate API key                │
│  ├─ Insert execution                │
│  └─ Insert steps (bulk)             │
└──────────┬───────────────────────────┘
           │ Supabase (Postgres)
           │
┌──────────▼───────────────────────────┐
│  Supabase                            │
│  ├─ apps (for API key auth)         │
│  ├─ users (Clerk + manual tracking) │
│  ├─ executions                      │
│  └─ steps                           │
└──────────────────────────────────────┘
           │ SELECT queries
           │
┌──────────▼───────────────────────────┐
│  Dashboard (Next.js)                 │
│  ├─ Clerk auth (user layer)         │
│  ├─ List apps & executions          │
│  └─ View step timelines             │
└──────────────────────────────────────┘
```

## Limitations

- **Not for transactional data** — snapshots can be lost if the backend is down
- **Not for real-time observability** — latency between execution and dashboard visibility
- **Single backend instance** — no built-in clustering or HA
- **Dashboard is read-only** — no editing or replay capabilities (v0.1)
- **No retention policy** — you must manage database cleanup

## Configuration

### SDK

| Variable        | Required | Default                 | Purpose                                      |
| --------------- | -------- | ----------------------- | -------------------------------------------- |
| `XRAY_API_KEY`  | Yes      | —                       | API key issued by backend (format: `xr_...`) |
| `XRAY_ENDPOINT` | No       | `http://localhost:4000` | Backend URL for snapshot ingestion           |

### Backend

| Variable            | Required | Default | Purpose                                  |
| ------------------- | -------- | ------- | ---------------------------------------- |
| `SUPABASE_URL`      | Yes      | —       | Supabase project URL                     |
| `SUPABASE_ANON_KEY` | Yes      | —       | Supabase anonymous key (or service role) |
| `CLERK_SECRET_KEY`  | Yes      | —       | Clerk secret for user sync               |
| `PORT`              | No       | `4000`  | Port to listen on                        |

### Dashboard

| Variable                            | Required | Default | Purpose                                     |
| ----------------------------------- | -------- | ------- | ------------------------------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes      | —       | Clerk publishable key                       |
| `CLERK_SECRET_KEY`                  | Yes      | —       | Clerk secret for API calls                  |
| `NEXT_PUBLIC_API_BASE_URL`          | Yes      | —       | Backend URL (e.g., `http://localhost:4000`) |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT. See [LICENSE](LICENSE) for details.

## Security

For security concerns, see [SECURITY.md](SECURITY.md).

## Support

- Documentation: See [docs/](docs/) folder
- Issues: [GitHub Issues](https://github.com/abhijain1705/x-ray/issues)
- Discussions: [GitHub Discussions](https://github.com/abhijain1705/x-ray/discussions)

## Maintainer

Abhi Jain (<abhijain1705@gmail.com>)

---

**Status**: MVP (v0.1). Expect breaking changes. Not production-ready yet.
