# FAQ

Frequently asked questions about X-Ray.

## General Questions

### What is X-Ray?

X-Ray is a decision observability SDK + backend + dashboard. It records multi-step decision processes (like loan approvals, risk scoring, etc.) and visualizes them in a web dashboard.

### How is X-Ray different from Datadog, New Relic, or other APM tools?

X-Ray is purpose-built for **decision observability**, not general application monitoring. It:

- Focuses on multi-step business logic (not system metrics)
- Uses a simple snapshot model (not distributed tracing)
- Has zero dependencies in the SDK
- Is lightweight and non-blocking
- Fits easily into existing applications

Use X-Ray to debug **why** a decision was made. Use APM tools to monitor **how fast** your application runs.

### Is X-Ray open source?

Yes, MIT licensed. See [LICENSE](../LICENSE).

### What does "snapshot-based" mean?

Instead of publishing events as each step occurs, X-Ray buffers steps in memory and flushes a single snapshot when execution completes. This means:

- No per-step network overhead
- Simpler failure handling
- No message queues needed
- Trade-off: latency between execution and dashboard visibility

### Is X-Ray production-ready?

**No.** It's in MVP (v0.1) stage. Expect breaking changes, missing features, and rough edges. Do not use for critical workloads yet.

### What's the roadmap?

See [docs/ROADMAP.md](ROADMAP.md).

---

## SDK Questions

### How do I install the SDK?

```bash
npm install @xray/sdk
```

Then:

```typescript
import XRaySDK from "@xray/sdk";

const xray = new XRaySDK({
  apiKey: process.env.XRAY_API_KEY,
  appId: "my-app",
  pipeline: "my-workflow",
});
```

See [SDK Documentation](../packages/xray-sdk/README.md) for details.

### Does the SDK have external dependencies?

No. Zero dependencies. Just TypeScript types.

### Can I use the SDK in the browser?

Not yet. It's designed for server-side use (Node.js). Browser SDK is on the roadmap.

### Does the SDK block my application?

No. Recording steps is synchronous and ~0.1ms per step. Flushing the snapshot is asynchronous and non-blocking.

### What if the backend is down when I flush?

The snapshot is silently dropped. Your application continues normally. This is intentional — observability should never take down your app.

### Can I retry failed snapshots?

Not in v0.1. The SDK is fire-and-forget. This is on the roadmap.

### What if a step contains sensitive data (PII, tokens)?

**Don't record it.** The SDK doesn't encrypt data, and it's sent over the network. Only record what you need for debugging.

See [SECURITY.md](../SECURITY.md) for more.

### Can I customize the snapshot format?

Not yet. The schema is fixed. Custom fields can be added to the `metadata` object.

### How much data can a snapshot contain?

Practically unlimited, but keep payloads < 10MB for safety. The SDK JSON-serializes the snapshot, so ensure `input`, `output`, and `metadata` are serializable.

### Can I use the SDK in async code?

Yes. The SDK is fully async-safe. All methods are synchronous but non-blocking.

```typescript
await someAsyncOperation();
execution.recordStep({ ... });
await anotherAsyncOperation();
execution.completeExecution();
```

### How do I handle errors in the SDK?

The SDK silently ignores errors. If you need to debug, use `getSnapshot()`:

```typescript
const snapshot = execution.getSnapshot();
console.log(snapshot);
```

---

## Backend Questions

### What database does X-Ray use?

Supabase (PostgreSQL). Free tier works fine for development.

### Can I use a different database?

Not in v0.1. But the schema is portable — you could reimplement against any SQL database.

### How do I set up the database?

