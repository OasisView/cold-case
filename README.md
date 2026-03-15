# Cold Case Cluster Finder

The FBI's Supplemental Homicide Reports contain nearly 900,000 records of unsolved homicides dating back to 1976, but that data has never been easy to explore geographically. Patterns that cross county or state lines are invisible to any single jurisdiction. I built the full frontend for a data journalism and law enforcement intelligence tool that clusters unsolved cases on an interactive map, so investigators and journalists can surface those patterns for the first time.

Pursuit Fellowship Capstone · March 2026

## What I Built

- Interactive Mapbox cluster map with fitBounds animations
- Custom filter UI with drag-resizable case detail panel
- Case file white document card with full case breakdown
- Insights and Methodology pages contextualizing the data
- Landing page with Suspense boundary
- 189 passing Playwright E2E tests, type-check clean across all 7 build phases

## Data Sources

- **SHR65_23.csv** — 894,636 records (1976–2023) from the Murder Accountability Project
- **UCR65_23a.sav** — FBI agency-level clearance rates, ORI to FIPS mapping
- **State_Reporting_Rates_2022.xlsx** — Data confidence badges by state

## Tech Stack

- **Frontend**: Next.js 15 · TypeScript · Tailwind CSS · Zustand · Mapbox GL JS
- **Database**: Supabase (PostgreSQL + PostGIS)
- **Deployment**: Vercel

## Team

- Jonel Richardson (frontend)
- Manny (backend: data loader, Supabase schema, cluster queries, geocoding)

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

## Live Demo

[cold-case-flame.vercel.app](https://cold-case-flame.vercel.app/)

## Repo

[OasisView/cold-case](https://github.com/OasisView/cold-case)
