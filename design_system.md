# BeatYesterday — UI/UX Design System
### The permanent reference. No guessing later.

> **Rule #1:** The app is an efficient dopamine machine. The landing page is a cinematic experience. Do NOT confuse them.

---

## 0. Core Discipline Rules

> These rules exist because creative founders break their own products by adding "just one more thing."
> Read this section before every coding session.

### 0.1 The Brutal Test

> **If a user cannot log a workout in 5 seconds, you lose.**
> Even if your typography looks like it was carved by Viking gods into volcanic stone.

### 0.2 Two Products, Two Modes

| | Landing Page | App |
|---|---|---|
| **Purpose** | Branding experience | Daily utility |
| **Feel** | Cinematic, emotional, immersive | Brutalist efficiency |
| **Motion** | Dramatic transitions, grain, blur | Snappy, purposeful only |
| **Copy** | Emotional storytelling | Short, factual, human |
| **Speed** | Slow is fine | Instant is required |

**Transfer from landing to app:** Aesthetic language (fonts, colors, personality).  
**Do NOT transfer:** Pacing, immersion, cinematic slowness.

### 0.3 Discipline Guardrails

Before adding ANY animation, section, or interaction, ask:

1. Does this make logging faster? → If no, cut it.
2. Does this make progress more visible? → If no, cut it.
3. Is this the ONE emotional moment (PR)? → If no, cut it.
4. Would this survive a 30-second post-workout window? → If no, cut it.

### 0.4 Feature Creep Red Flags

Stop immediately if you hear yourself saying:
- *"Just one more animation here..."*
- *"What if the exercise list had a stagger entrance?"*
- *"Can we add a cinematic transition between screens?"*
- *"This section needs a little more personality..."*

Luxury UI is **confidence through restraint**. The product becomes addictive through one emotional moment, not feature count.

### 0.5 Mobile-First — Non-Negotiable

- Design for **375px width** (iPhone SE) as the baseline. Everything else scales up.
- **One-thumb operation only** — all primary actions reachable with right thumb in bottom 60% of screen
- **Dark mode only** in Phase 1 — AMOLED preferred by target users, looks premium, simpler to build
- No desktop layout in Phase 1. That path leads to dashboard goblinism.
- Touch targets: **minimum 44×44px** on all interactive elements
- Bottom nav + fixed footer CTA always within thumb reach

### 0.6 The 3 Components That Determine Everything

If these 3 look and feel incredible, the whole app looks incredible:

1. **Exercise Row** — the unit of work
2. **Stat Card** — the unit of progress
3. **PR Celebration** — the one emotional moment

Build these first. Polish these until they feel premium. Then build everything else.

---

## 1. Brand Identity

**Name:** BeatYesterday
**Tagline:** *"Half an hour still counts."*
**Personality:** Disciplined modern chaos. Exhausted but trying. Imperfect but progressing.
**NOT:** gym bro, bodybuilder, productivity cult, happy influencer aesthetic.
**IS:** underground performance culture. Dark luxury. Elite but accessible.

---

## 2. Color System

All colors defined as CSS custom properties. Never use raw hex in components.

### 2.1 Base Palette

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#070707` | App background (obsidian, not pure black) |
| `--color-surface-1` | `#111111` | Cards, sheets, nav bar |
| `--color-surface-2` | `#181818` | Elevated cards, modals |
| `--color-surface-3` | `#222222` | Input fields, hover states |
| `--color-border` | `#2a2a2a` | Subtle dividers only |
| `--color-border-bright` | `#3a3a3a` | Active input borders |

### 2.2 Typography Colors

| Token | Value | Usage |
|---|---|---|
| `--color-text-primary` | `#F5F5F5` | Headlines, key numbers (warm white, not harsh) |
| `--color-text-secondary` | `#999999` | Subtext, labels, metadata |
| `--color-text-muted` | `#555555` | Placeholder, disabled states |

### 2.3 Accent — The Identity Color

| Token | Value | Usage |
|---|---|---|
| `--color-accent` | `#E63946` | PR moments, active CTA, chart peaks, beat indicator |
| `--color-accent-dim` | `rgba(230,57,70,0.12)` | Accent glow backgrounds |
| `--color-accent-hover` | `#FF4654` | Hover/press on accent elements |

