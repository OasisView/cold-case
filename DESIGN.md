# Cold Case Cluster Finder — Design Specification
> This file is the locked visual reference for Claude Code. Do not deviate from these values unless Jo explicitly approves a change. When building any component, check this file first.

---

## Project Decisions Log
> All product decisions locked by Jo & Manny. Do not reopen these without team discussion.

| # | Decision | Answer | Notes |
|---|---|---|---|
| 1 | Cluster threshold | **≥10 cases, ≤33% solve rate** | User-adjustable slider (min 5, max 50, step 5, default 10). Do NOT hardcode 10. |
| 2 | Default map view | **All states colored by 10-yr avg solve rate on load** | Render before any filters applied. Color scale: green (high) → red (low). |
| 3 | Black victim solve rate gap | **Keep as discoverable pattern** | Visible when user filters by race. Not surfaced by default. Data shows gap grew from 0.3pp (1980s) to 17.8pp (2010s). |

---

## Data Context
> Key facts Claude Code needs to understand the project. Do not invent data — all real numbers come from the verified datasets below.

### Primary Datasets
| File | Records | Years | Role |
|---|---|---|---|
| `SHR65_23.csv` | 894,636 | 1976–2023 | **Primary** — single source of truth. Solves all year coverage gaps. Includes CNTYFIPS, MSA, Circumstance columns. |
| `database.csv` | 638,454 | 1980–2014 | Legacy file. Overlaps with SHR65_23. Do not load both — use SHR65_23 only. |
| `UCR65_23a.sav` | 180,298 | 1965–2023 | Agency clearance rates. ORI → county FIPS (5-digit codes). Join key: ORI. |
| `State_Reporting_Rates_2022.xlsx` | 51 states | 2022 | Reliability badges. MS=24%, FL=48%, IA=59% low confidence. WA=92% high confidence. |

### Key Numbers (use these exactly in UI copy)
- Total records: **894,636** homicides
- Year range: **1976–2023**
- Unsolved since 1980: **237,000+**
- Overall solve rate: **70.7%**
- Female victims: **22.3%** (199,567)
- Strangulation cases: **10,157** (SHR label: `'Strangulation - hanging'`)
- National 2022 peak: **20,306** → 2024: **15,795** (22% decline)

### Racial Solve Rate Gap (confirmed across both datasets)
| Decade | Black | White | Gap |
|---|---|---|---|
| 1980s | 73.0% | 73.3% | +0.3pp |
| 1990s | 64.9% | 72.3% | +7.4pp |
| 2000s | 62.7% | 75.2% | +12.5pp |
| 2010s | 61.4% | 79.1% | **+17.8pp** |

### Green River Demo Scenario (verified ✅)
Filters: Washington State · Female victims · Strangulation · 1980–2000
Result: **128 cases**, ~48% unsolved.

| County | Cases | Unsolved % |
|---|---|---|
| King, WA | 52 | ~48% |
| Pierce, WA | 18 | ~50% |
| Spokane, WA | 14 | ~50% |
| Snohomish, WA | 8 | ~50% |
| Clark, WA | 7 | ~43% |

Demo line: *"52 cases. 4 jurisdictions. No single agency could see this pattern. Cold Case Cluster Finder connects them in 3 seconds."*

### Weapon Code Mapping (loader must normalize both files)
| database.csv | SHR65_23 | Code |
|---|---|---|
| Handgun | Handgun - pistol, revolver, etc | 12 |
| Rifle | Rifle | 13 |
| Shotgun | Shotgun | 14 |
| Firearm | Firearm, type not stated | 11 |
| Gun | Other gun | 15 |
| Knife | Knife or cutting instrument | 20 |
| — | Personal weapons, includes beating | 40 |
| Blunt Object | Blunt object - hammer, club, etc | 30 |
| Strangulation | Strangulation - hanging | 80 |
| Suffocation | Asphyxiation - includes death by gas | 85 |
| Fire | Fire | 65 |
| Drugs | Narcotics or drugs, sleeping pills | 70 |
| Drowning | Drowning | 75 |
| Unknown | Other or type unknown / Weapon Not Reported | 99 |

