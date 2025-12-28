# X-Ray Documentation Index

This is a comprehensive guide to all X-Ray documentation files.

## Root-Level Documentation

### [README.md](../README.md)

The main project README. Start here for:

- Project overview
- Key properties and design philosophy
- Getting started guide
- Quick example
- Architecture diagram
- Configuration reference
- Support links

### [CONTRIBUTING.md](../CONTRIBUTING.md)

Guidelines for contributing. Covers:

- Code of conduct reference
- Issue reporting
- Pull request process
- Development setup
- Code style guidelines
- What we won't accept
- Release process

### [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md)

Community standards. Defines:

- Expected behavior
- Unacceptable behavior
- Enforcement process

### [SECURITY.md](../SECURITY.md)

Security policy and best practices. Includes:

- Vulnerability reporting process
- Security considerations for each component
- Known limitations
- Best practices for production
- Future security improvements

### [LICENSE](../LICENSE)

MIT license text.

## Documentation Directory (`docs/`)

### [docs/SETUP.md](SETUP.md)

Complete local development setup guide. Covers:

- Prerequisites
- Step-by-step setup (Git, npm, Supabase, Clerk)
- Environment variable configuration
- Starting all services
- Testing the setup
- Using the SDK in your app
- Troubleshooting
- Next steps

**Start here** for getting X-Ray running locally.

### [docs/ARCHITECTURE.md](ARCHITECTURE.md)

System design and architecture overview. Includes:

- High-level system design
- Key design principles (snapshot-based, non-blocking, stateless)
- Component descriptions
- Database schema explanation
- Authentication & authorization model
- Complete data flow example
- Performance characteristics
- Limitations
- Future improvements

**Read this** to understand how X-Ray works internally.

### [docs/API.md](API.md)

Complete API reference for the backend. Covers:

- Authentication
- Error handling
- All endpoints (ingestion, app management, user management, health)
- Request/response formats
- Data type definitions
- Rate limiting info
- Examples
- Future APIs

**Use this** when integrating with the backend or calling APIs directly.

### [docs/ROADMAP.md](ROADMAP.md)

Future plans and feature backlog. Lists:

- v0.2 planned features
- v0.3 planned features
- v0.4 planned features
- v1.0 goals
- Intentionally excluded features
- How to contribute to roadmap items

**Check here** to see what's coming and learn how to contribute.

### [docs/FAQ.md](FAQ.md)

Frequently asked questions organized by topic:

- General questions
- SDK questions
- Backend questions
- Dashboard questions
- Troubleshooting
- Performance & scaling
- Security
- Billing
- Contributing
- Getting help

**Consult this** if you have a common question about X-Ray.

### [docs/schema.sql](schema.sql)

Supabase database schema. Contains:

- Table definitions (users, apps, executions, steps)
- Indexes
- Optional row-level security policies

**Run this** in your Supabase SQL editor to set up the database.

## Component Documentation

### SDK (`packages/xray-sdk/`)

#### [packages/xray-sdk/README.md](../packages/xray-sdk/README.md)

Complete SDK documentation. Covers:

- Installation
- Quick start guide
- API reference (all methods and options)
- Configuration
- Design philosophy
- Non-blocking design
- Error handling
- Usage examples (loan approval, decision tree)
- Troubleshooting
- Performance characteristics
- FAQ

**Read this** before using the SDK in your application.

#### [packages/xray-sdk/package.json](../packages/xray-sdk/package.json)

SDK npm package configuration.

#### [packages/xray-sdk/tsconfig.json](../packages/xray-sdk/tsconfig.json)

TypeScript compiler configuration for the SDK.

### Backend (`server/`)

#### [server/README.md](../server/README.md)

Complete backend documentation. Covers:

- Prerequisites
- Installation
- Environment variables
- Configuration
- Running the server
- API endpoints (detailed)
- Database schema
- Local development walkthrough
- Error handling model
- Performance considerations
- Deployment options
- Monitoring
- Troubleshooting
- Future improvements

**Read this** to understand and run the backend.

#### [server/.env.example](../server/.env.example)

Example environment variables for the backend. Copy and fill in with your credentials.

### Dashboard (`frontend/`)

#### [frontend/README.md](../frontend/README.md)

Complete dashboard documentation. Covers:

- Prerequisites
- Installation
- Environment variables
- Clerk setup (detailed)
- Running the dashboard
- Architecture & project structure
- Features (current and future)
- Styling approach
- API integration
- Local development
- Production builds
- Deployment options
- Theme customization
- Troubleshooting

**Read this** to run and understand the dashboard.

#### [frontend/.env.example](../frontend/.env.example)

Example environment variables for the dashboard. Copy and fill in with your credentials.

## Quick Navigation

### I want to...

**...get started locally** → [docs/SETUP.md](SETUP.md)

**...understand the architecture** → [docs/ARCHITECTURE.md](ARCHITECTURE.md)

**...use the SDK in my app** → [packages/xray-sdk/README.md](../packages/xray-sdk/README.md)

**...integrate with the backend** → [docs/API.md](API.md) + [server/README.md](../server/README.md)

**...run the dashboard** → [frontend/README.md](../frontend/README.md)

**...ask a question** → [docs/FAQ.md](FAQ.md)

**...report a bug** → [CONTRIBUTING.md](../CONTRIBUTING.md)

**...report a security issue** → [SECURITY.md](../SECURITY.md)

**...see what's coming** → [docs/ROADMAP.md](ROADMAP.md)

**...understand the design** → [docs/ARCHITECTURE.md](ARCHITECTURE.md)

**...set up the database** → [docs/schema.sql](schema.sql)

## Documentation Standards

All X-Ray documentation follows these principles:

- **Clear and honest** — written for engineers, not beginners
- **Complete** — sufficient to use the component independently
- **Practical** — includes examples and troubleshooting
- **Explicit** — states limitations and trade-offs
- **Up-to-date** — matches the current codebase (v0.1)

## Contributing Documentation

Found a typo? Unclear explanation? [Open an issue](https://github.com/abhijain1705/x-ray/issues) or submit a PR.

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

---

**Last Updated:** January 2025  
**Version:** 0.1