> **Red is used for exactly 5 things only:**
> PR achieved · Active primary button · Chart peak dot · Beat indicator · "Beat Yesterday" label
> Everywhere else: off. Too much red = gaming UI disease.

### 2.4 Semantic Colors

| Token | Value | Usage |
|---|---|---|
| `--color-success` | `#4CAF50` | Positive delta ("+6 reps") |
| `--color-warning` | `#F5A623` | Consistency warnings |
| `--color-neutral` | `#888888` | No-change delta |

---

## 3. Typography System

### 3.1 Font Stack

```css
--font-display: 'Bebas Neue', 'Anton', sans-serif;  /* Numbers, headings */
--font-body:    'Satoshi', 'Inter', sans-serif;      /* UI, labels, body */
```

**Import sources:**
- Bebas Neue → Google Fonts
- Satoshi → Fontshare (fontshare.com/fonts/satoshi)

### 3.2 Type Scale

| Token | Size | Font | Weight | Usage |
|---|---|---|---|---|
| `--text-hero` | `80px` | Bebas Neue | 400 | PR number on celebration screen |
| `--text-display` | `48px` | Bebas Neue | 400 | Screen headings ("TODAY") |
| `--text-stat` | `36px` | Bebas Neue | 400 | Exercise rep count, main stat |
| `--text-heading` | `22px` | Satoshi | 700 | Card titles |
| `--text-body` | `15px` | Satoshi | 400 | General content |
| `--text-label` | `12px` | Satoshi | 500 | Metadata, tags, micro-labels |
| `--text-micro` | `10px` | Satoshi | 400 | Timestamps, captions |

### 3.3 Typography Rules

- **Letter spacing on Bebas Neue:** `0.02em` — always slightly tracked
- **Line height on display:** `0.9–1.0` — tight, brutalist
- **Line height on body:** `1.6` — readable
- **All numbers use Bebas Neue** — reps, times, PRs, always
- **Section headers in ALL-CAPS:** TODAY · MY PRs · HISTORY
- **Left-align everything** in the app — no centered body copy

### 3.4 Micro-copy Tone

```
✅  "42 PUSHUPS   +6 FROM LAST WEEK"
✅  "NEW PR 🔥"
✅  "You trained 4 times this week."

❌  "Congratulations! You improved your pushup count by 6 reps compared
     to your weekly average performance. Keep it up!"
```

Short. Factual. Occasionally human. Never TED Talk.

---

## 4. Spacing System

8-point grid. Every value is a multiple of 8.

| Token | Value | Usage |
|---|---|---|
| `--space-1` | `4px` | Micro gaps (icon to label) |
| `--space-2` | `8px` | Tight internal padding |
| `--space-3` | `16px` | Standard component padding |
| `--space-4` | `24px` | Card padding, section gaps |
| `--space-5` | `32px` | Section separation |
| `--space-6` | `48px` | Large section breaks |
| `--space-7` | `64px` | Screen-level vertical rhythm |

---

## 5. Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `6px` | Tags, badges, chips |
| `--radius-md` | `12px` | Cards, input fields |
| `--radius-lg` | `20px` | Bottom sheets, modals |
| `--radius-full` | `9999px` | Pills, icon buttons |

---

## 6. Motion Philosophy

**Personality: Snappy + smooth.** Not cinematic. Not bouncy. Not floating Dribbble nonsense.

The app must feel **alive and responsive**, not like a design portfolio.

### 6.1 Duration Tokens

```css
--duration-instant:    80ms;   /* Tap feedback, color state change */
--duration-fast:      150ms;   /* Button press, input focus */
--duration-normal:    250ms;   /* Screen transitions, card appear */
--duration-slow:      400ms;   /* PR badge entrance, number count-up */
--duration-cinematic: 600ms;   /* PR celebration overlay only */
```

### 6.2 Easing Tokens

```css
--ease-out:    cubic-bezier(0.0, 0.0, 0.2, 1);    /* Elements entering */
--ease-in:     cubic-bezier(0.4, 0.0, 1, 1);      /* Elements leaving */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* PR number pop */
```

### 6.3 Animation Map