### Data Quality Flags
- `'Rhodes Island'` → `'Rhode Island'` fix on load (1,211 records)
- 252 unmatched ORIs (0.04%) → set `county_fips = NULL`, do not drop row
- `CNTYFIPS` in SHR65_23 is text (`'King, WA'`) — join to Census FIPS table for 5-digit codes
- Low-confidence states: MS (24%), FL (48%), IA (59%) — show reliability badge in UI
- High-confidence demo state: Washington (92%)

### Worst Performing Jurisdictions
| Jurisdiction | Solve Rate | Cases |
|---|---|---|
| District of Columbia | 34.2% | 7,108 |
| San Mateo, CA | 32.9% | 283 |
| Los Angeles, CA | 38.3% | 1,113 |

---

## Tech Stack (locked)
| Layer | Choice |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Map | Mapbox GL JS (SSR disabled) |
| State management | Zustand |
| Database | Supabase (PostgreSQL + PostGIS) |
| Deployment | Vercel |
| API layer | `lib/supabase.ts` — ALL queries go through this single file. Never import Supabase client directly in components. |

## Team Roles
- **Jo (frontend lead)**: Map component, filter UI, cluster visualization, Supabase client queries
- **Manny (data lead)**: Loader script, Supabase schema, SQL cluster query, agency geocoding

## Deployment Sequence (do not skip steps)
1. Create Supabase project → copy connection string
2. Run data loader locally → confirm Green River query returns results before touching Vercel
3. Create Vercel project → add `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` env vars **before first deploy**
4. In Supabase: add Vercel production URL to Site URL + Redirect URLs (prevents CORS)
5. Only then push to Vercel

---


## Design Philosophy

This tool is built for **investigative journalists, cold case nonprofits, and law enforcement cold case units**. The aesthetic is **dark intelligence dashboard** — serious, credible, surgical. It should feel like a FBI case file meets data journalism. Nothing playful, nothing startup-y. Every design decision reinforces trust and authority.

The one thing users remember: **information surfaces from the dark** — clusters emerge, data reveals itself, patterns become visible.

---

## Desktop-Only Build Rules

This app is desktop-only. No mobile, no tablet. These rules prevent layout from looking different across computers.

```
Minimum supported width: 1280px
app/layout.tsx root div: min-width: 1280px
Below 1280px: show a centered message — "Cold Case Cluster Finder is optimized for desktop. Please open on a larger screen."
```

**Fixed column widths — never use % for structural layout:**
```
Filter panel:        260px  (fixed, never fluid)
Dashboard right panel: 340px default, drag-resizable (min 300px, max 600px, 4px drag handle on left edge)
  Drag handle pill:  3px wide, 32px tall, border-radius 999px, centered vertically (top 50%, translateY(-50%))
  Default:           pill #2A2F3D, strip bg transparent
  Hover:             pill #C8102E, strip bg rgba(200,16,46,0.06), cursor col-resize
  Dragging:          pill #C8102E, strip bg rgba(200,16,46,0.14)
  Transition:        150ms ease on pill color and strip background
Map canvas:          calc(100vw - 260px)  (fills remaining space — this is the only fluid value allowed)
Case file card:      800px max-width, centered
```

**Test at these three breakpoints — layout must be identical:**
- 1280px (minimum)
- 1440px (most common laptop)
- 1920px (large monitor)

---

## Block-Based Layout

Every section of every page is a **self-contained, isolated block**. Changing font size, padding, or content inside one block never affects adjacent blocks. This is a hard architectural rule.

**Rules:**
- Every block has a fixed height or `min-height`. Never let a block grow and push adjacent blocks.
- Every block has `overflow: hidden`. Content that grows stays inside its box.
- Every distinct section is its own component file. Never combine two independent sections.
- Blocks stack vertically using a fixed-gap parent — never rely on margin collapsing between blocks.

