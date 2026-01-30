# For You Newsletter - Frontend

Next.js App Router frontend matching Figma designs.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Pages

- `/` - Landing page
- `/auth` - Sign in / Sign up
- `/preferences` - Newsletter setup
- `/dashboard` - Main dashboard
- `/discover` - Discover topics
- `/newsletters` - Newsletter archive
- `/settings` - User settings

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Lucide Icons

## Brand Colors

- Primary: `#1CB0F6`
- Primary Dark: `#0891d1`

## Logos

Two logo variants in `/public`:
- `logo-envelope.png` - Simple pigeon with envelope
- `logo-devices.png` - Pigeon with laptop and phone

## Project Structure

```
src/
├── app/
│   ├── (pages)/
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── Logo.tsx
│   └── BottomNav.tsx
└── lib/
```

## Notes

- All pages match Figma screenshots exactly
- Uses real logo images (no emojis)
- "Newsletter" terminology only (no "digest" or "brief")
- Mobile-first responsive design

## Environment Variables

Create a `.env.local` with:

```
NEXT_PUBLIC_API_BASE_URL=https://your-backend.example.com
```
