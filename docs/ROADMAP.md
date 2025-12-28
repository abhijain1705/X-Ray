# Roadmap

X-Ray is in **MVP (v0.1)** stage. This roadmap describes planned improvements.

## v0.1 (Current)

- ✅ SDK for TypeScript/Node.js
- ✅ Backend for snapshot ingestion
- ✅ Supabase persistence
- ✅ Clerk authentication
- ✅ Basic dashboard (read-only)
- ✅ Documentation

## v0.2 (Next)

- [ ] **Execution Search** — Filter by pipeline, status, date range
- [ ] **Step Search** — Find steps by name or reasoning
- [ ] **API Endpoints** — `GET /executions`, `GET /steps` for dashboard
- [ ] **Better Error Messages** — More verbose logging and error details
- [ ] **Request Signing** — HMAC-based request authentication (more secure than header keys)
- [ ] **Batch Inserts** — Optimize steps insertion (bulk query instead of N inserts)

## v0.3

- [ ] **WebSockets** — Real-time execution updates in dashboard
- [ ] **Execution Replay** — Debug mode to replay a recorded execution
- [ ] **Metrics & Stats** — Execution count, average duration, failure rate
- [ ] **Alerting** — Notify on failed executions or slow pipelines
- [ ] **Rate Limiting** — Built-in rate limiting (not just reverse proxy)
- [ ] **SDK Browser Support** — Send snapshots from browser apps (with CORS support)

## v0.4

- [ ] **Team Collaboration** — Share apps with team members
- [ ] **RBAC** — Role-based access control (admin, viewer, editor)
- [ ] **Audit Logging** — Log all data access
- [ ] **Data Retention Policies** — Automatic cleanup of old executions
- [ ] **Export** — Download execution data as JSON/CSV
- [ ] **Custom Fields** — Add metadata fields to apps

## v1.0 (Production Ready)

- [ ] Hardened security (encryption at rest, TLS everywhere)
- [ ] High availability (multi-instance, load balancing)
- [ ] Comprehensive observability (Prometheus metrics, structured logging)
- [ ] Performance optimizations (caching, indexing strategy)
- [ ] SDKs for other languages (Python, Go, Ruby, Java)
- [ ] Official managed hosting option (optional SaaS)

## Excluded (Intentionally Out of Scope)

The following features are **not planned** because they violate X-Ray's design philosophy:

- ❌ Event streaming (Kafka, Pub/Sub) — conflicts with snapshot model
- ❌ Complex retries/queues — we keep it simple
- ❌ Real-time observability (< 1s latency) — not a goal
- ❌ Distributed tracing (trace IDs, parent-child spans) — different use case
- ❌ Custom aggregations/analytics — use a data warehouse instead
- ❌ Execution modification/replay in production — dangerous

## Contributing

Want to help? Start with:

1. Pick a feature from this roadmap
2. Open an issue to discuss approach
3. Submit a PR with tests and docs
4. Follow [CONTRIBUTING.md](../CONTRIBUTING.md)

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## Feedback

- Have a feature idea? [Open an issue](https://github.com/abhijain1705/x-ray/issues)
- Want to chat? [Start a discussion](https://github.com/abhijain1705/x-ray/discussions)
- Security concern? See [SECURITY.md](../SECURITY.md)