**Example — Dashboard:**
```
┌─────────────────────────────────────────────────────────┐
│ TopNav (h-[64px], fixed, isolated)                      │
├───────────────┬──────────────────────┬──────────────────┤
│ FilterPanel   │ StatBar (isolated)   │ DetailPanel      │
│ (w-[260px]    ├──────────────────────┤ (drag-resizable,    │
│  fixed)       │ ClusterList          │  340px default,       │
│               │ (isolated, scrolls   │  300-600px range, │
│               │  internally)         │  isolated)       │
└───────────────┴──────────────────────┴──────────────────┘
```
Increasing font size in StatBar → zero effect on ClusterList or FilterPanel.

---

## Auto-Update Rule

Whenever Jo approves a design change during a build session, Claude Code must immediately update the relevant section of this file before committing. DESIGN.md is always the source of truth — it should reflect what is actually built, not what was planned.

---

## Color Tokens

Use these exact values everywhere. No approximations.

```css
--bg:        #0C0C0E   /* Page background — near black, slightly warm */
--bg2:       #111216   /* Panel backgrounds, nav */
--bg3:       #16181D   /* Elevated surfaces, headers */
--border:    #1F2430   /* All borders, dividers, grid lines */

--red:       #C8102E   /* Primary accent — active states, alerts, CTAs */
--red-glow:  rgba(200,16,46,0.25)  /* Red shadow/glow effects */
--red-dim:   rgba(200,16,46,0.12)  /* Red tinted backgrounds */

--amber:     #E8A020   /* Secondary accent — data values, warnings, year labels */
--amber-dim: rgba(232,160,32,0.12) /* Amber tinted backgrounds */

--ice:       #F0F2F5   /* Primary text */
--muted:     #5A6070   /* Secondary text, labels */
--muted2:    #8A929F   /* Tertiary text, descriptions */

--green:     #22C55E   /* Reliability/confidence indicators only */
```

---

## Typography

### Font Stack
```css
/* Import — add to _app.tsx or layout.tsx */
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&family=IBM+Plex+Mono:wght@300;400;500&display=swap');

--font-display: 'Bebas Neue', sans-serif;   /* Headlines, stats, location names */
--font-mono:    'IBM Plex Mono', monospace;  /* Data values, labels, badges, filters */
--font-body:    'DM Sans', sans-serif;       /* Body copy, descriptions, generated text */
```

### Usage Rules
| Element | Font | Size | Weight | Letter-spacing |
|---|---|---|---|---|
| Page headline | Bebas Neue | clamp(52px, 8vw, 88px) | — | 3px |
| Section title | Bebas Neue | 22–30px | — | 2px |
| Stat numbers (large) | Bebas Neue | 28–52px | — | 1–2px |
| Filter labels | IBM Plex Mono | 11px | 400 | 2.5px | color: #8A929F (--muted2) |
| Data values | IBM Plex Mono | 10–12px | 500 | 1px |
| Eyebrow labels | IBM Plex Mono | 8–9px | 400 | 2.5–3px, uppercase |
| Body / descriptions | DM Sans | 12–14px | 300–400 | 0.3px |
| Subtext / tagline | DM Sans | 14px | 300 | 0.3px |

**Never use**: Inter, Roboto, Arial, system-ui, or any generic sans-serif.

---

## Landing Page — Full Spec

### Layout
- Full viewport, `overflow: hidden`
- Background: `#0C0A0A` (slightly warmer than `--bg`)
- All content centered both axes
- Content stacks vertically with `gap: 0`, managed by individual margins

### Layer Order (bottom to top)
1. `.spiral-bg` — bullseye grid (absolute, inset: -60px, z-index: 0)
2. `.spiral-fade` — radial dark overlay (absolute, inset: 0, z-index: 1)
3. `.center-glow` — red bloom (absolute, z-index: 2)
4. `.landing-content` — text + button (relative, z-index: 3)

---

### Bullseye Background Grid

**Structure**: 16 columns × 12 rows of concentric-ring "bullseye" circles, generated in JavaScript. Each cell is 58px wide with 4 concentric rings (outer, mid, inner, dot).

