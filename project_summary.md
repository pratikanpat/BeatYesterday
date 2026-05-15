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
│   │   ├── db.js                 # Dexie database schema
│   │   ├── seedExercises.js      # 31 pre-seeded bodyweight exercises
│   │   └── prService.js          # PR detection, lookup, sparkline data
│   ├── store/
│   │   └── useWorkoutStore.js    # Zustand store (session, UI, celebration)
│   ├── styles/
│   │   ├── tokens.css            # ALL design tokens (single source of truth)
│   │   ├── reset.css             # Minimal CSS reset
│   │   └── animations.css        # @keyframes (fade, slide, spring, glow)
│   ├── components/
│   │   ├── BottomNav/            # 3-tab navigation (Today, History, PRs)
│   │   ├── ExerciseRow/          # Single exercise entry row
│   │   ├── BottomSheet/          # Add Exercise bottom sheet
│   │   └── PRCelebration/        # Full-screen PR celebration overlay
│   └── screens/
│       ├── TodayScreen/          # Core workout logging screen
│       ├── HistoryScreen/        # Past session list
│       └── PRsScreen/            # Per-exercise PR cards + sparklines
```

---

## Database Schema (Dexie.js / IndexedDB)

```
exercises: ++id, name, category, muscleGroup, inputType, isCustom
sessions:  ++id, date, durationMin
logs:      ++id, sessionId, exerciseId, reps, durationSec, sets, timestamp
prs:       ++id, exerciseId, value, achievedAt
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
- [x] 3 tabs: Today, History, PRs
- [x] Accent dot indicator on active tab
- [x] Lucide icons with weight change on active

---

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

## What's NOT Built Yet

| Feature | Phase | Notes |
|---|---|---|
| PWA service worker | 1 (remaining) | Vite PWA plugin needs config |
| Custom exercises | 2 | User-created exercises |
| Routine templates | 2 | Save + load workout presets |
| Energy/sleep check-in | 2 | Pre-session 3-tap check |
| Micro Wins engine | 2 | "+2 pushups from last time" smart banners |
| Consistency Score | 2 | Rolling 30-day % |
| Body heatmap | 2 | Visual muscle group coverage |
| PR Share Cards | 2 | Auto-generated for Instagram/WhatsApp |
| GitHub-style year heatmap | 3 | Activity visualization |
| Weekly recap + notifications | 3 | Sunday push notification |
| 30-day challenges | 3 | "50 Pushup Month" etc. |
| Cloud sync (Supabase) | 3 | Multi-device sync |
| Monetization (Pro tier) | 4 | ₹99/month or ₹799/year |
| AI insights | 4 | "You peak on Tuesdays" |

---

## How to Run

```bash
cd BeatYesterday
npm install
npm run dev
```

Opens on `http://localhost:3000`. Use Chrome DevTools mobile emulation (iPhone SE 375px) for best experience.

---

## Recent Updates

| Date | Change |
|---|---|
| 2026-05-15 | Initial Phase 1 build — all 3 screens, DB, store, PR celebration, exercise seed |
