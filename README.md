# Habit Tracker

A beautiful, psychology-driven habit tracking PWA built with Next.js 15, Supabase, and modern React patterns.

## Features

- **Dashboard**: Today's habits with quick check-off, streak highlights, daily inspiration
- **Habit Management**: Create, edit, archive habits with emoji, colors, custom frequencies
- **Calendar Heatmap**: Visual monthly view showing completion patterns
- **Statistics**: Charts, streaks, completion rates, trend analysis
- **Celebrations**: Confetti and messages on milestone streaks (7/21/100 days)
- **Authentication**: Anonymous quick-start with optional sign-up for sync
- **PWA**: Installable, works offline, push notifications
- **Dark/Light Mode**: System preference detection with manual toggle

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui + Radix UI
- **State**: Zustand with localStorage persistence
- **Backend**: Supabase (Auth, Postgres, Realtime, Storage)
- **Charts**: Recharts
- **Forms**: react-hook-form + zod
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Supabase account

### 1. Clone and Install

```bash
cd habit-tracker
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration:

```sql
-- Copy and paste contents of supabase/migrations/001_initial_schema.sql
```

3. Enable Google OAuth (optional):
   - Go to **Authentication > Providers > Google**
   - Add your Google OAuth credentials

### 3. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Find these values in Supabase: **Settings > API**

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Run Tests

```bash
npm run test
```

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and import your repository
2. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy!

### 3. Update Supabase URLs

In Supabase **Authentication > URL Configuration**, add your Vercel URL to:
- Site URL
- Redirect URLs

## Project Structure

```
habit-tracker/
├── public/
│   ├── manifest.json     # PWA manifest
│   └── sw.js            # Service worker
├── src/
│   ├── app/             # Next.js pages
│   │   ├── page.tsx     # Dashboard
│   │   ├── calendar/    # Calendar view
│   │   ├── habits/      # Habits management
│   │   ├── stats/       # Statistics
│   │   └── settings/    # Settings
│   ├── components/
│   │   ├── ui/          # shadcn/ui components
│   │   ├── habits/      # Habit-specific components
│   │   ├── calendar/    # Calendar components
│   │   └── shared/      # Shared components
│   ├── lib/
│   │   ├── supabase/    # Supabase clients
│   │   ├── stores/      # Zustand stores
│   │   ├── hooks/       # Custom hooks
│   │   └── utils.ts     # Utility functions
│   └── types/           # TypeScript types
├── supabase/
│   └── migrations/      # Database schema
└── tests/               # Vitest tests
```

## Database Schema

### habits
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Owner (nullable for anonymous) |
| name | TEXT | Habit name |
| emoji | TEXT | Display emoji |
| color | TEXT | Hex color code |
| frequency | JSONB | Scheduling config |
| reminder_time | TIME | Optional reminder |
| archived | BOOLEAN | Soft delete |

### completions
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| habit_id | UUID | Foreign key to habits |
| completed_at | DATE | Completion date |
| note | TEXT | Optional note |
| mood | INTEGER | 1-5 mood rating |
| photo_url | TEXT | Optional photo |

## Extension Ideas

- **AI Coaching**: Personalized suggestions based on patterns
- **Social Features**: Share streaks, friend challenges
- **Widgets**: iOS/Android home screen widgets
- **Apple Watch**: Quick check-ins from wrist
- **Integrations**: Apple Health, Google Fit, Strava
- **Gamification**: Points, levels, achievements
- **Analytics**: Weekly/monthly email reports

## Contributing

Contributions are welcome! Please open an issue or PR.

## License

MIT