**Color logic** — rings are colored per-cell based on distance from center:
```js
const cols = 16, rows = 12;
const cx = (cols - 1) / 2;   // 7.5
const cy = (rows - 1) / 2;   // 5.5
const maxDist = Math.sqrt(cx * cx + cy * cy);

// Per cell:
const dist = Math.sqrt((col - cx) ** 2 + (row - cy) ** 2);
const proximity = 1 - (dist / maxDist); // 1.0 = center, 0.0 = corner

const r     = Math.round(55 + proximity * 80);   // 55–135
const g     = Math.round(8  + proximity * 10);   // 8–18
const b     = Math.round(10 + proximity * 12);   // 10–22
const alpha = 0.55 + proximity * 0.40;           // 0.55–0.95

// Outer ring:  rgba(r, g, b, alpha)
// Mid ring:    rgba(r*0.85, g, b, alpha*0.80)
// Inner ring:  rgba(r*0.70, g, b, alpha*0.65)
// Dot:         same as inner ring, filled circle
```

**Result**: center cells are rich dark red-brown (~`#871012` at full opacity), edges are deep dark red (~`#370A0A`). The grid fades black → deep red → richer red toward center. NOT grey. NOT neutral.

**Cell DOM structure**:
```html
<div class="spiral-cell">
  <div class="bullseye" style="border: 1.5px solid {ringColor}">
    <div style="position:absolute; width:38px; height:38px; border-radius:50%; border:1.5px solid {ring2Color}"></div>
    <div style="position:absolute; width:20px; height:20px; border-radius:50%; border:1.5px solid {ring3Color}"></div>
    <div class="bullseye-dot" style="background:{ring3Color}"></div>
  </div>
</div>
```

**Bullseye CSS**:
```css
.spiral-bg {
  position: absolute;
  inset: -60px;
  display: grid;
  grid-template-columns: repeat(16, 1fr);
  grid-template-rows: repeat(12, 1fr);
  background: #0C0A0A;
  pointer-events: none;
}
.spiral-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}
.bullseye {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bullseye-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  position: relative;
  z-index: 1;
}
```

---

### Radial Fade Overlay

Sits above the grid, darkens the edges so the center stays visible and the content reads clearly:

```css
.spiral-fade {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center,
    rgba(12,10,10,0.00)  0%,
    rgba(12,10,10,0.00) 35%,
    rgba(12,10,10,0.45) 60%,
    rgba(12,10,10,0.80) 78%,
    rgba(12,10,10,0.95) 92%
  );
  pointer-events: none;
  z-index: 1;
}
```

---

### Center Glow

Warm red bloom behind the content, wider than the text block:

```css
.center-glow {
  position: absolute;
  width: 900px;
  height: 600px;
  background: radial-gradient(ellipse at center,
    rgba(180,20,30,0.22)  0%,
    rgba(140,12,20,0.14) 40%,
    rgba(80,8,12,0.06)   65%,
    transparent          80%
  );
  pointer-events: none;
  z-index: 2;
}
```

---

### Landing Content — Text & Button

