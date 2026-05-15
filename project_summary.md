# BeatYesterday — Project Summary

> **AI Context Document** — Read this first before doing anything.
> Last updated: 2026-05-15

---

## What Is This?

**BeatYesterday** is an offline-first PWA for tracking bodyweight workouts. The core promise: *log today's workout → see your PR → beat your previous self tomorrow*. Target users are students, founders, and remote workers with chaotic schedules who train at home.

**Tagline:** *"Half an hour still counts."*

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Vite + React 19 | Fast HMR, no SSR needed |
| Styling | Vanilla CSS + CSS variables | All tokens in `tokens.css` |
| State | Zustand | Single store, no boilerplate |
| Local DB | IndexedDB via Dexie.js | Offline-first, no backend |
| Charts | Recharts | Sparklines on PR cards |
| Animations | Framer Motion | PR celebration overlay only |
| Icons | Lucide React | Lightweight, consistent |
| PWA | Vite PWA plugin (planned) | Not yet configured |

---

## Folder Structure

```
BeatYesterday/
├── index.html                    # Entry HTML (fonts, meta, PWA tags)
├── package.json                  # Dependencies + scripts
├── vite.config.js                # Vite config
├── design_system.md              # UI/UX design system (read-only reference)
├── project_summary.md            # THIS FILE — AI context
├── public/
│   └── favicon.svg               # Red B on obsidian
├── src/
│   ├── main.jsx                  # React entry point
│   ├── App.jsx                   # Root component (tab routing)
│   ├── db/
│   ├── db.js                 # Dexie database schema (v1 + v2 + v3)
│   │   ├── seedExercises.js      # 31 pre-seeded bodyweight exercises
│   │   ├── prService.js          # PR detection, lookup, sparkline data
│   │   ├── microWinsService.js   # Micro wins, beat targets, session wins
│   │   ├── routinesService.js    # Save, load, delete workout routines
│   │   ├── consistencyService.js # Consistency score, muscle group coverage
│   │   ├── heatmapService.js     # Year heatmap data, weekly recap
│   │   ├── challengeService.js   # 30-day challenges, presets, auto-tracking
│   │   ├── notificationService.js # Minimal notifications (Sunday recap, PR, challenge)
│   │   ├── exportService.js      # CSV data export
│   │   └── analyticsService.js   # Exercise trends, sleep/energy correlation
│   ├── store/
│   │   └── useWorkoutStore.js    # Zustand store (session, UI, celebration, checkin, challenges)
│   ├── styles/
│   │   ├── tokens.css            # ALL design tokens (single source of truth)
│   │   ├── reset.css             # Minimal CSS reset
│   │   └── animations.css        # @keyframes (fade, slide, spring, glow)
│   ├── components/
│   │   ├── BottomNav/            # 3-tab navigation (Today, History, PRs)
│   │   ├── ExerciseRow/          # Single exercise entry row + beat target
│   │   ├── BottomSheet/          # Add Exercise bottom sheet + custom exercise
│   │   ├── PRCelebration/        # Full-screen PR celebration + share
│   │   ├── MicroWinBanner/       # Per-exercise micro win feedback
│   │   ├── CheckIn/              # Pre-session energy/sleep check-in
│   │   ├── RoutinePicker/        # Load saved workout routines
│   │   ├── CustomExerciseForm/   # Create custom exercises
│   │   ├── ConsistencyCard/      # Rolling 30-day consistency score
│   │   ├── BodyHeatmap/          # Muscle group coverage visualization
│   │   ├── PRShareCard/          # Auto-generated PR share card (canvas)
│   │   ├── ExportData/           # CSV data export button
│   │   ├── TrendChart/           # 30-day trend with 7-day moving average
│   │   ├── SleepEnergyCorrelation/ # Energy/sleep vs performance charts
│   │   ├── YearHeatmap/          # GitHub-style 365-day activity grid
│   │   ├── WeeklyRecap/          # Weekly summary with day bars
│   │   ├── ChallengeCard/        # 30-day challenge progress card
│   │   ├── ChallengeCreator/     # Start challenge from presets
│   │   ├── GrindModeSelector/    # Student/Founder/Recovery profiles
│   │   └── Onboarding/           # Minimal first-launch exercise picker
│   └── screens/
│       ├── TodayScreen/          # Core workout logging screen
│       ├── HistoryScreen/        # Past session list
│       ├── PRsScreen/            # PR cards + sparklines (focused)
│       └── InsightsScreen/       # Year heatmap, recap, challenges, consistency
```

---

## Database Schema (Dexie.js / IndexedDB)

