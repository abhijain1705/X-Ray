# Contributing to X-Ray

Thanks for your interest in X-Ray! We welcome contributions, especially in these areas:

- Bug reports and fixes
- Documentation improvements
- SDK enhancements (within the snapshot model)
- Backend stability and performance
- Dashboard UX improvements

## Code of Conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## How to Contribute

### 1. Report Issues

- Check [existing issues](https://github.com/abhijain1705/x-ray/issues) first
- Include reproducible steps, environment details, and error logs
- For security issues, see [SECURITY.md](SECURITY.md)

### 2. Submit Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Make focused, atomic commits
4. Push to your fork and open a pull request

### 3. Development Setup

```bash
git clone https://github.com/abhijain1705/x-ray.git
cd x-ray
npm install

# Set up environment variables
# Backend
cd server
cp .env.example .env.local
# Edit .env.local with your Supabase and Clerk keys

# Dashboard
cd ../frontend
cp .env.example .env.local
# Edit .env.local

# SDK
cd ../packages/xray-sdk
npm install
```

### 4. Code Style

- Use TypeScript for all code
- Follow the existing style (no Prettier config changes without discussion)
- Format with Prettier before committing
- Keep commits focused and with clear messages

### 5. Testing

Before submitting a PR:

```bash
# SDK
cd packages/xray-sdk
npm run build
npm run test  # if tests exist

# Backend
cd server
npm run start  # smoke test
```

### 6. Pull Request Guidelines

- Title: Clear and descriptive (e.g., "fix: handle missing API key in SDK")
- Description: Explain _why_ the change is needed, not just what changed
- Link related issues
- Keep PRs focused — one feature or bug fix per PR
- Be prepared to discuss trade-offs and design decisions

## What We Won't Accept

- Features that violate the snapshot-based design philosophy
- Complex infrastructure changes (Kafka, queues, streaming)
- Bloated dependencies
- Marketing or hype-driven content

## What We Welcome

- Simplifications and refactorings
- Performance improvements (measured, not theoretical)
- Better error messages and logging
- Documentation clarity
- Security hardening

## Scope Limitations

X-Ray is intentionally simple. We prioritize:

1. **Clarity** — code and architecture are easy to understand
2. **Simplicity** — minimal moving parts
3. **Reliability** — best-effort ingestion with no failure cascades
4. **Observability** — the tool itself should be transparent

If a feature adds complexity without clear benefit, we'll likely decline it.

## Release Process

(To be defined as the project matures)

## Questions?

Open a discussion on [GitHub Discussions](https://github.com/abhijain1705/x-ray/discussions) or ask in an issue.

---

**Thank you for contributing!**
