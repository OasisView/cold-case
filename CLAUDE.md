# Cold Case Cluster Finder

## Project Overview
Geographic intelligence tool that surfaces unsolved homicide clusters across jurisdictional boundaries.
Pursuit Fellowship Capstone — Due March 18, 2026.

## Team
- Manny: Backend (data loader, Supabase schema, cluster queries, geocoding)
- Jonel: Frontend (map, filters, cluster visualization, case file panel)

## Tech Stack
- Next.js 15, TypeScript, Tailwind CSS
- Mapbox GL JS (dark basemap)
- Zustand (state management)
- Supabase (PostgreSQL + PostGIS)
- Vercel (deployment)

## Critical Rules
- ALL Supabase queries go through `lib/supabase.ts`. Never import the client directly in components.
- Data files live in `data/` (git-ignored). Never commit raw CSVs.
- Environment variables are in `.env.local` (git-ignored). Never hardcode keys.
- The loader script in `scripts/` processes raw data and pushes to Supabase.

## Data Sources
- `data/SHR65_23.csv` — 894,636 records (1976–2023). Primary dataset.
- `data/UCR65_23a.sav` — FBI agency clearance rates, ORI→FIPS mapping.
- `data/State_Reporting_Rates_2022.csv` — State reporting confidence badges.
- `data/expanded-homicide-2024/` — National trend context only.

## Data Quality Fixes Required
- "Rhodes Island" typo → "Rhode Island" (1,211 records)
- 252 unmatched ORIs → set county_fips to NULL
- CNTYFIPS is text ('King, WA') not numeric — join to Census FIPS table
- Low-reporting states: MS (24%), FL (48%), IA (59%) — flag in UI
- Weapon string mapping: SHR65_23 uses longer strings than database.csv — normalize to numeric codes

## Weapon Code Mapping
- Handgun - pistol, revolver, etc → 12
- Rifle → 13
- Shotgun → 14
- Firearm, type not stated → 11
- Other gun → 15
- Knife or cutting instrument → 20
- Blunt object - hammer, club, etc → 30
- Personal weapons, includes beating → 40
- Fire → 65
- Narcotics or drugs, sleeping pills → 70
- Drowning → 75
- Strangulation - hanging → 80
- Asphyxiation - includes death by gas → 85
- Other or type unknown → 99

## Supabase Schema (Target)
### cases table
- id, ori, agency, agency_type, state, year, month
- solved (boolean), victim_sex, victim_age, victim_race, victim_ethnicity
- offender_sex, offender_age, offender_race, offender_ethnicity
- weapon_code (integer), weapon_label, relationship
- county_fips, msa, circumstance
- lat, lng (from geocoded agency)

### agencies table
- ori (primary key), name, type, state, county_fips, lat, lng

### state_confidence table
- state, agencies_total, agencies_reporting, reporting_pct

## Key Demo Patterns (Must Work)
1. Green River Killer: WA + Female + Strangulation + 1980–2000 → 128 cases, King County = 52
2. Racial Justice Gap: Black victim solve rate 73% (1980s) → 61.4% (2010s)
3. DC Collapse: 7,108 cases, 34.2% solve rate, 4,600+ unsolved

## Deployment Sequence
1. Create Supabase project, get connection string
2. Run loader locally, confirm Green River query works
3. Create Vercel project, add env vars BEFORE first deploy
4. Add Vercel URL to Supabase CORS settings BEFORE deploy
5. All queries through lib/supabase.ts — never direct imports

## Project Structure
```
cold-case/
├── app/              # Next.js pages and layouts
├── components/       # React components (Jonel)
├── lib/
│   └── supabase.ts   # Single Supabase client (THE rule)
├── scripts/
│   └── loader.py     # Data processing and Supabase loading (Manny)
├── data/             # Git-ignored raw data files
├── .env.local        # Git-ignored environment variables
└── CLAUDE.md         # This file
```

## Component Build Order
- `app/page.tsx` + `components/landing/BullseyeBackground.tsx` — Landing page (Phase 6). Full visual spec is in DESIGN.md under "Landing Page — Full Spec". This is not cosmetic — it is the first screen the audience sees on demo day.