| Element | Animation | Duration | Easing |
|---|---|---|---|
| Screen navigation | Slide up | `250ms` | `ease-out` |
| Card appear | Fade + translateY 12px | `200ms` | `ease-out` |
| Rep number change | Count-up | `400ms` | linear |
| PR badge appear | Scale 0→1 | `400ms` | `ease-spring` |
| PR celebration overlay | Fade in | `300ms` | `ease-out` |
| PR hero number | Scale 0.5→1 | `600ms` | `ease-spring` |
| Button press | Scale 0.96 | `80ms` | `ease-out` |
| Input focus | Border color | `150ms` | `ease-out` |

### 6.4 What NOT to Animate

- Page headers (static)
- Exercise list items on scroll (no stagger — adds lag)
- Charts on first render (just appear)
- Anything the user did not directly trigger

---

## 7. Component Specs

### 7.1 Bottom Navigation Bar

```
Height:     64px
Background: --color-surface-1
Top border: 1px solid --color-border
Icons:      24px (Lucide or Phosphor)
Active:     --color-accent dot indicator + filled icon
Inactive:   --color-text-muted icon

Tabs (Phase 1 only):
  [Today]   [History]   [PRs]
```

### 7.2 Exercise Row (Today screen)

```
Height:           auto (min 72px)
Background:       --color-surface-1
Padding:          --space-3
Border-radius:    --radius-md
Gap between rows: --space-2

LEFT SIDE:
  Exercise name   → --text-heading, --color-text-primary
  Muscle · Level  → --text-label, --color-text-secondary

RIGHT SIDE:
  Rep input field → width 80px, text-align right
                    --text-stat, Bebas Neue, --color-text-primary
                    Background: --color-surface-3
                    Border-radius: --radius-sm
                    No border default → --color-accent 1px border on focus
  Unit label      → --text-label, --color-text-muted ("reps" / "sec")
```

### 7.3 PR Badge

```
Shape:      Pill (--radius-full)
Background: --color-accent-dim
Border:     1px solid --color-accent
Text:       "PR 🔥" — --text-label, --color-accent, font-weight 600
Padding:    4px 10px
Position:   Immediately right of exercise name
Animation:  scale spring entrance on PR detection
```

### 7.4 Primary Button ("DONE" / "LOG SESSION")

```
Height:        56px
Width:         100% (full bleed, bottom of screen)
Background:    --color-accent
Text:          Bebas Neue, 20px, --color-text-primary, uppercase, tracking 0.05em
Border-radius: --radius-md
Press state:   scale(0.96), background --color-accent-hover
Margin:        --space-4 from bottom safe area
```

### 7.5 Stat Card (PRs screen)

```
Background:    --color-surface-1
Border-radius: --radius-md
Padding:       --space-4

Layout (top to bottom):
  EXERCISE NAME  → --text-label, --color-text-muted, uppercase, tracking 0.08em
  Big number     → --text-stat or --text-display, Bebas Neue
  Unit           → --text-label, --color-text-secondary (inline with number)
  Delta label    → --text-label, --color-success / --color-neutral
                   e.g. "+6 from last week" or "= same as last time"
  Sparkline      → 14-day recharts LineChart, height 40px, no axes
                   Line: --color-text-muted, Peak dot: --color-accent
```

### 7.6 PR Celebration Overlay — THE ONE EMOTIONAL MOMENT

> This is the single moment in the app that is allowed to feel cinematic.
> Everything else is efficient. This is the exception. Make it count.

```
Trigger: New all-time PR detected on session save

Full-screen overlay:
  Background: --color-bg with radial gradient glow (--color-accent, opacity 0.08) at center
  z-index: 1000

Content (centered, vertical stack):
  "BEAT YESTERDAY" → --text-display, Bebas Neue, --color-accent, tracking 0.1em
  Exercise name    → --text-heading, --color-text-secondary
  Number           → --text-hero, Bebas Neue, --color-text-primary
  Delta            → --text-body, --color-success ("+6 from previous best")
  Dismiss button   → "KEEP GOING →", ghost style

Animation sequence:
  0ms:    Screen flashes subtle white (opacity 0 → 0.05 → 0, 200ms)
  0ms:    Overlay fades in (300ms ease-out)
  200ms:  Number scales from 0.5→1 (600ms ease-spring)
  400ms:  "BEAT YESTERDAY" label fades in (200ms ease-out)
  500ms:  Delta fades in (200ms ease-out)
  600ms:  Subtle red accent glow pulses once (scale 1 → 1.1 → 1, 400ms)
  Auto-dismiss: 3.5s OR tap anywhere

Optional (Phase 2 only):
  Haptic feedback: navigator.vibrate([ 50, 30, 100 ])
```

