# Cold Case Cluster Finder — rules.md
> This is the enforcement layer. These are non-negotiable constraints. If a rule conflicts with something that seems convenient, the rule wins. Stop and ask Jo before breaking any rule.

> **No hallucinations.** If something is not explicitly written in CLAUDE.md, DESIGN.md, or rules.md — do not invent it. Stop and ask Jo. This includes data numbers, component names, API shapes, color values, and layout decisions.

> **Read all three files at the start of every session.** Do not rely on memory from a previous session.

---

## 🔴 ABSOLUTE RULES — never break these

### Data
- [ ] **Never import Supabase client outside `lib/supabase.ts`**
- [ ] **Never load `database.csv` — use `SHR65_23.csv` only**
- [ ] **Never hardcode the cluster threshold** — always read from `useFilterStore`
- [ ] **Never drop rows with unmatched ORIs** — set `county_fips = NULL`, keep the row
- [ ] **Never commit API keys or tokens** — use `.env.local` only

### Testing
- [ ] **Never commit without running unit tests** — `npm test` must pass
- [ ] **Never mock real data numbers in tests** — use actual expected values (128 cases for Green River)
- [ ] **Never skip the Green River smoke test** after any data loader change

### Design
- [ ] **Never approximate color values** — copy exact hex from DESIGN.md
- [ ] **Never use border-radius > 4px** — this is a forensic tool, not a consumer app
- [ ] **Never use Inter, Roboto, Arial, or system-ui** — only Bebas Neue, IBM Plex Mono, DM Sans
- [ ] **Never use chips for filters** — all filter controls are dropdowns or steppers (v4 locked)
- [ ] **Never call the map tab "Live Map"** — it is "Map"
- [ ] **Never build for mobile or tablet** — desktop only, minimum 1280px
- [ ] **Never use percentage widths for structural columns** — fixed pixels only (e.g. `w-[220px]`)
- [ ] **Never let one block affect an adjacent block** — every section is isolated with `overflow: hidden`
- [ ] **Never combine two independent sections into one component** — one block = one component file

### Architecture
- [ ] **Never merge a branch to main until it is complete and tests pass**
- [ ] **Never put business logic in components** — logic goes in `lib/` or `store/`
- [ ] **Never write inline SQL** — all queries live in `lib/supabase.ts`

---

## 🟡 BUILD RULES — follow at every step

### Before starting any component
- [ ] Read `DESIGN.md` — find the relevant section for what you're building
- [ ] Read `CLAUDE.md` — confirm component order and data rules
- [ ] Check `lib/types.ts` — use existing types before creating new ones
- [ ] Check `lib/constants.ts` — use existing constants before hardcoding

### While building
- [ ] Write the unit test for a function **before or alongside** building it
- [ ] Every `lib/supabase.ts` function must have a try/catch and return a typed result
- [ ] Every component must handle: loading state, empty state, error state
- [ ] Every user-facing number must come from real data or verified constants in CLAUDE.md — never invent stats
- [ ] Color is never the only indicator — pair color with text or icon for colorblind accessibility

### Before committing
- [ ] `npm test` passes with no failures
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No console.log statements left in committed code
- [ ] No hardcoded strings that should be constants
- [ ] Component renders correctly at 1280px, 1440px, 1920px
- [ ] Empty state tested — what happens with 0 cluster results?
- [ ] Error state tested — what happens if Supabase returns an error?

---

## 🟢 PHASE COMPLETION GATES

Do not advance to the next phase until all gates are green.

### Phase 1: Foundation
- [ ] `lib/supabase.ts` — all query functions written and unit tested
- [ ] `lib/types.ts` — `Cluster`, `Case`, `FilterState`, `ReliabilityBadge` types defined
- [ ] `lib/constants.ts` — weapon codes, threshold defaults, state reliability rates
- [ ] `store/useFilterStore.ts` — filter state, derived cluster query params
- [ ] Integration test: filter state → correct query params → correct Supabase call shape
- [ ] **Phase summary written and confirmed by Jo before Phase 2 begins**

