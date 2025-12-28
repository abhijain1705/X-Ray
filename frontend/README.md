# X-Ray Dashboard

**Web UI for visualizing decision executions.**

The dashboard is a Next.js application that:

- Authenticates users via Clerk
- Lists applications, executions, and steps
- Displays decision timelines
- Allows filtering and search (future: more advanced features)

## Prerequisites

- Node.js 18+
- npm or pnpm
- Clerk account
- Running X-Ray backend (for API access)
- Supabase project (dashboard queries the backend)

## Installation

```bash
cd frontend
npm install
```

## Configuration

### Environment Variables

Create a `.env.local` file with:

```env
# Clerk (user authentication)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

See [.env.example](.env.example) for all variables.

### Clerk Setup

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application (or use existing)
3. Go to **API Keys**
4. Copy your **Publishable Key** → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
5. Copy your **Secret Key** → `CLERK_SECRET_KEY`
6. Go to **Sign In & Sign Up** and configure sign-in methods (Email, Google, etc.)
7. Go to **Redirect URLs** and add:
   - `http://localhost:3000/auth/clerk/callback` (development)
   - `https://yourdomain.com/auth/clerk/callback` (production)

## Running the Dashboard

### Development

```bash
npm run dev
```

The dashboard runs on `http://localhost:3000` by default.

### Production Build

```bash
npm run build
npm start
```

## Architecture

```
src/
├── app/
│   ├── layout.tsx           # Root layout with Clerk provider
│   ├── page.tsx             # Home page (redirects to dashboard)
│   ├── auth/                # Auth routes
│   │   ├── sign-in/         # Clerk sign-in page
│   │   └── sign-up/         # Clerk sign-up page
│   └── dashboard/           # Protected dashboard routes
│       ├── layout.tsx       # Dashboard layout
│       ├── page.tsx         # Overview page
│       ├── overview/        # Executions list
│       └── profile/         # User profile
├── components/              # Reusable React components
│   ├── forms/               # Form components
│   ├── layout/              # Layout components
│   ├── ui/                  # Shadcn UI components
│   └── ...
├── config/                  # Configuration files
├── constants/               # Constants (mock data, etc.)
├── features/                # Feature-specific hooks and logic
├── hooks/                   # Custom React hooks
├── lib/                     # Utility functions
└── types/                   # TypeScript type definitions
```

## Features

### Authentication

- Sign up with email, Google, GitHub, etc.
- Users are synced to Supabase via `/auth/sync-user` endpoint

### Dashboard

- **Overview**: View recent executions across all applications
- **Applications**: List and manage applications
- **Executions**: Filter and search execution history
- **Steps**: View detailed timeline of decision steps
- **Profile**: View user account details

### Future Features

- [ ] Create new applications
- [ ] Share applications with team members
- [ ] Execution filtering and search
- [ ] Step-level search
- [ ] Timeline visualization
- [ ] Performance metrics
- [ ] Alerting on failed executions
- [ ] Export execution data (CSV, JSON)

## Styling

The dashboard uses:

- **Tailwind CSS** for utility styling
- **Shadcn/ui** for pre-built components (Button, Card, Dialog, etc.)
- **CSS Modules** for component-scoped styles (minimal use)

To customize colors, edit `src/app/theme.css` and `tailwind.config.ts`.

## API Integration

The dashboard calls the backend to fetch data. Endpoints used:

- `POST /auth/sync-user` — Register the logged-in user
- `GET /executions?appId=...` — Fetch executions (future)
- `GET /steps?executionId=...` — Fetch steps (future)

Currently, most API endpoints are not implemented. The dashboard displays mock data from `src/constants/mock-api.ts`.

## Environment Variables

| Variable                            | Required | Purpose                                     |
| ----------------------------------- | -------- | ------------------------------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes      | Clerk public key (safe to expose)           |
| `CLERK_SECRET_KEY`                  | Yes      | Clerk secret (server-side only)             |
| `NEXT_PUBLIC_API_BASE_URL`          | Yes      | Backend URL (e.g., `http://localhost:4000`) |

## Local Development

### 1. Start the backend

```bash
cd server
npm run start
```

### 2. Start the dashboard

```bash
cd frontend
npm run dev
```

### 3. Open the dashboard

Visit `http://localhost:3000` in your browser.

### 4. Sign in with Clerk

Click "Sign In" and authenticate. You'll be redirected to the dashboard.

## Building for Production

```bash
npm run build
```

This creates an optimized build in `.next/`. Deploy it to:

- **Vercel** (recommended, native Next.js support)
- **Netlify** (with Next.js plugin)
- **Docker** (manually configured)
- **Traditional VPS** (using Node.js server)

### Deployment to Vercel

1. Push code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_API_BASE_URL` (production backend URL)
5. Deploy

### Deployment to Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY .next ./.next
COPY public ./public

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t xray-dashboard .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=... \
  -e CLERK_SECRET_KEY=... \
  -e NEXT_PUBLIC_API_BASE_URL=... \
  xray-dashboard
```

## Styling and Theme

### Tailwind CSS

The project uses Tailwind CSS for styling. Configuration is in `tailwind.config.ts`.

To add custom colors, update the `theme.extend.colors` section:

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: '#your-color'
      }
    }
  }
};
```

### Dark Mode

Dark mode support is configured in Tailwind. Toggle via the theme selector component.

## Troubleshooting

### "Clerk key is missing"

Ensure `.env.local` contains:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

### Sign-in redirects to blank page

Check Clerk's **Redirect URLs** settings. Add the correct callback URL:

- Local: `http://localhost:3000/auth/clerk/callback`
- Production: `https://yourdomain.com/auth/clerk/callback`

### API calls return 404

Verify:

- Backend is running on the correct port (default: 4000)
- `NEXT_PUBLIC_API_BASE_URL` points to the backend
- Backend endpoints exist (currently mostly unimplemented)

### Styling looks broken

Run:

```bash
npm run build
npx tailwindcss init
```

And verify `tailwind.config.ts` includes the correct content paths.

## Performance Tips

- Use the **React DevTools Profiler** to identify slow components
- Optimize images with the Next.js `<Image>` component
- Lazy-load components with `React.lazy()` and `Suspense`
- Monitor Core Web Vitals in production via Vercel Analytics

## Future Roadmap

- [ ] Real-time execution updates (WebSockets)
- [ ] Advanced filtering and search
- [ ] Execution replay/debugging
- [ ] Team collaboration features
- [ ] Role-based access control (RBAC)
- [ ] API for programmatic access
- [ ] Mobile app

---

## Support

- **Issues**: [GitHub Issues](https://github.com/abhijain1705/x-ray/issues)
- **Discussions**: [GitHub Discussions](https://github.com/abhijain1705/x-ray/discussions)

## License

MIT. See [LICENSE](../../LICENSE) for details.