**Why this is the only cinematic moment:**
PR achievement is the core product promise made real. Users return to feel this again.
Every other interaction in the app is ruthlessly functional so that THIS moment
lands with maximum emotional weight.

### 7.7 Micro Win Banner (Phase 2)

```
Appears:    Slide in below exercise row after logging
Background: transparent
Text:       "--text-label, --color-text-secondary, italic"
Height:     24px
Examples:   "+2 pushups from last time" | "Best plank in 14 days"
Animation:  Fade in 200ms ease-out, no movement
```

### 7.8 Add Exercise Bottom Sheet

```
Height:        80vh
Background:    --color-surface-2
Border-radius: --radius-lg --radius-lg 0 0 (top corners only)
Handle:        centered, 4px × 32px, --color-border-bright

Filter tabs:   UPPER · CORE · LOWER (pill style, active = --color-accent bg)
Exercise list: Flat rows, 56px height each
               Name: --text-body, --color-text-primary
               Muscle: --text-label, --color-text-secondary
               Tap → adds to today's session, sheet closes
```

---

## 8. Screen Layouts — Phase 1

### Screen 1: TODAY

```
HEADER (sticky, 56px):
  "TODAY"                [WED 14 MAY]
  Bebas Neue, 32px       --text-label, --color-text-muted

SCROLLABLE CONTENT:
  ── UPPER BODY ──  (section label, --text-label, --color-text-muted)

  [Exercise Row]  Diamond Pushups  [PR🔥]     42 reps
  [Exercise Row]  Pike Pushups                 28 reps

  ── CORE ──

  [Exercise Row]  Plank                       2:30

  [+ ADD EXERCISE]  (ghost button, full width, dashed border)

FOOTER (fixed, above nav):
  [  DONE — SAVE SESSION  ]  ← Primary CTA, --color-accent
```

**UX behaviors:**
- No empty state on first open — show suggested exercises instead
- Tap rep field → numeric keyboard auto-opens
- PR detected on save → celebration overlay before navigating
- Session only saved when "DONE" is tapped — no auto-save

---

### Screen 2: HISTORY

```
HEADER:
  "HISTORY"

SCROLLABLE LIST (newest first):
  ┌─ Session Card ───────────────────────────┐
  │  MON 12 MAY                   4 exercises │
  │  Diamond PU · Plank · Pullups · Squats   │
  │  [PR 🔥 on Diamond Pushups]              │
  └──────────────────────────────────────────┘

  Tap to expand → shows full log for that session
  (exercise name + reps/time, read-only)
```

**UX behaviors:**
- No graphs on this screen — just readable log
- PR badge on card if any PR was set that session
- Empty state: "No sessions yet. Log your first workout on Today." with arrow pointing to nav

---

### Screen 3: MY PRs

```
HEADER:
  "MY PRs"

FILTER TABS (sticky):
  [ALL]  [UPPER]  [CORE]  [LOWER]

SCROLLABLE GRID (2-col on wide, 1-col on narrow mobile):
  ┌─ PR Card ────────────────┐
  │  DIAMOND PUSHUPS         │
  │        42                │  ← Bebas Neue, 36px
  │  REPS  Last: 38  (+4) ✓  │
  │  ▁▂▃▄▅▆▇█ (sparkline)   │
  └──────────────────────────┘

  Tap card → expands to full 30-day recharts LineChart
```

---

## 9. Data Architecture

### 9.1 Dexie.js Schema

```javascript
// src/db/db.js
import Dexie from 'dexie';

const db = new Dexie('BeatYesterdayDB');

db.version(1).stores({
  exercises: '++id, name, category, muscleGroup, inputType, isCustom',
  sessions:  '++id, date, durationMin',
  logs:      '++id, sessionId, exerciseId, reps, durationSec, sets, timestamp',
  prs:       '++id, exerciseId, value, achievedAt',
});

export default db;
```

### 9.2 TypeScript Interfaces

