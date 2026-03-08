# Cold Case Cluster Finder

A geographic intelligence tool that surfaces unsolved homicide clusters hidden across jurisdictional boundaries.

**Pursuit Fellowship Capstone · March 2026**

## Tech Stack
- **Frontend:** Next.js 15, TypeScript, Tailwind CSS
- **Map:** Mapbox GL JS
- **State Management:** Zustand
- **Database:** Supabase (PostgreSQL + PostGIS)
- **Deployment:** Vercel

## Team
- **Manny** — Backend (data loader, Supabase schema, cluster queries, geocoding)
- **Jonel** — Frontend (map component, filter UI, cluster visualization, case file panel)

## Getting Started
```bash
git clone https://github.com/OasisView/cold-case.git
cd cold-case
npm install
```

Create a `.env.local` file in the root:
```
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here
```

Then run the dev server:
```bash
npm run dev
```

Open http://localhost:3000

## Data Sources
- **SHR65_23.csv** — 894,636 records (1976–2023) from Murder Accountability Project
- **UCR65_23a.sav** — FBI agency-level clearance rates, ORI→FIPS mapping
- **State_Reporting_Rates_2022.xlsx** — Data confidence badges by state

## Key Rule
All Supabase queries go through `lib/supabase.ts`. Never import the client directly in components.