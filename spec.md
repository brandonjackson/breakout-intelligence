# Breakout Intelligence — Product Spec

## Overview

Breakout Intelligence is a lightweight web app for collecting and visualising real-time survey responses during scenario planning workshops. Participants join via a unique invite link, answer Likert-scale questions across plenary and breakout sessions, and view aggregated results with group-level breakdowns.

The spec is organised into build phases. Each phase is self-contained and builds on the previous one.

---

## Core Concepts (all phases)

These definitions are stable across all phases. What changes is the storage and transport layer underneath.

### Event
A single workshop or convening. Has a name, description, and a `status` field: `active` or `finished`. When an event is `finished`, all invite links return a friendly "This event has ended" message — participants cannot access sessions or submit responses.

### Session
A time-bounded segment within an event. Two types:
- **Plenary** — all participants answer together, results shown as one pool.
- **Breakout** — participants pick from organiser-defined groups. Results are shown both in aggregate and broken down by group.

Sessions have a `status` field: `draft`, `open`, or `closed`. Only `open` sessions accept responses.

### Question
Belongs to a session. Likert-scale questions with organiser-defined label sets (e.g. `["Strongly disagree", ..., "Strongly agree"]` or `["Very unlikely", ..., "Very certain"]` or `["1", "2", "3", "4", "5"]`).

### Participant
Each participant has a unique invite slug (e.g. `red-cuddly-fox`) that serves as their identity. No registration, no login. The slug is their authentication token — if they close the tab and reopen the same link, they get their state back. The organiser generates slugs in advance and distributes them before the workshop.

### Group
Only relevant in breakout sessions. The organiser pre-defines the available groups for each breakout session (e.g. "Table 1: Labour Markets", "Table 2: Fiscal Policy"). Participants pick from this list when they first access the session. A participant may be in different groups across different sessions. The participant can change their group selection within a session.

---

## Design Direction (all phases)

**Mobile-first.** Every participant will be on their phone. The entire survey flow — invite resolution, group selection, answering questions, viewing results — must be designed for a 375px viewport first and scale up from there.

- **Aesthetic:** Clean, professional, slightly warm. This is for senior policymakers and economists, not a consumer app. Think: government design system meets modern SaaS.
- **Typography:** System font stack. Clear hierarchy with size/weight, not decorative fonts. Body text minimum 16px (prevents iOS zoom on input focus).
- **Colour:**
  - Primary: Deep blue/indigo for interactive elements
  - Likert scale: Diverging colour ramp (red → amber → green, or similar) applied consistently to Likert options so position is always colour-coded
  - Results charts use the same Likert colour ramp for consistency
  - Background: White/very light grey. No dark mode for now.
- **Layout:**
  - Single column on mobile. No horizontal scrolling, ever.
  - Maximum content width of ~640px, centred on larger screens.
  - Generous vertical spacing between questions (participants scroll, not swipe).
  - Sticky submit button at bottom of viewport on the survey form.