```typescript
type InputType = 'reps' | 'time' | 'reps+hold';
type Category  = 'upper' | 'core' | 'lower' | 'full';

interface Exercise {
  id?: number;
  name: string;
  category: Category;
  muscleGroup: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  inputType: InputType;
  isCustom: boolean;
}

interface Session {
  id?: number;
  date: string;        // ISO date string "2026-05-14"
  durationMin?: number;
}

interface Log {
  id?: number;
  sessionId: number;
  exerciseId: number;
  reps?: number;
  durationSec?: number;
  sets?: number;
  timestamp: Date;
}

interface PR {
  id?: number;
  exerciseId: number;
  value: number;       // reps OR seconds — same field
  achievedAt: Date;
}
```

### 9.3 PR Detection Logic

```typescript
// src/db/prService.ts
export async function checkAndUpdatePR(
  exerciseId: number,
  newValue: number
): Promise<boolean> {
  const existing = await db.prs
    .where('exerciseId').equals(exerciseId)
    .first();

  if (!existing || newValue > existing.value) {
    await db.prs.put({
      exerciseId,
      value: newValue,
      achievedAt: new Date(),
    });
    return true; // Show celebration
  }
  return false;
}
```

### 9.4 Micro Win Logic (Phase 2 — design now, build later)

```typescript
// Returns a short string to display after logging
export async function getMicroWin(
  exerciseId: number,
  newValue: number
): Promise<string | null> {
  const recent = await db.logs
    .where('exerciseId').equals(exerciseId)
    .sortBy('timestamp');

  const lastValue = recent.at(-2)?.reps ?? recent.at(-2)?.durationSec;
  if (!lastValue) return null;

  const diff = newValue - lastValue;
  if (diff > 0) return `+${diff} from last time`;
  if (diff === 0) return 'Same as last time';
  return null; // Don't show negative micro wins
}
```

---

## 10. CSS Architecture

### 10.1 File Structure

```
src/
  styles/
    tokens.css        ← ALL design tokens (single source of truth)
    reset.css         ← Minimal CSS reset
    typography.css    ← Font face imports + utility classes
    animations.css    ← @keyframes + animation utility classes
  components/
    ExerciseRow/
      ExerciseRow.tsx
      ExerciseRow.css
    PRCard/
    PRCelebration/
    BottomNav/
    BottomSheet/
    StatCard/
```

### 10.2 Full tokens.css

```css
:root {
  /* ── Surfaces ── */
  --color-bg:            #070707;
  --color-surface-1:     #111111;
  --color-surface-2:     #181818;
  --color-surface-3:     #222222;
  --color-border:        #2a2a2a;
  --color-border-bright: #3a3a3a;

  /* ── Text ── */
  --color-text-primary:   #F5F5F5;
  --color-text-secondary: #999999;
  --color-text-muted:     #555555;

  /* ── Accent ── */
  --color-accent:       #E63946;
  --color-accent-dim:   rgba(230, 57, 70, 0.12);
  --color-accent-hover: #FF4654;

  /* ── Semantic ── */
  --color-success: #4CAF50;
  --color-warning: #F5A623;
  --color-neutral: #888888;

  /* ── Typography ── */
  --font-display: 'Bebas Neue', 'Anton', sans-serif;
  --font-body:    'Satoshi', 'Inter', sans-serif;

  --text-hero:    80px;
  --text-display: 48px;
  --text-stat:    36px;
  --text-heading: 22px;
  --text-body:    15px;
  --text-label:   12px;
  --text-micro:   10px;

  /* ── Spacing ── */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 16px;
  --space-4: 24px;
  --space-5: 32px;
  --space-6: 48px;
  --space-7: 64px;

  /* ── Radius ── */
  --radius-sm:   6px;
  --radius-md:   12px;
  --radius-lg:   20px;
  --radius-full: 9999px;

  /* ── Motion ── */
  --duration-instant:    80ms;
  --duration-fast:      150ms;
  --duration-normal:    250ms;
  --duration-slow:      400ms;
  --duration-cinematic: 600ms;

  --ease-out:    cubic-bezier(0.0, 0.0, 0.2, 1);
  --ease-in:     cubic-bezier(0.4, 0.0, 1, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

---

## 11. Pre-Seeded Exercise List

```
UPPER BODY
  Chest:
    Regular Pushup (reps, beginner)
    Wide Pushup (reps, beginner)
    Diamond Pushup (reps, intermediate)
    Decline Pushup (reps, intermediate)
    Incline Pushup (reps, beginner)
    Pike Pushup (reps, intermediate)
    Archer Pushup (reps, advanced)

  Back:
    Pullup (reps, advanced)
    Chinup (reps, intermediate)
    Australian Row (reps, beginner)
    Negative Pullup (reps, intermediate)

  Shoulders:
    Handstand Hold (time, advanced)
    Lateral Raise (reps, beginner) [no equipment variation]

  Triceps:
    Chair Dip (reps, beginner)