```
exercises: ++id, name, category, muscleGroup, inputType, isCustom
sessions:  ++id, date, durationMin, checkinId
logs:      ++id, sessionId, exerciseId, reps, durationSec, sets, timestamp
prs:       ++id, exerciseId, value, achievedAt
routines:  ++id, name, createdAt
routineExercises: ++id, routineId, exerciseId, order
checkins:  ++id, sessionId, sleepQuality, energyLevel, timeAvailable, createdAt
challenges: ++id, name, exerciseId, targetValue, startDate, endDate, isActive, preset
challengeLogs: ++id, challengeId, date, value
userProfile: ++id, grindMode, onboardingComplete, favoriteExercises, createdAt
```

**Key relationships:**
- `sessions` → has many `logs`
- `logs` → belongs to `sessions` (via sessionId) and `exercises` (via exerciseId)
- `prs` → one per exercise (latest best)

---

## Core Features Implemented (Phase 1)

### Screen 1: Today
- [x] Pre-seeded exercise list via bottom sheet (search + category filter)
- [x] Exercise rows with numeric input (reps or time)
- [x] Real-time PR badge detection while typing
- [x] Delta display from previous best
- [x] "DONE — SAVE SESSION" CTA saves to IndexedDB
- [x] PR celebration overlay on new all-time best

### Screen 2: History
- [x] List of past sessions (newest first)
- [x] Expandable cards showing full exercise log
- [x] PR badge on sessions that contained PRs
- [x] Empty state with guidance text

### Screen 3: My PRs
- [x] Per-exercise best-ever values
- [x] Category filter tabs (All / Upper / Core / Lower)
- [x] Recharts sparkline (last 14 data points)
- [x] Expandable cards for larger chart view
- [x] Last session vs best comparison

### PR Celebration Overlay
- [x] Full-screen with Framer Motion animation sequence
- [x] White flash → hero number spring-in → label fade → delta → dismiss
- [x] Auto-dismiss at 3.5s or tap anywhere

### Bottom Navigation
- [x] 4 tabs: Today, History, PRs, Insights
- [x] Accent dot indicator on active tab
- [x] Lucide icons with weight change on active

---

## Phase 2 Features Implemented

### Micro Wins Engine
- [x] Per-exercise micro wins: "+2 from last time", "Best in 14 days", comeback detection
- [x] Session-level wins: weekly count, multi-session, milestone tracking
- [x] MicroWinBanner component rendered below exercise rows in TodayScreen

### "What Should I Beat Today?" Targets
- [x] Smart beat targets (+1-3 reps / +5 sec based on last value)
- [x] Displayed in ExerciseRow before user enters a value

### Custom Exercises
- [x] CustomExerciseForm with name, muscle group, category, tracking type, difficulty
- [x] Accessible via "CREATE YOUR OWN" button in Add Exercise bottom sheet
- [x] Saved with `isCustom: true` flag in exercises table

### Routine Templates
- [x] Save current session as named routine
- [x] Load routine to populate session with exercises
- [x] Delete routines
- [x] RoutinePicker + save modal integrated in TodayScreen

### Energy/Sleep Check-in
- [x] 3-step flow: sleep quality, energy level, time available
- [x] Skip option
- [x] Saved to checkins table linked to session

### Consistency Score
- [x] Rolling 30-day percentage with honest messaging
- [x] Mini heatmap showing active/inactive days
- [x] Total all-time session count
- [x] ConsistencyCard integrated in PRsScreen

### Body Area Heatmap
- [x] Muscle group coverage visualization (7D/14D/30D toggle)
- [x] Heat levels 0-4 based on exercise count per muscle group
- [x] Category summary counts
- [x] BodyHeatmap integrated in PRsScreen

### PR Share Cards
- [x] Canvas-generated Instagram story cards (1080×1920)
- [x] Web Share API + download fallback
- [x] Share button on PR cards in PRsScreen
- [x] Share button on PR celebration overlay

## Core Workflows

### Logging a Workout
1. App opens to Today screen
2. Tap "ADD EXERCISE" → Bottom sheet with search + filters
3. Tap exercise → added to session
4. Enter reps/time in the input field
5. Real-time: PR badge appears if value exceeds best
6. Tap "DONE — SAVE SESSION"
7. Session + logs saved to IndexedDB
8. PR check runs for each exercise
9. If new PR → celebration overlay fires
10. Session clears, ready for next time

### PR Detection
1. On save, each exercise's value is compared against `prs` table
2. If no existing PR → first value becomes PR
3. If value > existing PR → PR updated, celebration triggered
4. Celebration shows exercise name, new value, delta from previous best

---

## Design System Reference

All UI decisions are documented in `design_system.md`. Key rules:
- Dark mode only (`#070707` background)
- Bebas Neue for all numbers + headings
- Satoshi for body text
- Red accent (`#E63946`) used ONLY for: PR badge, active CTA, chart peak, beat indicator, "BEAT YESTERDAY" label
- 8-point spacing grid
- Mobile-first, 375px baseline
- One emotional moment: PR celebration (everything else is brutally efficient)

