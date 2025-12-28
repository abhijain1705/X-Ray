# Publishing Guide

Instructions for publishing X-Ray SDK to npm.

## Prerequisites

- npm account (create at [npmjs.com](https://npmjs.com))
- 2FA enabled on npm account (recommended)
- Logged in locally: `npm login`

## Pre-Release Checklist

Before publishing:

1. **Update version** in `packages/xray-sdk/package.json`

   - Follow [semantic versioning](https://semver.org)
   - v0.1.0 → v0.1.1 (patch), v0.2.0 (minor), v1.0.0 (major)

2. **Update CHANGELOG** (create if missing)

   ```markdown
   # Changelog

   ## v0.1.1 (2025-01-01)

   - Fix: Handle JSON serialization errors
   - Docs: Clarify snapshot model
   ```

3. **Verify build**

   ```bash
   cd packages/xray-sdk
   npm run build
   npm run test  # if tests exist
   ```

4. **Verify package contents**

   ```bash
   npm pack
   tar -tzf @xray-sdk-0.1.0.tgz | head -20
   ```

5. **Commit changes**
   ```bash
   git add packages/xray-sdk/package.json CHANGELOG.md
   git commit -m "Release: @xray/sdk v0.1.1"
   git tag v0.1.1
   git push origin main --tags
   ```

## Publishing to npm

### 1. Publish the Package

```bash
cd packages/xray-sdk
npm publish
```

If using a scoped package name (`@xray/sdk`), make sure:

- The npm organization exists
- You have publish permissions
- You're logged in: `npm whoami`

For public packages, add `--access public`:

```bash
npm publish --access public
```

### 2. Verify Publication

Check [npmjs.com/@xray/sdk](https://www.npmjs.com/package/@xray/sdk)

```bash
npm info @xray/sdk
npm view @xray/sdk versions
```

### 3. Test Installation

```bash
mkdir /tmp/test-xray
cd /tmp/test-xray
npm init -y
npm install @xray/sdk
```

Verify it works:

```typescript
import XRaySDK from '@xray/sdk';
const xray = new XRaySDK({ ... });
```

## GitHub Release

Create a GitHub release:

1. Go to [Releases](https://github.com/abhijain1705/x-ray/releases)
2. Click **Draft a new release**
3. Tag: `v0.1.1`
4. Title: `@xray/sdk v0.1.1`
5. Description:

   ````markdown
   ## Features

   - ...

   ## Bug Fixes

   - ...

   ## Installation

   ```bash
   npm install @xray/sdk@0.1.1
   ```
   ````

   ## Changelog

   See [CHANGELOG.md](../CHANGELOG.md)

   ```

   ```

6. Click **Publish release**

## Announce the Release

- Announce on [Discussions](https://github.com/abhijain1705/x-ray/discussions/new?category=announcements)
- Share on Twitter: "@xray_sdk v0.1.1 released! Features: ..."
- Post in relevant communities

## Troubleshooting

### "You do not have permission to publish"

- Verify you're logged in: `npm whoami`
- Check your npm permissions on the package
- For new scoped packages, the org must exist first

### "Package name already taken"

Choose a different name:

```json
{
  "name": "@yourusername/xray-sdk"
}
```

### Build fails

Ensure TypeScript compiles:

```bash
cd packages/xray-sdk
npm install
npm run build
```

Check for TS errors.

### Package size too large

Check what's included:

```bash
npm pack
ls -lh *.tgz
```

Update `.npmignore`:

```
src/
*.ts
tsconfig.json
.gitignore
node_modules/
```

## Version Numbering

Follow [semantic versioning](https://semver.org):

- **MAJOR** (v1.0.0) — Breaking API changes
- **MINOR** (v0.1.0) — New features, backwards compatible
- **PATCH** (v0.1.1) — Bug fixes

Examples:

- `v0.1.0` → `v0.1.1` (fix a bug)
- `v0.1.0` → `v0.2.0` (add a feature)
- `v0.1.0` → `v1.0.0` (breaking change)

## After Release

1. **Update README** to reference new version
2. **Monitor npm downloads** at npmjs.com
3. **Monitor GitHub issues** for bugs
4. **Announce next version** in ROADMAP

---

## Continuous Deployment (Optional)

Automate publishing with GitHub Actions:

**.github/workflows/publish.yml:**

```yaml
name: Publish to npm

on:
  push:
    tags:
      - "v*"

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
          registry-url: "https://registry.npmjs.org"
      - run: npm ci
      - run: npm run build --workspace=packages/xray-sdk
      - run: npm publish --workspace=packages/xray-sdk --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Create an NPM token:

1. Go to [npmjs.com/settings/tokens](https://www.npmjs.com/settings/tokens)
2. Create a new token (Automation type)
3. Copy the token
4. Go to GitHub Secrets (Settings > Secrets)
5. Add `NPM_TOKEN` secret

Then publishing is automatic on `git tag v0.1.1 && git push origin --tags`.

---

## Support

- **Questions:** [GitHub Discussions](https://github.com/abhijain1705/x-ray/discussions)
- **Issues:** [GitHub Issues](https://github.com/abhijain1705/x-ray/issues)
- **npm Help:** [docs.npmjs.com](https://docs.npmjs.com)