```css
.landing-content {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: fadeUp 0.9s ease-out both;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

**Eyebrow** — appears first, staggered:
```
Font:           IBM Plex Mono
Size:           10px
Letter-spacing: 4px
Color:          #8A929F (--muted2)
Text:           "COLD CASE INTELLIGENCE PLATFORM"
Margin-bottom:  20px
Animation:      fadeUp, delay 0.1s
```

**Headline** — main title:
```
Font:           Bebas Neue
Size:           clamp(52px, 8vw, 88px)
Line-height:    0.95
Letter-spacing: 3px
Color:          #F0F2F5 (--ice)
Text:           "COLD. CLUSTERED." (white) + line break + "CONNECTED." (red #C8102E)
Animation:      fadeUp, delay 0.2s
```

**Subtext** — tagline below headline:
```
Font:           DM Sans
Size:           14px
Weight:         300
Color:          #8A929F (--muted2)
Line-height:    1.7
Margin-top:     24px
Text:           "What the data sees. What detectives missed."
                "The map they never made."
Animation:      fadeUp, delay 0.35s
```

**Stat block** — key number:
```
Number font:    Bebas Neue, 52px, letter-spacing 2px, color #F0F2F5
Label font:     IBM Plex Mono, 9px, letter-spacing 3px, uppercase, color #5A6070
Text:           "237,000+" / "UNSOLVED HOMICIDES SINCE 1980"
Margin-top:     36px
Animation:      fadeUp, delay 0.45s
```

**Enter button**:
```
Font:           Bebas Neue, 14px, letter-spacing 4px, uppercase
Padding:        9px 32px
Background:     transparent (default) → #C8102E (hover, slide-in from left)
Border:         1px solid #C8102E
Color:          #F0F2F5
Text:           "ENTER"
Margin-top:     44px
Hover effect:   Red fill slides in from left (translateX -101% → 0), duration 0.25s
Animation:      fadeUp, delay 0.55s
```

---

## Dashboard Design Tokens

These apply to the main app after the user clicks Enter. Full dashboard spec will be documented separately, but the same color and font tokens apply throughout.

### Active vs Inactive Filter Chips
```
Active (red):   background rgba(200,16,46,0.15), border 1px solid #C8102E, color #F0F2F5
Active (amber): background rgba(232,160,32,0.12), border 1px solid #E8A020, color #F0F2F5
Inactive:       background transparent, border 1px solid #1F2430, color #5A6070
Hover:          border-color rgba(200,16,46,0.4), color #8A929F
Font:           IBM Plex Mono, 10px
Border-radius:  2px (sharp corners, not rounded)
```

### Panel Headers with Red Top Border
Used on the Case File panel and any priority cards:
```
Border-top:     3px solid #C8102E
Background:     #16181D (--bg3)
Eyebrow:        IBM Plex Mono, 8px, letter-spacing 2.5px, color #C8102E, uppercase
Title:          Bebas Neue, 22–24px, color #F0F2F5, with red accent word
```

### Cluster Nodes on Map
```
Hot (≤33% solved):
  Outer:        background rgba(200,16,46,0.12), border 1px solid rgba(200,16,46,0.35)
                box-shadow 0 0 28px rgba(200,16,46,0.15)
  Inner circle: background rgba(200,16,46,0.65), border 1.5px solid #C8102E
  Pulse ring:   border rgba(200,16,46,0.5), animation pulseRing 2.5s infinite
  Selected:     add two spinning dashed rings (8s and 14s, opposite directions)

Warm (33–50% solved):
  Outer:        background rgba(232,160,32,0.08), border 1px solid rgba(232,160,32,0.25)
  Inner circle: background rgba(232,160,32,0.50), border 1.5px solid #E8A020
```

### Stat Numbers
```
Large:   Bebas Neue, 28–30px
Red:     #C8102E — unsolved counts, low solve rates
Amber:   #E8A020 — peak years, moderate rates, data values
White:   #F0F2F5 — neutral counts, totals
```

---

## Animation Standards

```css
/* Page / section entry */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* Use staggered animation-delay: 0.1s increments per element */

/* Cluster pulse ring */
@keyframes pulseRing {
  0%   { transform: scale(1);   opacity: 0.6; }
  70%  { transform: scale(1.5); opacity: 0;   }
  100% { transform: scale(1.5); opacity: 0;   }
}

/* Cluster node entry */
@keyframes clusterIn {
  from { opacity: 0; transform: scale(0.2); }
  to   { opacity: 1; transform: scale(1);   }
}

/* Selected cluster spinning rings */
@keyframes spin { to { transform: rotate(360deg); } }
/* Outer spin: 8s linear infinite */
/* Inner spin: 14s linear infinite reverse */

/* Live indicator blink */
@keyframes blink {
  0%, 100% { opacity: 1;   }
  50%       { opacity: 0.3; }
}
```

---

## Border Radius Rules

```
Panels, cards, buttons:  2px  (sharp — authoritative, not friendly)
Chips / badges:          2px
Cluster nodes:           50%  (circles only)
Bar fills:               1px
```

**Never use** rounded corners larger than 4px. This is a forensic tool, not a SaaS product.

---

## Scrollbar

```css
::-webkit-scrollbar       { width: 3px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #1F2430; border-radius: 2px; }
```

---

## Next.js / Tailwind Implementation Notes

- Use Tailwind v4 with `@theme` directive for all CSS variables above
- Import Google Fonts in `app/layout.tsx` via `next/font/google` — do NOT use a `<link>` tag
- Mapbox: disable SSR (`dynamic(() => import(...), { ssr: false })`)
- All color tokens should live in `tailwind.config.ts` AND as CSS custom properties in `globals.css`
- Component file for landing page: `app/page.tsx` (or `app/landing/page.tsx` if using route groups)
- Bullseye grid logic belongs in a client component: `components/BullseyeBackground.tsx`

---

## Navigation (locked — v4)

### Top Nav — all pages except Case File
```
Height:        64px
Background:    #111216 (--bg2)
Border-bottom: 1px solid #1F2430

Left side:  Logo (dot 9px + COLD[red]CASE CLUSTER FINDER 18px) + nav tabs
Right side: Dataset meta + Live Data badge

Tab font:    IBM Plex Mono, 11px, letter-spacing 2.5px, uppercase
Tab active:  color #F0F2F5, border-bottom 2px solid #C8102E
Tab inactive: color #5A6070, border-bottom 2px solid transparent
```

### Nav Tabs (in order)
1. Dashboard → `/dashboard`
2. Map → `/map`  ← NOT "Live Map"
3. Insights → `/insights`
4. Methodology → `/methodology`

### Case File Nav — back bar only
```
Height: 56px, background #111216, border-bottom 1px solid #1F2430
← Back to Dashboard    CLUSTER DEEP DIVE
Back btn:  IBM Plex Mono, 13px, color #F0F2F5, ← arrow 16px
           Hover: red underline (border-bottom 1px solid #C8102E)
Eyebrow:   IBM Plex Mono, 9px, letter-spacing 2px, color #C8102E, uppercase
Click dark background outside card → navigates to /dashboard
```

---

## Filter Panel (locked — v4)

All filters use **dropdowns**, not chips. Applies to both Dashboard and Map pages.

### Filter Panel Structure
```
Width:        260px
Background:   #111216 (--bg2)
Border-right: 1px solid #1F2430

Header row:  "FILTERS" label (13px, color #F0F2F5) + "RESET ALL" in red (11px)
Each block:  label + input, separated by 1px border
Bottom:      "● ADEQUATE REPORTING COVERAGE" green badge, pinned to bottom
```

### Filter Controls
| Filter | Control Type | Options |
|---|---|---|
| Date Range | Dual range slider | 1976–2023, amber thumbs |
| Victim Sex | Dropdown | All / Female / Male |
| Weapon Type | Dropdown | All Weapons / Strangulation / Handgun / Knife / Blunt Object / Unknown |
| State / Region | Dropdown | All States / [each state] |
| Victim Race | Dropdown | All Races / White / Black / Asian-PI / Native American |
| Solve Status | Dropdown | All / Unsolved Only / Solved Only |
| Min Cluster Size | Stepper (− val +) | Default 10, min 5, max 50, step 5 |

### Dropdown Style (custom div-based, not native select)
```css
/* Trigger */
background:    #16181D
border:        1px solid #1F2430
color:         #F0F2F5
font-family:   IBM Plex Mono, 12px
padding:       7px 10px
custom arrow:  SVG chevron right 10px, rotates 180° on open (150ms)
focus border:  rgba(200,16,46,0.5)
border-radius: 2px

/* Dropdown list (position: fixed, z-50, max-height 240px, overflow-y auto) */
option row:    padding 8px 10px, IBM Plex Mono 12px, color #F0F2F5
option hover:  background #C8102E, color #F0F2F5
option selected: background rgba(200,16,46,0.15), left border 2px solid #C8102E
click outside: closes dropdown (document mousedown listener)
scroll:        closes dropdown (document scroll listener, capture phase)
keyboard:      ArrowDown/Up navigate, Enter selects, Escape closes
```

### Stepper Style (Min Cluster Size)
```
Button:  28×28px, background #16181D, color #8A929F
Value:   36px wide, center-aligned, IBM Plex Mono 12px
Border:  1px solid #1F2430 around whole stepper
```

---

## Map Page Layout (locked — v4)

### Quadrant Structure
```
grid-template-columns: 260px 1fr
```

**Quadrant 1** — Filter Panel (left, same as Dashboard)

**Quadrant 2** — Map Canvas, layered bottom to top:
- Layer A (z:0): Dark gradient base + red glow at cluster regions
- Layer B (z:1): Grid lines — 48×48px, rgba(31,36,48,0.3) [deferred to Phase 7]
- Layer C (z:2): US outline blob, pointer-events: none [deferred to Phase 7]
- Layer D (z:3): Cluster nodes — pointer-events: all
- Layer E (z:10): Stats bar float top-right
- Layer F (z:10): Legend + help button float bottom-right

### Stats Bar (top-right float)
```
Background:  rgba(11,13,18,0.90), backdrop-filter: blur(6px)
Border:      1px solid #1F2430
Format:      [N] cases · [N unsolved, red] · [N] clusters
Separator:   1px × 14px vertical rule, color #1F2430
```

### State Zoom Animation
```
Trigger:     State/Region filter change in FilterPanel
Animation:   map.fitBounds with STATE_BOUNDS lookup in lib/constants.ts
Bounds:      [west, south, east, north] bounding box per state (51 entries)
Padding:     { top: 80, bottom: 80, left: 80, right: 80 }
Duration:    1200ms, essential: true
Default:     flyTo center [-98.5795, 39.8283], zoom 3.5 -- full US view
Advantage:   fitBounds auto-calculates zoom to fit entire state in viewport
Demo moment: Washington fitBounds [-124.76, 45.54, -116.92, 49.00] -- Green River
```

### State Boundary Highlight
```
Source:      PublicaMundi US states GeoJSON (fetched on map load)
Layer id:    state-highlight
Type:        line
Paint:
  line-color:   #E8A020 (amber)
  line-width:   1.5
  line-opacity: 0 (default hidden)
Transition:
  Fade in:  600ms (opacity 0 -> 0.5) when state filter selected
  Fade out: 400ms (opacity 0.5 -> 0) when filter reset to All States
Filter:      ['==', ['get', 'name'], stateFilter] -- matches GeoJSON name property
Degradation: Fetch failure silently skipped, no error state
```

---

## Case File Page (locked — v4)

### Page Structure
- Dark `#0C0C0E` background, large title above card
- White document card with heavy box-shadow

### White Document Card
```
Background:    #F2F0EC
Border-radius: 2px
Shadow:        0 8px 48px rgba(0,0,0,0.55), 0 2px 12px rgba(0,0,0,0.35)
```

**Card header (dark band at top of white card)**
```
Background:  #1A1C22
Left:        blinking red dot + "ACTIVE CLUSTER — PRIORITY REVIEW" + location name
Right:       large case count (Bebas Neue 40px) + year range (muted mono)
```

**Detail grid (white, 2×2)**
```
Dividers:  1px solid #D8D4CE
Label:     IBM Plex Mono 8px, color #888078, uppercase + small icon square
Value:     DM Sans 13px, weight 500, color #1A1C22
```

**Story Brief**
```
Label:  IBM Plex Mono 8px, color #888078 + "AI GENERATED" amber badge inline
Body:   DM Sans 13px, weight 300, color #3A3830, line-height 1.78
Bold:   weight 600, color #1A1C22
```

**Actions footer**
```
Background:    #EBE8E2
Primary btn:   #C8102E filled, white text
Secondary btn: transparent, border 1px solid #B8B4AC, color #4A4840
```

---

## Insights Page (locked — v5)

### Page Layout
```
TopNav above, scrollable content below
Max-width: 1100px, centered, padding 40px 32px 60px
Eyebrow: "DATA INSIGHTS" — IBM Plex Mono, 9px, letter-spacing 3px, color #C8102E
Headline: "WHAT THE DATA SEES" — Bebas Neue, 30px, color #F0F2F5
```

### Finding Cards (2-column grid, gap 20px)
```
Card background: #111216
Card border:     1px solid #1F2430, border-radius 2px
Card header:     padding 16px 20px, border-bottom 1px solid #1F2430
Finding label:   IBM Plex Mono, 8px, letter-spacing 2.5px, color #C8102E, uppercase
Finding title:   Bebas Neue, 22px, letter-spacing 2px, color #F0F2F5
Card body:       padding 16px 20px
```

### Finding 01 — Racial Solve Rate Gap
```
4 decade rows from RACIAL_SOLVE_GAP constant
Black bar: #C8102E, White bar: #5A6070
Gap label: amber #E8A020, format "+Xpp"
Legend: 12×4px color swatches + IBM Plex Mono 8px labels
```

### Finding 02 — Jurisdictional Accountability
```
3 horizontal bars from WORST_JURISDICTIONS constant
DC 34.2% (7,108), San Mateo 32.9% (283), LA 38.3% (1,113)
Bar: red #C8102E on #16181D track, height 20px
Solve rate label inside bar, case count on right
```

### Finding 03 — National Trend
```
2 comparison bars, proportional heights (max 120px)
2022 peak: #C8102E, 120px (100%)
2024 latest: #5A6070, height = 120 × (15795/20306) ≈ 93px (77.8%)
Decline label: amber #E8A020, "▼ 22%"
Values from NATIONAL_TREND constant
```

### Finding 04 — Data Reliability by State
```
5-cell grid from STATE_RELIABILITY constant
MS 24% red, FL 48% red, IA 59% amber, WA 92% green, VA 100% green
Cell: #16181D background, 1px solid #1F2430 border
Percentage: Bebas Neue 28px, color matches confidence level
Label: IBM Plex Mono 7px, LOW/MEDIUM/HIGH
```

---

## Methodology Page (locked — v5)

### Page Layout
```
TopNav above, single scrollable column
Max-width: 900px, centered, padding 40px 32px 60px
Eyebrow: "METHODOLOGY" — IBM Plex Mono, 9px, letter-spacing 3px, color #C8102E
Headline: "HOW IT WORKS" — Bebas Neue, 30px, color #F0F2F5
```

### Section Cards (3 stacked, gap 24px)
```
Card background: #111216
Card border:     1px solid #1F2430, border-radius 2px
Section label:   IBM Plex Mono, 8px, letter-spacing 2.5px, color #C8102E, uppercase
Section title:   Bebas Neue, 22px, letter-spacing 2px, color #F0F2F5
Body text:       DM Sans, 13px, weight 300, color #8A929F, line-height 1.78
```

### Section 1 — Algorithm (Cluster Detection)
```
Formula block: #16181D background, 1px solid #1F2430 border
Condition labels: IBM Plex Mono 12px, amber #E8A020
Condition values: IBM Plex Mono 12px, ice #F0F2F5
Condition 1: total_cases >= min_cluster_size
Condition 2: solve_rate <= 0.33
```

### Section 2 — Data Sources
```
2-column grid of source cards
Card: #16181D background, 1px solid #1F2430 border, padding 16px
Source name: IBM Plex Mono 12px, ice #F0F2F5
Record count: IBM Plex Mono 10px, amber #E8A020
Year range: IBM Plex Mono 10px, muted #5A6070
Role: DM Sans 12px, weight 300, color #8A929F
```

### Section 3 — Limitations
```
4 bullet points with red #C8102E dot (4px)
Body: DM Sans 13px, weight 300, color #8A929F, line-height 1.78
Topics: low-confidence states, 252 unmatched ORIs, Rhode Island typo, solve rate definition
```

---

## Reference Files

- `coldcase_mockup_v4.html` — full interactive mockup, all 6 screens
- This file (`DESIGN.md`) — locked spec, source of truth for all visual decisions
