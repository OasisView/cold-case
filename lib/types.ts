// Shared TypeScript types for Cold Case Cluster Finder
// These match the Supabase schema defined in CLAUDE.md

export interface Homicide {
  id: string
  ori: string
  agency: string
  agency_type: string
  state: string
  year: number
  month: number | null
  solved: boolean
  victim_sex: string
  victim_age: number | null
  victim_race: string
  victim_ethnicity: string
  offender_sex: string
  offender_age: number | null
  offender_race: string
  offender_ethnicity: string
  weapon_code: number
  weapon_label: string
  relationship: string
  victim_count: number
  offender_count: number
  county_fips: string | null
  msa: string
  circumstance: string
  source: string
  lat: number | null
  lng: number | null
}

export interface Agency {
  ori: string
  name: string
  type: string
  state: string
  county_fips: string | null
  lat: number | null
  lng: number | null
}

export interface StateReliability {
  state: string
  agencies_total: number
  agencies_reporting: number
  reporting_pct: number
}

// A geographic cluster of unsolved homicides
export interface Cluster {
  id: string           // county_fips or composite key
  county_fips: string
  county_name: string
  state: string
  total_cases: number
  unsolved_cases: number
  solve_rate: number   // 0.0–1.0
  lat: number
  lng: number
  top_weapon: string
  year_range: [number, number]
  reliability: StateReliability | null
}

// Filter state — shared across all pages via Zustand
export interface FilterState {
  state: string | null
  victim_sex: string | null
  victim_race: string | null
  weapon_code: number | null
  year_start: number
  year_end: number
  cluster_threshold: number
}

// Return type from getClusters()
export interface ClusterResult {
  clusters: Cluster[]
  total_cases: number
  total_unsolved: number
  overall_solve_rate: number
}