See [Local Setup Guide](SETUP.md#step-3-set-up-supabase).

TL;DR:

1. Create a Supabase project
2. Run the SQL schema from `docs/schema.sql`
3. Add credentials to `.env.local`

### Does the backend scale?

Not yet. It's a single Node.js instance. For v1.0, horizontal scaling and load balancing are planned.

### How do I deploy the backend?

To Vercel, Railway, AWS EC2, or any Node.js host. See [Backend Documentation](../server/README.md#deployment).

### What's the API key format?

`xr_` followed by a UUID: `xr_550e8400-e29b-41d4-a716-446655440000`

### How do I rotate API keys?

Delete the app and create a new one (no rotation endpoint yet). This is on the roadmap.

### Can I use the backend without the SDK?

Yes. The backend is just a REST API. Call `/executions` directly with the right JSON format. See [API Reference](API.md).

### What's the difference between `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`?

- **Anon key**: Has limited permissions, suitable for frontend
- **Service role key**: Full database access, use only on backend

For X-Ray, the backend should use the **service role key**.

---

## Dashboard Questions

### Do I need a Clerk account?

Yes. The dashboard uses Clerk for user authentication. [Sign up here](https://clerk.com).

### Can I use a different auth provider?

Not in v0.1. Clerk is built-in. Other providers are on the roadmap.

### How do I set up Clerk?

See [Local Setup Guide](SETUP.md#step-4-set-up-clerk).

TL;DR:

1. Create a Clerk application
2. Add redirect URLs
3. Copy credentials to `.env.local`

### Can I run the dashboard without the backend?

No. The dashboard reads from Supabase (via the backend). Both must be running.

### Does the dashboard support dark mode?

Yes. Toggle in the header.

### Can I embed the dashboard in my app?

Not yet. The dashboard is a standalone app. Embedding is on the roadmap.

### How do I share executions with my team?

Not yet. Team collaboration is on the roadmap.

---

## Troubleshooting

### "API key is missing"

Your `.env.local` doesn't have `XRAY_API_KEY`, or it's set to an empty string.

Add it:

```env
XRAY_API_KEY=xr_...
```

### "Invalid API key"

The API key doesn't exist in the `apps` table. Make sure:

1. You created an app via `/apps` endpoint
2. You're using the correct key
3. The backend can reach Supabase

### "Cannot connect to Supabase"

Check:

1. `SUPABASE_URL` is correct
2. `SUPABASE_ANON_KEY` is correct
3. Your Supabase project is active (not paused)

### Snapshots not appearing in the dashboard

1. Check the backend received the POST (look at logs)
2. Verify the API key exists in the `apps` table
3. Check Supabase for the `executions` record
4. Reload the dashboard

### "Port 4000 already in use"

Change the port:

```bash
PORT=5000 npm run start
```

### SDK is slow / blocking my app

It shouldn't be. Recording steps is ~0.1ms. If it's slow:

1. Check if `recordStep()` calls are in a tight loop (> 10k steps)
2. Profile with DevTools
3. Check network latency to backend
4. File an issue on GitHub

### Dashboard is blank / shows no executions

The dashboard currently shows mock data (v0.1). Real data query APIs are on the roadmap.

### "Clerk key is invalid"

Check `.env.local`:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` should be your **publishable** key
- `CLERK_SECRET_KEY` should be your **secret** key

---

## Performance & Scaling

### How many steps can I record per execution?

Practically unlimited. Tested up to 1000 steps without issues.

### How many executions per second can the backend handle?

~100 executions/sec on a small instance (with Supabase). This is not optimized yet.

### How do I scale the backend?

v0.1 doesn't support clustering. For v1.0, we're planning:

- Horizontal scaling (multiple instances)
- Load balancing
- Connection pooling
- Batch inserts

In the meantime, deploy on a larger instance (Railway, AWS, etc.).

### How much storage do I need?

Rough estimates:

- 1KB per step (depending on data)
- 1 year of executions (assuming 1000/day) ≈ 365GB

Supabase free tier gives 500MB. Upgrade as needed.

### Should I delete old executions?

Not yet. There's no retention policy. Manually delete old records:

```sql
DELETE FROM executions WHERE created_at < NOW() - INTERVAL '30 days';
```

Automation is on the roadmap.

---

## Security

### Where should I store my API key?

Like any secret:

- Environment variables (`.env.local`, not in Git)
- Secrets manager (AWS Secrets Manager, HashiCorp Vault)
- Never hardcode

### Should I use HTTPS in production?

**Yes.** Snapshots contain potentially sensitive business logic. Use HTTPS everywhere.

### Can I encrypt data at rest?

Supabase supports encryption at rest (paid feature). Enable in Supabase dashboard.

### What if someone steals my API key?

They can write executions to your app. Delete the app and create a new one (invalidating the key).

For more, see [SECURITY.md](../SECURITY.md).

---

## Billing

### How much does X-Ray cost?

X-Ray itself is open source and free.

You pay for:

- **Supabase**: Free tier (500MB), then $25/mo for 10GB
- **Clerk**: Free tier (10,000 MAU), then $0.02/MAU above that
- **Hosting**: Free (Vercel) to $20+/mo (traditional VPS)

### Can I self-host everything?

Yes. X-Ray is fully open source. You can run it on your own infrastructure.

- Supabase: Self-host PostgreSQL
- Backend: Your server
- Dashboard: Your server
- Clerk: No self-hosted option yet (but other auth providers work)

---

## Contributing

### How can I contribute?

See [CONTRIBUTING.md](../CONTRIBUTING.md).

### Where should I start?

- Check the [roadmap](ROADMAP.md)
- Open an issue to discuss your idea
- Submit a PR with tests and docs

### What if I find a security vulnerability?

Email [security@example.com](mailto:security@example.com). Do not open a public issue.

See [SECURITY.md](../SECURITY.md).

---

## Getting Help

- **Docs**: Read [README.md](../README.md) and component READMEs
- **Setup**: Follow [Local Setup Guide](SETUP.md)
- **API**: Check [API Reference](API.md)
- **Issues**: [GitHub Issues](https://github.com/abhijain1705/x-ray/issues)
- **Discussions**: [GitHub Discussions](https://github.com/abhijain1705/x-ray/discussions)

---

## Feedback

Questions not answered here? [Start a discussion](https://github.com/abhijain1705/x-ray/discussions) or [open an issue](https://github.com/abhijain1705/x-ray/issues).
