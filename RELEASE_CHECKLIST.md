# Release Checklist

**Follow this checklist before releasing X-Ray to GitHub and npm.**

---

## Pre-Release Tasks

### Documentation Review

- [ ] Read [README.md](README.md) — sounds professional?
- [ ] Check all links in documentation work
- [ ] Verify no placeholder URLs remain (yourusername, example.com, etc.)
- [ ] Review API examples — do they work?
- [ ] Test setup guide — can you follow it from scratch?
- [ ] Check code examples — are they correct?
- [ ] Review FAQ — answer good quality?
- [ ] Check email addresses in docs (security contact, etc.)

### Repository Setup

- [ ] Git history is clean (no accidental commits)
- [ ] .gitignore excludes .env.local and node_modules
- [ ] .editorconfig is in place
- [ ] LICENSE file exists (MIT)
- [ ] No secrets in any files
- [ ] No API keys or tokens committed
- [ ] All old branches/tags cleaned up

### Code Quality

- [ ] SDK code builds: `cd packages/xray-sdk && npm run build`
- [ ] Backend starts: `cd server && npm run start`
- [ ] Dashboard runs: `cd frontend && npm run dev`
- [ ] No TypeScript errors
- [ ] No console.log() debugging code

### Security

- [ ] Reviewed [SECURITY.md](SECURITY.md)
- [ ] Vulnerability reporting email is real
- [ ] No hardcoded secrets anywhere
- [ ] Environment variables all documented
- [ ] Security considerations documented for each component

### Testing

- [ ] Followed [docs/SETUP.md](docs/SETUP.md) yourself
- [ ] Backend API endpoints tested with curl
- [ ] Dashboard auth works
- [ ] SDK example code runs
- [ ] Database queries execute correctly
- [ ] No broken links in documentation

---

## Before GitHub Push

### Content Updates

- [ ] Replace `yourusername` with your actual GitHub username

  - Files: README.md, CONTRIBUTING.md, SECURITY.md, docs/SETUP.md, etc.
  - Search: `yourusername` → `your-github-username`

- [ ] Replace email addresses

  - Files: SECURITY.md (security contact)
  - Replace: `security@example.com` → your email

- [ ] Update repository URLs

  - Files: README.md, CONTRIBUTING.md, docs/ROADMAP.md
  - Pattern: `https://github.com/yourusername/x-ray`

- [ ] Update API examples URLs if needed
  - Files: docs/API.md, docs/SETUP.md
  - For production: use your actual domain

### Final Checks

- [ ] Proofread key files:

  - [ ] README.md
  - [ ] CONTRIBUTING.md
  - [ ] CODE_OF_CONDUCT.md
  - [ ] docs/SETUP.md
  - [ ] docs/API.md

- [ ] Check formatting:

  - [ ] No trailing whitespace
  - [ ] Consistent line endings
  - [ ] Code blocks properly formatted

- [ ] Verify file structure:
  - [ ] All docs/ files exist
  - [ ] All README.md files present
  - [ ] .env.example files in place
  - [ ] package.json files valid JSON

---

## Git Preparation

```bash
# Check status
git status

# Review changes
git diff

# Stage everything
git add .

# Commit with descriptive message
git commit -m "Release: X-Ray v0.1 - Production documentation and open-source setup"

# Verify commit
git log -1

# Tag the release
git tag v0.1.0
git tag -l
```

---

## GitHub Setup

### Repository Creation

