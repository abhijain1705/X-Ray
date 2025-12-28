# Security Policy

## Reporting a Vulnerability

**Do not open public issues for security vulnerabilities.**

If you discover a security vulnerability, please email [security@example.com](mailto:security@example.com) with:

- Description of the vulnerability
- Steps to reproduce (if applicable)
- Affected versions
- Potential impact

We will acknowledge your report within 48 hours and provide updates as we work on a fix.

## Security Considerations

### SDK

- **API Key Storage**: The SDK does not securely store the API key. Treat it as you would any secret — use environment variables, not hardcoded strings.
- **Snapshot Content**: All data in a recorded step (input, output, reasoning) is sent to the backend unencrypted (unless TLS is enabled). Do not record sensitive personal data (PII, tokens, passwords).
- **No Encryption**: Snapshots are sent over HTTP by default. Use HTTPS in production.

### Backend

- **API Key Validation**: The backend validates API keys by querying Supabase. This is stateless but slower than token-based auth. For high-volume scenarios, consider caching.
- **No Rate Limiting**: The backend does not implement rate limiting. Deploy behind a reverse proxy (Nginx, CloudFlare) if needed.
- **Best-Effort Ingestion**: Failed snapshots are silently dropped. This is intentional but means you have no durability guarantees.
- **Supabase Credentials**: Protect your `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`. The former should be treated as public (it's used in the frontend), but limit RLS policies appropriately.

### Dashboard

- **User Authentication**: The dashboard uses Clerk for user auth. Users can only see executions and steps — there is no ability to modify data.
- **API Access**: The dashboard makes requests to the backend. Ensure the backend is not publicly exposed to untrusted networks.

## Known Limitations

- No audit logging for data access
- No encryption at rest in Supabase (unless configured)
- No data retention policies enforced by default
- Single-instance backend has no failover

## Best Practices

1. **Use HTTPS** in production for all communication
2. **Rotate API Keys** regularly
3. **Monitor Backend Logs** for unexpected requests
4. **Limit RLS Policies** in Supabase to what's necessary
5. **Do Not Log Secrets** in recorded steps
6. **Use Environment Variables** for all credentials
7. **Set Up VPC** or firewall rules if running on cloud infrastructure

## Future Improvements

- Rate limiting and request signing
- Encryption at rest options
- Audit logging
- Data retention policies
- RBAC for dashboard users

---

This project is in early stages. Security hardening is ongoing. If you have suggestions, please open an issue or email security@example.com.
