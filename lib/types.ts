// Shared TypeScript types — Cluster, Case, FilterState, ReliabilityBadge, etc.

// ── Single homicide record (matches Supabase `cases` table) ──
export interface Case {
  id: string;
  ori: string;
  agency: string;
  agency_type: string;
  state: string;
  year: number;
  month: number;
  solved: boolean;
  victim_sex: string;
  victim_age: number;
  victim_race: string;
  victim_ethnicity: string;
  offender_sex: string;
  offender_age: number;
  offender_race: string;
  offender_ethnicity: string;
  weapon_code: number;
  weapon_label: string;
  relationship: string;
  county_fips: string | null;
  msa: string;
  circumstance: string;
  lat: number;
  lng: number;
}

// ── Geographic cluster of cases (aggregated by county) ──
export interface Cluster {
  id: string;
  name: string; // e.g. "King County, WA"
  county_fips: string;
  state: string;
  total_cases: number;
  unsolved_cases: number;
  solve_rate: number; // 0–1
  lat: number;
  lng: number;
  year_start: number;
  year_end: number;
  jurisdictions: number; // unique agency count
}

// ── Agency record (matches Supabase `agencies` table) ──
export interface Agency {
  ori: string;
  name: string;
  type: string;
  state: string;
  county_fips: string | null;
  lat: number;
  lng: number;
}

// ── Filter state shared across pages ──
export interface FilterState {
  dateRange: [number, number];
  victimSex: "all" | "Female" | "Male";
  weaponType: number | null;
  state: string | null;
  victimRace: "all" | "White" | "Black" | "Asian-PI" | "Native American";
  solveStatus: "all" | "unsolved" | "solved";
  minClusterSize: number;
}

// ── State reporting confidence badge ──
export interface ReliabilityBadge {
  state: string;
  agencies_total: number;
  agencies_reporting: number;
  reporting_pct: number;
  confidence: "low" | "medium" | "high";
}

// ── Query return types ──
export interface ClusterResult {
  clusters: Cluster[];
  totalCases: number;
  totalUnsolved: number;
  error?: string;
  _debugSample?: string; // TEMP — remove after column name investigation
}

export interface CaseResult {
  cases: Case[];
  total: number;
  error?: string;
}

// ── Derived query params from FilterState ──
export interface QueryParams {
  year_start: number;
  year_end: number;
  victim_sex?: string;
  weapon_code?: number;
  state?: string;
  victim_race?: string;
  solved?: boolean;
  min_cluster_size: number;
}

// ── Weapon code entry ──
export interface WeaponCode {
  code: number;
  label: string;
  shr_label: string; // SHR65_23 raw string
}