CORE
    Plank (time, beginner)
    Side Plank (time, beginner)
    Crunches (reps, beginner)
    Leg Raises (reps, intermediate)
    V-Sits (reps, intermediate)
    Russian Twists (reps, beginner)
    Hollow Body Hold (time, intermediate)

LOWER BODY
    Regular Squat (reps, beginner)
    Sumo Squat (reps, beginner)
    Jump Squat (reps, intermediate)
    Bulgarian Split Squat (reps, advanced)
    Pistol Squat Assisted (reps, advanced)
    Lunge (reps, beginner)
    Reverse Lunge (reps, beginner)
    Glute Bridge (reps, beginner)
    Hip Thrust (reps, beginner)
    Donkey Kicks (reps, beginner)
    Calf Raise (reps, beginner)
```

---

## 12. Zustand Store Shape

```typescript
// src/store/useWorkoutStore.ts
interface WorkoutStore {
  // Today's session (in progress)
  activeSession: {
    logs: { exerciseId: number; reps?: number; durationSec?: number }[];
  };

  addLog: (exerciseId: number, value: number, inputType: InputType) => void;
  updateLog: (exerciseId: number, value: number) => void;
  removeLog: (exerciseId: number) => void;
  saveSession: () => Promise<{ prs: number[] }>; // returns exerciseIds with new PRs
  clearSession: () => void;

  // UI state
  celebrationExerciseId: number | null;
  setCelebration: (id: number | null) => void;
}
```

---

## 13. What the App Is NOT

| Avoid | Reason |
|---|---|
| Blur/parallax animations on lists | Adds friction, slows logging |
| Loading screens | All data is local — should be instant |
| Onboarding slideshow | Opens directly to Today screen |
| Trivial achievement badges | Cheapens real PRs |
| Social feed or leaderboard | Violates core philosophy |
| Streak counters that break | Guilt = uninstall |
| Multiple primary CTAs per screen | Clarity beats options |
| Gradient backgrounds on app screens | Noise, not signal |
| Auto-playing sound | Disrespects user context |
| Centered body copy | Left-align everything |
| Desktop-first layout | Dashboard goblinism |
| Cinematic screen transitions (Phase 1) | Logging pushups ≠ cinematic cutscene |
| Stagger entrance animations on lists | Looks cool, feels slow |
| "Cool UI" before useful UX | Users don't care about your blur radius if they can't log fast |

### 13.1 The Temptation Checklist

Every time you want to add something not in this document, ask:

- [ ] Does it make the 5-second log faster?
- [ ] Does it make progress more visible?
- [ ] Is it the PR celebration moment?
- [ ] Did you use the app for 2 weeks and genuinely need this?

If no to all four → **don't build it yet.** Add it to Phase 2/3 backlog instead.

---

## 14. Visual Reference

**Aesthetic pulled from:**
- **The Grind NL** (thegrind.nl) — compressed bold typography, obsidian backgrounds, red accent, raw athletic energy
- **Nike campaign typography** — oversized numbers, massive negative space, minimal copy
- Underground gym culture — performance identity over influencer culture

**Critical distinction from references:**
- References = cinematic, immersive, slow-paced
- App = instant, functional, low-latency
- The *aesthetic language* transfers (fonts, colors, personality)
- The *pacing and immersion* does not

---

---

## 15. The Emotional Core (Never Drift From This)

**What you are actually selling:**
> "You don't need perfect discipline to keep progressing."

**Who feels this acutely:**
- Tired students
- Burned-out remote workers
- Inconsistent gym people carrying quiet shame
- Founders who skipped 3 days and feel like failures

**What the product says back:**
> "You're still moving. That counts."

This is the brand. Not the features. Not the typography.
The aesthetic, the copy, the motion, the PR moment — all of it exists to deliver this single emotional message.

**If you drift from this, the product loses its identity and becomes just another tracker.**

---

*Last updated: Pre-build Phase 1 planning.*
*Update this file when any design decision changes. Never guess. Always refer here first.*