- **Interaction:**
  - Likert options render as full-width stacked buttons on mobile (not a horizontal row — 5 options won't fit side by side on a phone). Each button shows the label text, tall enough to tap comfortably (minimum 48px height, 8px gap).
  - On wider viewports (≥640px), Likert options can switch to a horizontal row if they fit.
  - Selected option: filled background with the Likert colour, clear contrast.
  - Subtle animation on select (scale bump or background fade).
  - Group selector cards: full-width stacked list on mobile, grid on wider screens.
- **Results (mobile):**
  - Histograms render as horizontal bars (labels on left, bars extending right) — this is the most phone-friendly chart orientation.
  - Diverging bar charts stack vertically, one per group, rather than side-by-side.
  - Summary stats shown as a compact row of chips (Mean: 3.2 | Median: 3 | n: 24).
  - Group breakdown sections are collapsible accordions to avoid overwhelming scroll depth.
- **Results (desktop, ≥1024px):**
  - Two-column layout: question text + histogram on left, diverging bars + stats on right.
  - Group breakdowns can expand inline.
- **Touch targets:** All interactive elements minimum 44×44px (Apple HIG) with adequate spacing to prevent mis-taps.

---

## Analytics & Statistics (all phases)

### Numeric Mapping
Likert labels are mapped to integers 1 through N (where N is the number of options). The first label = 1, last = N. This mapping is used for all statistical calculations.

### Calculations (in `lib/stats.ts`)

```typescript
// Core stats
function mean(values: number[]): number
function median(values: number[]): number
function standardDeviation(values: number[]): number

// KDE — only render if n ≥ 15 for the group/pool
function gaussianKDE(
  values: number[],
  bandwidth?: number,  // default: Silverman's rule of thumb
  points?: number      // default: 100 evaluation points between 1 and N
): { x: number; y: number }[]
```

### Diverging Bar Chart Logic
For a Likert scale with N options:
- If N is odd: middle option is neutral, splits evenly
- If N is even: split at midpoint (left half negative, right half positive)
- Each segment's width is proportional to the count for that option
- Colours: use the Likert colour ramp (negative = warm/red, positive = cool/blue-green)

---
---

# PHASE 1 — Static Local App

**Goal:** Fully functional survey + results UI with no backend. All state in localStorage. One person can test the complete flow using built-in dev tools to simulate multiple participants.

**Build this now.**

---

## Phase 1: Tech Stack

- **Framework:** React 18+ with TypeScript
- **Build tool:** Vite
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Routing:** React Router v6
- **YAML parsing:** `js-yaml` package
- **State management:** React Context + useReducer for response data
- **Deployment:** Vercel static export (future)

---

## Phase 1: Data Model

### YAML Config

The app reads from a single YAML file at build time: `src/config/event-config.yaml`

```yaml
events:
  - id: "sample-workshop"
    name: "Annual Strategy Workshop"
    description: "Aligning on priorities and assessing organisational readiness"
    status: "active"  # "active" or "finished"
    participants:
      - slug: "red-cuddly-fox"
      - slug: "blue-gentle-owl"
      - slug: "warm-sleepy-panda"
      - slug: "bright-tiny-heron"
      # Generate as many as needed — one per attendee
    sessions:
      - id: "opening-plenary"
        name: "Opening Plenary: State of Play"
        type: "plenary"
        status: "open"
        order: 1
        questions:
          - id: "q1"
            prompt: "How well is our organisation adapting to recent changes in the market?"
            likert_labels:
              - "Not at all well"
              - "Slightly well"
              - "Moderately well"
              - "Very well"
              - "Extremely well"
          - id: "q2"
            prompt: "How confident are you that our current strategy will deliver results in the next 12 months?"
            likert_labels:
              - "Very unlikely"
              - "Unlikely"
              - "Neutral"
              - "Likely"
              - "Very likely"

      - id: "breakout-priorities"
        name: "Breakout: Strategic Priorities"
        type: "breakout"
        status: "open"
        order: 2
        groups:
          - id: "growth"
            name: "Table 1: Growth"
          - id: "operations"
            name: "Table 2: Operations"
          - id: "talent"
            name: "Table 3: Talent"
        questions:
          - id: "q3"
            prompt: "Our team has the resources needed to execute on its top priority this quarter."
            likert_labels:
              - "Strongly disagree"
              - "Disagree"
              - "Neutral"
              - "Agree"
              - "Strongly agree"
          - id: "q4"
            prompt: "Rate your confidence in our ability to hire the right people in the next 6 months."
            likert_labels:
              - "1 - No confidence"
              - "2"
              - "3"
              - "4"
              - "5 - Full confidence"
```

### localStorage Schema

All participant state is stored in localStorage, keyed by the invite slug. State persists across tab closes and browser restarts.

**Responses:**
```
Key: bi:responses:{eventId}:{sessionId}:{slug}
Value: JSON string of:
{
  groupId: string | null,      // group ID from config, null for plenary sessions
  answers: {
    [questionId]: number       // 0-indexed position in likert_labels array
  },
  submittedAt: string          // ISO timestamp
}
```

**Group assignments:**
```
Key: bi:groups:{eventId}:{slug}
Value: JSON string of:
{
  [sessionId]: string          // group ID for each breakout session
}
```

---

## Phase 1: Routes

```
/                                          → Landing page
/invite/:slug                              → Event home (slug identifies participant + event)
/invite/:slug/session/:sessionId           → Session view: answer questions
/invite/:slug/session/:sessionId/results   → Results dashboard
```

### Landing Page (`/`)
- App name: "Breakout Intelligence"
- One-line description: "Real-time insights from workshop participants"
- Brief explanation of how it works (3-4 bullets)
- No session discovery — you cannot find or browse events from this page
- Clean, minimal design. No sign-up CTA.

### Event Home (`/invite/:slug`)
- Looks up the slug in the YAML config to find both the event and the participant
- If not found: friendly 404 — "This invite link isn't valid. Check with your workshop organiser."
- If event is `finished`: show event name and a message — "This event has ended. Thanks for participating." No session links, no further interaction.
- If found and active: shows event name, description, and session list
- A small greeting: "Welcome, [slug]" or similar (the slug is not secret but it's personal)
- List of sessions with their type (plenary/breakout) and status
- Click a session to enter it
- Closed sessions show a "View Results" link instead of "Join"
- Draft sessions are not shown

### Session View (`/invite/:slug/session/:sessionId`)
- If event is `finished`: redirect to Event Home (which shows the ended message)
- If breakout type and participant hasn't set a group yet: show group selector first
  - Display session's pre-defined groups as selectable cards/buttons (not free text)
  - Each card shows the group name
  - Tapping a card selects it, confirm with a "Join Group" button
  - Once set, show it as a pill/badge with a "change" option
- Display all questions for the session as a vertical form
- Each question renders as:
  - Question prompt text
  - Likert options as stacked buttons (mobile) or horizontal row (desktop if they fit)
  - Selected option is visually highlighted
- "Submit Responses" button at the bottom (sticky on mobile)
  - Saves all answers to localStorage
  - Shows confirmation message
  - Reveals link to results page
- If the participant has already submitted, show their previous answers (editable) with an "Update Responses" button
- If session is `closed`, redirect to results page

### Results Dashboard (`/invite/:slug/session/:sessionId/results`)
- Accessible whether or not the participant has submitted (so organisers can view)
- For each question, show:

**1. Response Histogram**
- Horizontal bar chart showing count for each Likert option
- Bars labelled with the Likert text and count
- Mean marked with a vertical line or indicator
- Median marked distinctly
- Show n (total responses)

**2. Diverging Stacked Bar Chart**
- Standard Likert visualisation: negative responses extend left, positive extend right, neutral in centre
- One bar per group (for breakout sessions) or one bar total (for plenary)
- This makes cross-group comparison immediate and intuitive

**3. Summary Statistics**
- Mean (numeric, mapping Likert options to 1–N)
- Median
- Standard deviation
- n (response count)

**4. Group Breakdown (breakout sessions only)**
- Same histogram repeated per group
- Groups sorted alphabetically
- Show group name and n for each

**5. Kernel Density Estimate (stretch — skip if time-constrained)**
- Only show if n ≥ 15 for the group/pool
- Smooth curve overlaid on histogram
- Use a simple Gaussian KDE with Silverman's bandwidth
- Label as "estimated distribution" to avoid over-interpreting small samples

---

## Phase 1: Dev Tools

Hidden panel triggered by Ctrl+Shift+D (keyboard shortcut). Essential for testing since there's no backend.

- Add mock responses: specify number of fake participants, randomise answers and group assignments across the session's defined groups
- Clear all responses for a session
- View current localStorage state
- Mock slugs use format `mock-participant-1`, `mock-participant-2`, etc.

---

## Phase 1: Project Structure

```
src/
├── config/
│   └── event-config.yaml          # Event/session/question definitions
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx            # Top-level layout (nav, footer)
│   │   └── SessionHeader.tsx       # Session name, type badge, group pill
│   ├── survey/
│   │   ├── LikertQuestion.tsx      # Single question with selectable options
│   │   ├── SurveyForm.tsx          # All questions for a session + submit
│   │   └── GroupSelector.tsx       # Pick from organiser-defined groups
│   ├── results/
│   │   ├── ResponseHistogram.tsx   # Bar chart for one question
│   │   ├── DivergingBar.tsx        # Diverging stacked bar (cross-group)
│   │   ├── SummaryStats.tsx        # Mean, median, SD, n
│   │   ├── GroupBreakdown.tsx      # Per-group histograms
│   │   ├── KDEOverlay.tsx          # Gaussian KDE curve (stretch)
│   │   └── ResultsDashboard.tsx    # Composed results view
│   └── dev/
│       └── DevTools.tsx            # Mock data generator panel
├── context/
│   └── ResponseContext.tsx         # Global state for responses
├── hooks/
│   ├── useEventConfig.ts          # Load and parse YAML config
│   ├── useSlug.ts                 # Extract slug from URL, resolve to event + participant
│   └── useResponses.ts            # CRUD for localStorage responses + group assignments
├── lib/
│   ├── stats.ts                   # Mean, median, SD, KDE calculations
│   ├── slug-resolver.ts           # Map invite slug → event ID
│   └── types.ts                   # TypeScript interfaces
├── pages/
│   ├── LandingPage.tsx
│   ├── EventHome.tsx              # /invite/:slug — resolves slug, shows sessions
│   ├── SessionView.tsx            # /invite/:slug/session/:sessionId
│   └── ResultsPage.tsx            # /invite/:slug/session/:sessionId/results
├── App.tsx                         # Router setup
└── main.tsx                        # Entry point
```

---

## Phase 1: Implementation Order

1. **Data layer first:** Parse YAML config, define TypeScript types, build localStorage hooks. Get this solid before touching UI.
2. **Survey flow second:** Landing → invite → event → session → submit. Get the happy path working.
3. **Results third:** Histogram → stats → diverging bar → group breakdown. KDE is stretch.
4. **Dev tools fourth:** Mock data generator is essential for testing results views.
5. **Polish last:** Refine Tailwind styling, animations, responsive breakpoints.
6. **Keep components pure where possible:** Pass data as props, keep localStorage interaction in hooks/context.
7. **The YAML config is the source of truth.** No admin editing UI. Organiser edits YAML and redeploys.

---

## Phase 1: Test Scenario

To validate end-to-end with one browser:

1. Open `localhost:5173` → see landing page
2. Navigate to `/invite/red-cuddly-fox` → see event page with session list
3. Click "Opening Plenary" session → see questions, answer them, submit
4. Open Dev Tools (Ctrl+Shift+D) → add 20 mock responses
5. Navigate to results → see histogram, diverging bar, stats
6. Go back, click "Breakout: Strategic Priorities"
7. Pick "Table 1: Growth" from group list → answer questions → submit
8. Dev Tools: add 10 mock responses for "Growth", 10 for "Operations", 8 for "Talent"
9. View results → see aggregate + group breakdown + diverging bar comparing groups
10. Close tab entirely, reopen `/invite/red-cuddly-fox` → all previous answers and group selections restored from localStorage

---
---

# PHASE 2 — Backend & Real-Time

**Goal:** Replace localStorage with a persistent backend. Multiple participants can submit simultaneously and see results update in real time. Event and session status can be controlled live.

**Depends on:** Phase 1 complete.

---

## Phase 2: What Changes

### Storage: localStorage → Supabase (or similar)
- All response data moves to a database
- localStorage becomes a write-through cache / optimistic update layer
- YAML config may remain for event definitions (or migrate to DB — decide at the time)

### Real-time subscriptions
- Results page subscribes to new responses via Supabase Realtime (or WebSocket)
- When a new response is submitted, all clients viewing that session's results see updated charts within seconds
- No manual refresh needed

### Live session controls
- Organiser can open/close sessions and mark events as finished without redeploying
- This requires a minimal organiser auth layer (even just a shared password per event)

### Slug generation
- CLI tool or admin endpoint to generate N unique adj-adj-noun slugs
- Collision checking against existing slugs in the database
- Bulk append to event config or database

### API shape (sketch)
```
POST   /api/events/:eventId/sessions/:sessionId/responses
GET    /api/events/:eventId/sessions/:sessionId/responses
PATCH  /api/events/:eventId/sessions/:sessionId/status
PATCH  /api/events/:eventId/status
WS     /api/events/:eventId/sessions/:sessionId/live
```

### What stays the same
- All Phase 1 UI components, routes, and design
- The participant flow is identical — they notice nothing except results now update live
- YAML config can still be used for initial event setup, with DB as runtime store

---

## Phase 2: Architecture Decisions (to make at build time)

- **Supabase vs custom backend?** Supabase gives you Postgres + Realtime + Auth out of the box. Custom (e.g. Express + WebSocket) gives more control. Supabase is probably the right call for speed.
- **Vercel deployment?** Vercel + Supabase is a well-trodden path. Serverless functions for the API, Supabase for data + realtime.
- **Config migration:** Do events/sessions/questions stay in YAML (loaded at build time) or move to the database (editable at runtime)? YAML is simpler; DB enables the admin UI in Phase 3. Recommend keeping YAML for Phase 2 and migrating in Phase 3.

---
---

# PHASE 3 — Presenter Screen & Admin UI

**Goal:** Desktop presenter view for projecting live results during the workshop. Admin interface for organisers to manage events without editing YAML.

**Depends on:** Phase 2 complete (requires real-time backend).

---

## Phase 3A: Presenter Screen

### Route
```
/present/:eventId
```
No participant slug needed — this is the organiser's view. Protected by organiser auth (from Phase 2).

### Layout
Desktop-only, optimised for projection (1920×1080 or similar).

**Left sidebar (slim, ~280px):**
- Event name at top
- All sessions listed, grouped vertically
- Under each session: all question prompts, truncated to one line
- Clicking a question selects it
- Currently selected question highlighted
- Response count badge next to each question (updates live)
- Session status indicators (open/closed)

**Right panel (remaining width):**
- Selected question's prompt displayed prominently at top
- Large, central number: the headline metric (mean score, displayed at ~120px font size)
- Below: response count ("24 of 38 participants")
- Below: the response histogram, full-width, with live animation as new responses arrive
- The histogram bars should animate smoothly (not jump) when new data comes in
- Diverging bar chart below (if breakout session), one bar per group, also live-updating

### Behaviour
- Auto-selects the first open question on load
- When a new response arrives via WebSocket:
  - The headline number smoothly transitions to the new value
  - The histogram bars animate to new widths
  - The response count increments
- Organiser can click through questions — the display transitions smoothly (crossfade or slide)
- Keyboard navigation: arrow keys to move between questions
- A subtle "live" indicator pulses in the corner to show the connection is active

### Design
- Dark background (dark grey/navy, not pure black) for projection contrast
- White/light text
- Likert colour ramp is the same as participant-facing, but brighter for projection visibility
- No chrome, no navigation bars — pure data display
- The overall feel should be: "this is impressive and trustworthy enough to project in front of senior policymakers"

---

## Phase 3B: Admin UI

### Route
```
/admin
/admin/events/:eventId
/admin/events/:eventId/sessions/:sessionId
```
Protected by organiser auth.

### Capabilities
- Create and edit events, sessions, and questions in the browser
- Generate participant slugs in bulk (specify count, generates adj-adj-noun slugs, shows list for copy/export)
- Open/close sessions live
- Mark events as finished
- View response data and export (CSV)
- Data model migrates from YAML to database (YAML can still be used for initial seeding)

### Design
- Standard admin layout: sidebar nav, content area
- Desktop-only is fine
- Functional over beautiful — this is internal tooling

---
---

# PHASE 4 — Future Ideas

Not specced in detail, but on the radar:

- **Additional question types:** Free text, ranking, matrix/grid questions
- **Export:** PDF report generation with charts embedded
- **Facilitator annotations:** Organiser can add notes/commentary to results that appear on the presenter screen
- **Multi-event dashboard:** Overview of all events, aggregate insights across workshops
- **Participant display names:** Optional — participant can set a name (still no registration, just a localStorage preference tied to their slug)
- **Conditional questions:** Show/hide questions based on previous answers
- **Timer/pace control:** Organiser sets a countdown for each session, visible to participants