### Phase 2: Dashboard
- [ ] `FilterPanel` renders with all dropdowns, date range slider, stepper
- [ ] Filter changes update `useFilterStore` correctly (integration test)
- [ ] `StatBar` displays correct counts (mock data initially)
- [ ] `ClusterList` renders clusters sorted by unsolved count
- [ ] `DetailPanel` shows correct data for selected cluster
- [ ] Each section (StatBar, ClusterList, DetailPanel) is an isolated block — resizing one does not affect others
- [ ] Renders correctly at 1280px, 1440px, 1920px
- [ ] Empty state: no clusters → friendly message, not blank or crash
- [ ] Error state: data unavailable → error message + retry button
- [ ] **Phase summary written and confirmed by Jo before Phase 3 begins**

### Phase 3: Map
- [ ] Mapbox loads with SSR disabled (no hydration error)
- [ ] Mapbox token loaded from env var — build fails if missing
- [ ] Cluster nodes render at correct coordinates
- [ ] Hot/warm color coding matches solve rate (≤33% = red, 33–50% = amber)
- [ ] Clicking a node navigates to `/cluster/[id]`
- [ ] Stats bar shows live counts matching filter state
- [ ] Map renders 14 clusters without frame drops
- [ ] Map fails gracefully if token is invalid
- [ ] Filter panel and map canvas are isolated blocks — filter panel width never changes map canvas
- [ ] Renders correctly at 1280px, 1440px, 1920px
- [ ] **Phase summary written and confirmed by Jo before Phase 4 begins**

### Phase 4: Case File
- [ ] White document card renders correctly on dark background
- [ ] Header dark band: blinking dot, location, case count
- [ ] 2×2 detail grid: correct data, correct light/dark text on white
- [ ] AI Generated badge renders next to story brief label
- [ ] Story brief populated from data (not hardcoded)
- [ ] Back arrow returns to `/dashboard` with filter state preserved
- [ ] Download Brief button triggers PDF export
- [ ] PDF failure: toast error shown, page does not crash
- [ ] Each card section (header band, detail grid, story brief, footer) is an isolated block
- [ ] Renders correctly at 1280px, 1440px, 1920px
- [ ] **Phase summary written and confirmed by Jo before Phase 5 begins**

### Phase 5: Insights + Methodology
- [ ] All data values on Insights page match verified numbers in CLAUDE.md
- [ ] Racial gap bars match decade data exactly (1980s: +0.3pp → 2010s: +17.8pp)
- [ ] Reliability grid matches `State_Reporting_Rates_2022.xlsx` values
- [ ] Methodology page: algorithm formula renders correctly
- [ ] No invented statistics anywhere
- [ ] Each finding card on Insights is an isolated block
- [ ] Renders correctly at 1280px, 1440px, 1920px
- [ ] **Phase summary written and confirmed by Jo before Phase 6 begins**

### Phase 6: Landing Page
- [ ] `app/page.tsx` renders the landing page directly — no redirect to /dashboard
- [ ] `BullseyeBackground.tsx` is a client component with SSR disabled, 16×12 bullseye grid built exactly per DESIGN.md
- [ ] Eyebrow: "COLD CASE INTELLIGENCE PLATFORM" — IBM Plex Mono, 10px, letter-spacing 4px, color muted2
- [ ] Headline: "COLD. CLUSTERED." in white + "CONNECTED." in red — Bebas Neue, clamp(52px, 8vw, 88px)
- [ ] Tagline: "What the data sees. What detectives missed. The map they never made." — DM Sans weight 300
- [ ] Stat block: "237,000+" / "UNSOLVED HOMICIDES SINCE 1980" — exact numbers from CLAUDE.md, never invented
- [ ] ENTER button: transparent default, red fill slides in from left on hover, navigates to /dashboard
- [ ] All elements use staggered fadeUp animation per DESIGN.md animation standards
- [ ] Center glow renders behind content
- [ ] Landing page has no TopNav — it is a fully isolated page with no shared layout chrome
- [ ] Renders correctly at 1280px, 1440px, and 1920px
- [ ] npm test and npm run type-check pass
- [ ] **Phase summary written and confirmed by Jo before Phase 7 begins**