- [ ] Create new GitHub repository
  - [ ] Name: `x-ray`
  - [ ] Visibility: **Public**
  - [ ] Initialize: **No** (we'll push existing)
  - [ ] License: **MIT** (already have one)

### Repository Configuration

- [ ] Go to Settings:

  - [ ] General:

    - [ ] Add description: "Decision observability SDK + backend + dashboard"
    - [ ] Add website URL (if you have one)
    - [ ] Enable Discussions
    - [ ] Enable Issues

  - [ ] Code security & analysis:

    - [ ] Enable Dependabot
    - [ ] Enable secret scanning (if available)

  - [ ] Collaborators:

    - [ ] Add team members if applicable

  - [ ] Topics:
    - [ ] Add: `observability`
    - [ ] Add: `decision`
    - [ ] Add: `tracing`
    - [ ] Add: `debugging`
    - [ ] Add: `sdk`
    - [ ] Add: `typescript`

### Branch Protection (Optional)

- [ ] Go to Settings > Branches
- [ ] Create rule for `main` branch:
  - [ ] Require pull request reviews before merging
  - [ ] Require status checks to pass
  - [ ] Include administrators

---

## Push to GitHub

```bash
# Add remote
git remote add origin https://github.com/yourusername/x-ray.git

# Push main branch
git push -u origin main

# Push tags
git push origin --tags

# Verify
git branch -a
git tag -l
```

Verify on GitHub:

- [ ] All files present
- [ ] Commit history correct
- [ ] Tags showing
- [ ] README renders properly
- [ ] No secrets visible in commits

---

## GitHub Pages (Optional)

To host documentation on GitHub Pages:

1. Go to Settings > Pages
2. Source: `Deploy from a branch`
3. Branch: `main`, folder: `docs`
4. Wait for deployment
5. Access at: `https://yourusername.github.io/x-ray`

Alternative: Host on ReadTheDocs, Vercel, or Netlify

---

## npm Publishing (SDK Only)

### Preparation

```bash
cd packages/xray-sdk

# Build
npm run build

# Verify package contents
npm pack

# Check size
ls -lh @xray-sdk-*.tgz
```

### Update Before Publishing

- [ ] Update version in `package.json`
- [ ] Update `name` if needed (e.g., `@yourusername/xray-sdk`)
- [ ] Add `repository` field to package.json
- [ ] Add `homepage` field to package.json
- [ ] Add `bugs` field to package.json
- [ ] Create CHANGELOG.md

### Publish

```bash
npm login

npm publish --access public

# Verify
npm info @xray/sdk
npm view @xray/sdk versions
```

Test installation:

```bash
npm install @xray/sdk@latest

# Verify in node_modules
ls node_modules/@xray/sdk
```

---

## Announcements

### GitHub Release

1. Go to Releases > Create a new release
2. Tag: `v0.1.0`
3. Title: `@xray/sdk v0.1.0 - Decision Observability SDK`
4. Description:

   ```markdown
   # X-Ray v0.1.0 - MVP Release

   ## What's included

   - Lightweight decision observability SDK (TypeScript, zero dependencies)
   - Backend service (Node.js + Express + Supabase)
   - Dashboard (Next.js + Clerk)
   - Comprehensive documentation

   ## Getting started

   - [Quick Start](docs/QUICKSTART.md) - 5 minute setup
   - [Setup Guide](docs/SETUP.md) - Detailed instructions
   - [SDK Docs](packages/xray-sdk/README.md) - SDK usage

   ## Key features

   - Non-blocking, best-effort observability
   - Snapshot-based decision recording
   - Simple, self-hostable architecture

   ## Known limitations (v0.1)

   - Single instance backend (no clustering)
   - Read-only dashboard (no replay yet)
   - No real-time updates (async ingestion)

   See [ROADMAP.md](docs/ROADMAP.md) for future plans.

   ---

   **Special thanks** to everyone who contributed!
   ```

### GitHub Discussions

1. Create new discussion: "Announcements"
2. Title: "X-Ray v0.1.0 Released"
3. Post: Announce the release, invite feedback

### Social Media (Optional)

Tweet/Post:

```
🎉 X-Ray v0.1.0 is live!

Decision observability SDK + backend + dashboard.

Record multi-step decisions, visualize execution timelines.

✅ TypeScript SDK (zero deps)
✅ Node.js backend (Supabase)
✅ Next.js dashboard (Clerk)
✅ Comprehensive docs

Get started: [link to repo]

#opensource #observability #typescript
```

---

## Post-Release Monitoring

### First Week

- [ ] Monitor GitHub issues for bugs
- [ ] Respond to questions
- [ ] Check npm download stats
- [ ] Monitor social media mentions
- [ ] Fix any critical bugs immediately

### First Month

- [ ] Gather feedback from early users
- [ ] Document common integration issues
- [ ] Plan v0.2 features based on feedback
- [ ] Update docs based on questions
- [ ] Add first contributors

### Long-term

- [ ] Monitor adoption
- [ ] Plan roadmap milestones
- [ ] Build community
- [ ] Maintain code quality
- [ ] Keep dependencies updated

---

## Troubleshooting This Checklist

### Files Not Pushing?

```bash
git status                    # See what's staged
git add -A                    # Add everything
git commit -m "message"       # Commit
git push origin main          # Push
```

### Can't Login to npm?

```bash
npm logout
npm login                     # Re-authenticate
npm publish                   # Try again
```

### GitHub Pages Not Working?

- [ ] Check Settings > Pages
- [ ] Verify docs/ folder exists
- [ ] Wait 2-3 minutes for deployment
- [ ] Check Actions tab for errors

### Documentation Links Broken?

Use a link checker:

- Online: [linkchecker.com](https://linkchecker.com)
- Command: `npm install -g linkchecker && linkchecker .`

---

## Success Criteria

You're done when:

- ✅ GitHub repo is public with all files
- ✅ README renders beautifully
- ✅ All documentation links work
- ✅ Setup guide is follow-able from scratch
- ✅ Someone can install SDK from npm
- ✅ Backend starts without errors
- ✅ Dashboard loads in browser
- ✅ GitHub discussions are enabled
- ✅ You've announced the release

---

## Next Steps

After release:

1. **Engage Community** — Respond to issues/discussions
2. **Monitor Feedback** — Track common questions
3. **Plan v0.2** — Start next sprint
4. **Document Usage** — Add real-world examples
5. **Build Momentum** — Share success stories

---

## Need Help?

- **GitHub Issues** — Log problems and feature requests
- **Documentation** — See [docs/SETUP.md](docs/SETUP.md)
- **Support** — Check [docs/FAQ.md](docs/FAQ.md)

---

**You're ready to release!** 🚀

Print this checklist and check items off as you go.

Good luck! 🎉