---

## Phase 3 Features Implemented

### GitHub-Style Year Heatmap
- [x] 365-day activity grid, horizontally scrollable
- [x] Heat levels 0-4 using accent red scale
- [x] Tap day → tooltip with exercise count and PRs
- [x] Auto-scrolls to today on load
- [x] Stats: active days, total sessions, current streak
- [x] Less/More legend

### Weekly Recap
- [x] This week's summary: sessions, exercises, PRs
- [x] Day-by-day bar chart (Mon-Sun)
- [x] Comparison to previous week
- [x] Honest motivational copy based on data

### 30-Day Solo Challenges
- [x] 4 presets: 50 Pushup Month, Plank Builder, Daily Mobility, Core Consistency
- [x] Progress bar, days remaining, daily target tracking
- [x] Auto-tracks from workout sessions
- [x] ChallengeCreator bottom sheet for starting challenges
- [x] Cancel/delete challenges

### Grind Mode Profiles
- [x] Student / Founder / Recovery identity-based profiles
- [x] Stored in userProfile table
- [x] GrindModeSelector in InsightsScreen

### Insights Screen (4th Tab)
- [x] New dedicated tab housing all growth/retention features
- [x] ConsistencyCard + BodyHeatmap moved from PRsScreen
- [x] PRsScreen cleaned up — focused on PR cards only

### Minimal Onboarding
- [x] First-launch exercise picker
- [x] Pick exercises you actually do (pill selector)
- [x] Skip option, never shows again

### PWA Service Worker
- [x] vite-plugin-pwa configured with manifest
- [x] Offline-first with font caching
- [x] Installable as PWA

### Notifications (Minimal)
- [x] Sunday weekly recap
- [x] PR achievement reminder (next day)
- [x] Optional evening challenge reminder
- [x] No spam — localStorage prevents duplicates

## Phase 3.5 Features Implemented

### CSV Data Export
- [x] One-tap CSV download from Insights screen
- [x] Exports all sessions, exercises, reps, PRs, categories
- [x] Blob + download link approach, no server needed
- [x] ExportData component in InsightsScreen

### Advanced Analytics
- [x] 30-day exercise trend chart with 7-day moving average (TrendChart)
- [x] Trend direction indicator: ↑ Improving / → Stable / ↓ Declining
- [x] TrendChart integrated into expanded PR cards on PRsScreen
- [x] Sleep/energy correlation charts (SleepEnergyCorrelation)
- [x] Bar charts showing avg volume by energy level and sleep quality
- [x] Locked state until 5+ check-ins exist
- [x] Auto-generated insight text

### PR Share Card Themes
- [x] 3 themes: Original (red), Midnight (indigo), Fire (orange)
- [x] Theme selector dots above canvas preview
- [x] All canvas colors driven by theme config

### Cinematic Landing Page
- [x] Full landing page in `/landing/` (vanilla HTML/CSS/JS)
- [x] 6 sections: Hero, Problem, Philosophy, Product, Identity, CTA
- [x] Scroll reveal animations, parallax hero, film grain overlay
- [x] Generated hero background + app mockup images
- [x] CTAs wired to `/app` (React PWA)
- [x] PWA install prompt integration

### Deploy Configuration
- [x] `vercel.json` — landing at `/`, React PWA at `/app`
- [x] Vite build produces dual output via copy plugin
- [x] PWA manifest scoped to `/app`
- [x] Asset caching headers configured
- [x] Build succeeds (`npm run build`)

---

## What's NOT Built Yet

| Feature | Phase | Notes |
|---|---|---|
| Cloud sync (Supabase) | 4 | Only when users ask for multi-device |
| Monetization (Pro tier) | 4 | ₹99/month or ₹799/year |
| AI insights | 4 | "You peak on Tuesdays" |

---

## How to Run

```bash
cd BeatYesterday
npm install
npm run dev        # Development server on localhost:3000
npm run build      # Production build to dist/
npm run preview    # Preview production build
```

App opens on `http://localhost:3000`. Use Chrome DevTools mobile emulation (iPhone SE 375px) for best experience.

### Deploy to Vercel

```bash
npm i -g vercel
vercel --prod
```

Routing:
- `/` → Landing page (cinematic)
- `/app` → React PWA (workout tracker)

---

## Recent Updates

| Date | Change |
|---|---|
| 2026-05-15 | Phase 3.5 — CSV export, advanced analytics, PR share themes, landing page, deploy config |
| 2026-05-15 | Phase 3 complete — Insights tab, year heatmap, challenges, grind modes, PWA, onboarding |
| 2026-05-15 | Phase 2 complete — all features wired into screens |
| 2026-05-15 | Initial Phase 1 build — all 3 screens, DB, store, PR celebration, exercise seed |
