# For You Newsletter - Frontend

Next.js App Router frontend for the For You Newsletter platform.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Pages

- `/` - Landing page
- `/auth` - Sign in / Create account
- `/setup` - Newsletter onboarding setup
- `/dashboard` - Main dashboard
- `/achievements` - Reading streak and progress
- `/discover` - Discover trending topics
- `/newsletter` - Newsletter management
- `/newsletter/[id]` - Edit newsletter
- `/settings` - Account settings
- `/subscription` - Subscription plans
- `/subscription/cancel` - Cancel subscription

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Supabase Auth (`@supabase/ssr`, `@supabase/supabase-js`)
- Inline SVG icons (no external icon libraries)

## Brand Colors

- Primary: `#1CB0F6`
- Primary Dark: `#0891d1`

## Logos

Two logo variants in `/public`:
- `logo-envelope.png` - Simple pigeon with envelope
- `logo-devices.png` - Pigeon with laptop and phone

## Environment Variables

Create a `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Project Structure

```
src/
├── app/
│   ├── achievements/
│   ├── auth/
│   ├── dashboard/
│   ├── discover/
│   ├── newsletter/
│   │   └── [id]/
│   ├── settings/
│   ├── setup/
│   ├── subscription/
│   │   └── cancel/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── BottomNav.tsx
│   ├── Icons.tsx
│   ├── Logo.tsx
│   ├── SaveNotification.tsx
│   ├── ThemeProvider.tsx
│   ├── ThemeToggle.tsx
│   ├── UnsavedChangesModal.tsx
│   └── UpgradeModal.tsx
└── lib/
    ├── api.ts
    ├── apiContracts.ts
    └── supabase.ts
```

## Notes

- Auth is session-based via Supabase (no custom token auth)
- All API calls use relative URLs for same-deployment Next.js architecture
- Default theme is dark; persists in localStorage
- Inter font loaded via next/font/google
- Mobile-first responsive design