### Phase 7: E2E + Polish
- [ ] All Playwright E2E tests pass
- [ ] Green River full demo flow works end to end
- [ ] All pages keyboard-navigable
- [ ] All filter dropdowns have correct aria-labels
- [ ] Production build passes (`npm run build`) with zero errors
- [ ] Green River query verified in Vercel production (not just local)
- [ ] Layout verified at 1280px, 1440px, 1920px in production (not just local)
- [ ] Below 1280px: "best viewed on desktop" message appears, nothing breaks
- [ ] **Final phase summary written and confirmed by Jo — project ready for demo**

---

## 🔵 TESTING COMMANDS

```bash
# Unit tests
npm test

# Unit tests watch mode
npm test -- --watch

# Type check
npm run type-check

# E2E tests (Playwright)
npx playwright test

# E2E tests with UI
npx playwright test --ui

# Single E2E test
npx playwright test green-river.spec.ts

# Production build check
npm run build
```

---

## 🔵 ERROR HANDLING PATTERNS

### Supabase query pattern (copy this every time)
```typescript
// lib/supabase.ts
export async function getClusters(filters: FilterState): Promise<ClusterResult> {
  try {
    const { data, error } = await supabase
      .from('clusters')
      .select('*')
      .eq('state', filters.state)
    
    if (error) throw error
    if (!data || data.length === 0) return { clusters: [], total: 0 }
    
    return { clusters: data, total: data.length }
  } catch (err) {
    console.error('[getClusters]', err)
    return { clusters: [], total: 0, error: 'Failed to load clusters' }
  }
}
```

### Component loading/error/empty pattern (copy this every time)
```tsx
// Any data-fetching component
if (loading) return <LoadingState />
if (error)   return <ErrorState message={error} onRetry={refetch} />
if (!data || data.length === 0) return <EmptyState filters={filters} />
return <RealContent data={data} />
```

### Environment variable validation (add to `lib/supabase.ts` top)
```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
if (!supabaseKey) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
```

---

## 🔵 DATA INTEGRITY CHECKS

Add these assertions to the data loader (Manny) and to integration tests (Jo):

```typescript
// After loading clusters, verify:
assert(cluster.total_cases > 0,         'Cluster has 0 cases — invalid')
assert(cluster.solve_rate >= 0,         'Solve rate below 0 — invalid')
assert(cluster.solve_rate <= 1,         'Solve rate above 100% — invalid')
assert(cluster.county_fips !== null,    'Null FIPS in cluster result')
assert(cluster.state_reporting_rate,    'Missing reliability badge data')

// Green River regression:
const greenRiver = await getClusters({ state:'WA', sex:'F', weapon:80, years:[1980,2000] })
assert(greenRiver.total === 128, `Green River: expected 128, got ${greenRiver.total}`)
```

---

## 🔵 PERFORMANCE BUDGET ENFORCEMENT

```typescript
// Wrap cluster query in a performance check during development
const start = performance.now()
const result = await getClusters(filters)
const duration = performance.now() - start

if (duration > 2000) {
  console.warn(`[PERF] Cluster query took ${duration.toFixed(0)}ms — budget is 2000ms`)
}
```

---

## 🔵 MOCK DATA RULES (pre-Manny)

While building against mock data:
- [ ] All mock data lives in `lib/mock-data.ts` — never inline in components
- [ ] Mock data must match the exact TypeScript types in `lib/types.ts`
- [ ] Every `lib/supabase.ts` function has a `// TODO: swap for real Supabase call` comment
- [ ] Mock clusters must include: King County WA (52 cases, 29% solved), Pierce County WA (18 cases), DC (7,108 cases, 34.2% solved)
- [ ] Mock state reliability must match `State_Reporting_Rates_2022.xlsx` values exactly — no invented numbers
- [ ] Never ship mock data to production — add `if (process.env.NODE_ENV === 'production')` guard

**Hard stop before swapping to real Supabase:**
- [ ] Manny has confirmed table names + column names
- [ ] Supabase URL + anon key received from Manny
- [ ] Green River smoke test passes on real data (128 cases)

---

## WHEN TO STOP AND ASK JO

Stop immediately and ask before:
- Changing any locked design decision (color, font, layout, nav label)
- Adding a new dependency not in the tech stack
- Changing the cluster algorithm or solve rate definition
- Merging anything to `main`
- Adding a new route not in the route table
- Changing how filters work (adding, removing, or renaming any filter)
- Using mock/dummy data in a component that should have real data
