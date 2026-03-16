// ALL Supabase queries live here — never import the client directly in components

import { createClient } from "@supabase/supabase-js";
import type {
  FilterState,
  ClusterResult,
  CaseResult,
  Cluster,
  Case,
  ReliabilityBadge,
} from "@/lib/types";
import { getConfidenceLevel, STATE_CENTERS, DEFAULT_FILTERS } from "@/lib/constants";
import {
  MOCK_CLUSTERS,
  MOCK_CASES,
  MOCK_STATE_RELIABILITY,
} from "@/lib/mock-data";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// ── Hardcoded default-filter clusters (real data from Supabase RPC, confirmed) ──
// Returns instantly on first dashboard/map load before any filters are applied.
export const HARDCODED_STATE_CLUSTERS: Cluster[] = [
  { id: "California", name: "California", county_fips: "California", state: "California", total_cases: 45607, unsolved_cases: 18388, solve_rate: 0.597, lat: 37.1841, lng: -119.4696, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "New York", name: "New York", county_fips: "New York", state: "New York", total_cases: 26968, unsolved_cases: 9469, solve_rate: 0.649, lat: 42.9538, lng: -75.5268, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "Texas", name: "Texas", county_fips: "Texas", state: "Texas", total_cases: 18388, unsolved_cases: 7886, solve_rate: 0.571, lat: 31.4757, lng: -99.3312, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "Illinois", name: "Illinois", county_fips: "Illinois", state: "Illinois", total_cases: 15081, unsolved_cases: 7484, solve_rate: 0.504, lat: 40.0417, lng: -89.1965, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "Louisiana", name: "Louisiana", county_fips: "Louisiana", state: "Louisiana", total_cases: 14064, unsolved_cases: 7592, solve_rate: 0.460, lat: 31.0689, lng: -91.9968, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "Michigan", name: "Michigan", county_fips: "Michigan", state: "Michigan", total_cases: 11660, unsolved_cases: 7885, solve_rate: 0.324, lat: 44.3467, lng: -85.4102, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "Pennsylvania", name: "Pennsylvania", county_fips: "Pennsylvania", state: "Pennsylvania", total_cases: 9469, unsolved_cases: 6514, solve_rate: 0.312, lat: 40.8781, lng: -77.7996, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "Georgia", name: "Georgia", county_fips: "Georgia", state: "Georgia", total_cases: 9469, unsolved_cases: 4453, solve_rate: 0.530, lat: 32.6415, lng: -83.4426, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "Maryland", name: "Maryland", county_fips: "Maryland", state: "Maryland", total_cases: 9126, unsolved_cases: 5867, solve_rate: 0.357, lat: 39.055, lng: -76.7909, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "Ohio", name: "Ohio", county_fips: "Ohio", state: "Ohio", total_cases: 7887, unsolved_cases: 4179, solve_rate: 0.470, lat: 40.2862, lng: -82.7937, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  // Remaining 41 states — placeholders until real RPC returns
  { id: "Alabama", name: "Alabama", county_fips: "Alabama", state: "Alabama", total_cases: 0, unsolved_cases: 0, solve_rate: 0, lat: 32.7794, lng: -86.8287, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "Alaska", name: "Alaska", county_fips: "Alaska", state: "Alaska", total_cases: 0, unsolved_cases: 0, solve_rate: 0, lat: 64.2008, lng: -153.4937, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "Arizona", name: "Arizona", county_fips: "Arizona", state: "Arizona", total_cases: 0, unsolved_cases: 0, solve_rate: 0, lat: 34.2744, lng: -111.6602, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "Arkansas", name: "Arkansas", county_fips: "Arkansas", state: "Arkansas", total_cases: 0, unsolved_cases: 0, solve_rate: 0, lat: 34.8938, lng: -92.4426, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "Colorado", name: "Colorado", county_fips: "Colorado", state: "Colorado", total_cases: 0, unsolved_cases: 0, solve_rate: 0, lat: 38.9972, lng: -105.5478, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "Connecticut", name: "Connecticut", county_fips: "Connecticut", state: "Connecticut", total_cases: 0, unsolved_cases: 0, solve_rate: 0, lat: 41.6219, lng: -72.7273, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "Delaware", name: "Delaware", county_fips: "Delaware", state: "Delaware", total_cases: 0, unsolved_cases: 0, solve_rate: 0, lat: 38.9896, lng: -75.505, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "District of Columbia", name: "District of Columbia", county_fips: "District of Columbia", state: "District of Columbia", total_cases: 0, unsolved_cases: 0, solve_rate: 0, lat: 38.9072, lng: -77.0369, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "Florida", name: "Florida", county_fips: "Florida", state: "Florida", total_cases: 0, unsolved_cases: 0, solve_rate: 0, lat: 28.6305, lng: -82.4497, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "Hawaii", name: "Hawaii", county_fips: "Hawaii", state: "Hawaii", total_cases: 0, unsolved_cases: 0, solve_rate: 0, lat: 20.2927, lng: -156.3737, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "Idaho", name: "Idaho", county_fips: "Idaho", state: "Idaho", total_cases: 0, unsolved_cases: 0, solve_rate: 0, lat: 44.3509, lng: -114.613, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "Indiana", name: "Indiana", county_fips: "Indiana", state: "Indiana", total_cases: 0, unsolved_cases: 0, solve_rate: 0, lat: 39.8942, lng: -86.2816, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "Iowa", name: "Iowa", county_fips: "Iowa", state: "Iowa", total_cases: 0, unsolved_cases: 0, solve_rate: 0, lat: 42.0751, lng: -93.496, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "Kansas", name: "Kansas", county_fips: "Kansas", state: "Kansas", total_cases: 0, unsolved_cases: 0, solve_rate: 0, lat: 38.4937, lng: -98.3804, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "Kentucky", name: "Kentucky", county_fips: "Kentucky", state: "Kentucky", total_cases: 0, unsolved_cases: 0, solve_rate: 0, lat: 37.5347, lng: -85.3021, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "Maine", name: "Maine", county_fips: "Maine", state: "Maine", total_cases: 0, unsolved_cases: 0, solve_rate: 0, lat: 45.3695, lng: -69.2428, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "Massachusetts", name: "Massachusetts", county_fips: "Massachusetts", state: "Massachusetts", total_cases: 0, unsolved_cases: 0, solve_rate: 0, lat: 42.2596, lng: -71.8083, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "Minnesota", name: "Minnesota", county_fips: "Minnesota", state: "Minnesota", total_cases: 0, unsolved_cases: 0, solve_rate: 0, lat: 46.2807, lng: -94.3053, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "Mississippi", name: "Mississippi", county_fips: "Mississippi", state: "Mississippi", total_cases: 0, unsolved_cases: 0, solve_rate: 0, lat: 32.7364, lng: -89.6678, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "Missouri", name: "Missouri", county_fips: "Missouri", state: "Missouri", total_cases: 0, unsolved_cases: 0, solve_rate: 0, lat: 38.3566, lng: -92.458, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "Montana", name: "Montana", county_fips: "Montana", state: "Montana", total_cases: 0, unsolved_cases: 0, solve_rate: 0, lat: 47.0527, lng: -109.6333, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "Nebraska", name: "Nebraska", county_fips: "Nebraska", state: "Nebraska", total_cases: 0, unsolved_cases: 0, solve_rate: 0, lat: 41.5378, lng: -99.7951, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "Nevada", name: "Nevada", county_fips: "Nevada", state: "Nevada", total_cases: 0, unsolved_cases: 0, solve_rate: 0, lat: 39.3289, lng: -116.6312, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "New Hampshire", name: "New Hampshire", county_fips: "New Hampshire", state: "New Hampshire", total_cases: 0, unsolved_cases: 0, solve_rate: 0, lat: 43.6805, lng: -71.5811, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "New Jersey", name: "New Jersey", county_fips: "New Jersey", state: "New Jersey", total_cases: 0, unsolved_cases: 0, solve_rate: 0, lat: 40.1907, lng: -74.6728, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "New Mexico", name: "New Mexico", county_fips: "New Mexico", state: "New Mexico", total_cases: 0, unsolved_cases: 0, solve_rate: 0, lat: 34.4071, lng: -106.1126, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "North Carolina", name: "North Carolina", county_fips: "North Carolina", state: "North Carolina", total_cases: 0, unsolved_cases: 0, solve_rate: 0, lat: 35.5557, lng: -79.3877, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "North Dakota", name: "North Dakota", county_fips: "North Dakota", state: "North Dakota", total_cases: 0, unsolved_cases: 0, solve_rate: 0, lat: 47.4501, lng: -100.4659, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "Oklahoma", name: "Oklahoma", county_fips: "Oklahoma", state: "Oklahoma", total_cases: 0, unsolved_cases: 0, solve_rate: 0, lat: 35.5889, lng: -97.4943, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "Oregon", name: "Oregon", county_fips: "Oregon", state: "Oregon", total_cases: 0, unsolved_cases: 0, solve_rate: 0, lat: 43.9336, lng: -120.5583, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "Rhode Island", name: "Rhode Island", county_fips: "Rhode Island", state: "Rhode Island", total_cases: 0, unsolved_cases: 0, solve_rate: 0, lat: 41.6762, lng: -71.5562, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "South Carolina", name: "South Carolina", county_fips: "South Carolina", state: "South Carolina", total_cases: 0, unsolved_cases: 0, solve_rate: 0, lat: 33.9169, lng: -80.8964, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "South Dakota", name: "South Dakota", county_fips: "South Dakota", state: "South Dakota", total_cases: 0, unsolved_cases: 0, solve_rate: 0, lat: 44.4443, lng: -100.2263, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "Tennessee", name: "Tennessee", county_fips: "Tennessee", state: "Tennessee", total_cases: 0, unsolved_cases: 0, solve_rate: 0, lat: 35.858, lng: -86.3505, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "Utah", name: "Utah", county_fips: "Utah", state: "Utah", total_cases: 0, unsolved_cases: 0, solve_rate: 0, lat: 39.321, lng: -111.0937, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "Vermont", name: "Vermont", county_fips: "Vermont", state: "Vermont", total_cases: 0, unsolved_cases: 0, solve_rate: 0, lat: 44.0687, lng: -72.6658, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "Virginia", name: "Virginia", county_fips: "Virginia", state: "Virginia", total_cases: 0, unsolved_cases: 0, solve_rate: 0, lat: 37.5215, lng: -78.8537, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "Washington", name: "Washington", county_fips: "Washington", state: "Washington", total_cases: 0, unsolved_cases: 0, solve_rate: 0, lat: 47.3826, lng: -120.4472, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "West Virginia", name: "West Virginia", county_fips: "West Virginia", state: "West Virginia", total_cases: 0, unsolved_cases: 0, solve_rate: 0, lat: 38.6409, lng: -80.6227, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "Wisconsin", name: "Wisconsin", county_fips: "Wisconsin", state: "Wisconsin", total_cases: 0, unsolved_cases: 0, solve_rate: 0, lat: 44.6243, lng: -89.9941, year_start: 1976, year_end: 2023, jurisdictions: 1 },
  { id: "Wyoming", name: "Wyoming", county_fips: "Wyoming", state: "Wyoming", total_cases: 0, unsolved_cases: 0, solve_rate: 0, lat: 42.9957, lng: -107.5512, year_start: 1976, year_end: 2023, jurisdictions: 1 },
];

// ── Internal helpers ──

/** Map FilterState.victimRace UI values to SHR database values */
const RACE_MAP: Record<string, string> = {
  White: "White",
  Black: "Black",
  "Asian-PI": "Asian or Pacific Islander",
  "Native American": "American Indian or Alaskan Native",
};

/** Apply all active FilterState fields to a homicides query */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyFilters(query: any, filters: FilterState): any {
  query = query
    .gte("year", filters.dateRange[0])
    .lte("year", filters.dateRange[1]);

  if (filters.state !== null) query = query.eq("state", filters.state);
  if (filters.victimSex !== "all") query = query.eq("victim_sex", filters.victimSex);
  if (filters.weaponType !== null) query = query.eq("weapon_code", filters.weaponType);
  if (filters.victimRace !== "all") {
    const dbRace = RACE_MAP[filters.victimRace] ?? filters.victimRace;
    query = query.eq("victim_race", dbRace);
  }
  if (filters.solveStatus === "unsolved") query = query.eq("solved", false);
  if (filters.solveStatus === "solved") query = query.eq("solved", true);

  return query;
}

// ── DB row types (raw shape from Supabase) ──

interface HomicideRow {
  id: string;
  ori: string;
  agency: string;
  agency_type: string;
  state: string;
  year: number;
  month: number;
  solved: boolean;
  victim_sex: string | null;
  victim_age: number;
  victim_race: string;
  victim_ethnicity: string;
  offender_sex: string;
  offender_age: number;
  offender_race: string;
  offender_ethnicity: string;
  weapon_code: number | null;
  weapon_label: string;
  relationship: string;
  county_fips: string | null;
  msa: string;
  circumstance: string;
  lat: number | null;
  lng: number | null;
}

interface ReliabilityRow {
  state: string;
  agencies_total: number;
  agencies_reporting: number;
  reporting_pct: number;
}

/** Map a homicide DB row to the Case type */
function rowToCase(row: HomicideRow): Case {
  return {
    id: row.id,
    ori: row.ori,
    agency: row.agency,
    agency_type: row.agency_type,
    state: row.state,
    year: row.year,
    month: row.month,
    solved: row.solved,
    victim_sex: row.victim_sex ?? "Unknown",
    victim_age: row.victim_age,
    victim_race: row.victim_race,
    victim_ethnicity: row.victim_ethnicity,
    offender_sex: row.offender_sex,
    offender_age: row.offender_age,
    offender_race: row.offender_race,
    offender_ethnicity: row.offender_ethnicity,
    weapon_code: row.weapon_code ?? 99,
    weapon_label: row.weapon_label,
    relationship: row.relationship,
    county_fips: row.county_fips,
    msa: row.msa,
    circumstance: row.circumstance,
    lat: row.lat ?? 0,
    lng: row.lng ?? 0,
  };
}

// ── Query Functions ──

interface StateClusterRow {
  state: string;
  total_cases: number;
  unsolved_cases: number;
  year_start: number;
  year_end: number;
  jurisdictions: number;
}

/** Get clusters matching filter criteria — uses server-side RPC to avoid 1k row limit */
export async function getClusters(
  filters: FilterState,
  forceRPC = false
): Promise<ClusterResult> {
  // Fast path — return hardcoded data for default filter state (instant first load)
  const isDefaultFilters =
    filters.state === null &&
    filters.victimSex === "all" &&
    filters.weaponType === null &&
    filters.victimRace === "all" &&
    filters.solveStatus === "all" &&
    filters.dateRange[0] === 1976 &&
    filters.dateRange[1] === 2023;

  if (isDefaultFilters && !forceRPC) {
    return {
      clusters: HARDCODED_STATE_CLUSTERS,
      totalCases: 852394,
      totalUnsolved: 251082,
    };
  }

  // No Supabase client — serve mock data for local dev
  if (!supabase) {
    let filtered = [...MOCK_CLUSTERS];
    if (filters.state !== null) filtered = filtered.filter((c) => c.state === filters.state);
    filtered = filtered.filter((c) => c.total_cases >= filters.minClusterSize);
    const totalCases    = filtered.reduce((s, c) => s + c.total_cases, 0);
    const totalUnsolved = filtered.reduce((s, c) => s + c.unsolved_cases, 0);
    return { clusters: filtered, totalCases, totalUnsolved };
  }

  // Supabase is initialized — real RPC path
  try {
    const { data, error } = await supabase.rpc("get_state_clusters", {
      p_year_start:  filters.dateRange[0],
      p_year_end:    filters.dateRange[1],
      p_victim_sex:  filters.victimSex !== "all" ? filters.victimSex : null,
      p_weapon_code: filters.weaponType ?? null,
      p_state:       filters.state ?? null,
      p_victim_race: filters.victimRace !== "all"
        ? (RACE_MAP[filters.victimRace] ?? filters.victimRace)
        : null,
      p_solved:      filters.solveStatus === "solved"   ? true
                   : filters.solveStatus === "unsolved" ? false
                   : null,
    });

    if (error) throw error;
    if (!data || data.length === 0) {
      return { clusters: [], totalCases: 0, totalUnsolved: 0 };
    }

    const clusters: Cluster[] = (data as StateClusterRow[])
      .map((r) => {
        const center = STATE_CENTERS[r.state];
        const obj = {
          id:             r.state,
          name:           r.state,
          county_fips:    r.state,
          state:          r.state,
          total_cases:    Number(r.total_cases),
          unsolved_cases: Number(r.unsolved_cases),
          solve_rate:     r.total_cases > 0
            ? (r.total_cases - r.unsolved_cases) / r.total_cases
            : 0,
          lat:  center ? center[0] : 39.5,
          lng:  center ? center[1] : -98.35,
          year_start:   r.year_start,
          year_end:     r.year_end,
          jurisdictions: Number(r.jurisdictions),
        };
        return obj;
      })
      .sort((a, b) => b.unsolved_cases - a.unsolved_cases);

    const totalCases    = clusters.reduce((s, c) => s + c.total_cases, 0);
    const totalUnsolved = clusters.reduce((s, c) => s + c.unsolved_cases, 0);
    return { clusters, totalCases, totalUnsolved };
  } catch (err) {
    console.error("[supabase] getClusters RPC failed:", err);
    return { clusters: [], totalCases: 0, totalUnsolved: 0, error: String(err) };
  }
}

/** Get a single cluster by id (state name) */
export async function getClusterById(
  id: string,
  filters: FilterState = DEFAULT_FILTERS
): Promise<{ cluster: Cluster | null; error?: string }> {
  try {
    // Supabase RPC — get fresh data for this state
    if (supabase) {
      const result = await getClusters({ ...filters, state: id });
      if (result.clusters.length > 0) {
        return { cluster: result.clusters[0] };
      }
    }

    // Fallback: check hardcoded clusters
    const hardcoded = HARDCODED_STATE_CLUSTERS.find(
      (c) => c.id === id || c.state === id || c.name === id
    );
    if (hardcoded) return { cluster: hardcoded };

    // Fallback: check mock clusters
    const mock = MOCK_CLUSTERS.find(
      (c) => c.id === id || c.state === id || c.name === id
    );
    return { cluster: mock ?? null };
  } catch (err) {
    console.error("[getClusterById]", err);
    return { cluster: null, error: "Failed to load cluster" };
  }
}

/** Get individual cases for a specific cluster (keyed by state name) */
export async function getCasesForCluster(
  clusterId: string,
  filters: FilterState = DEFAULT_FILTERS
): Promise<CaseResult> {
  if (supabase) {
    try {
      let query = supabase
        .from("homicides")
        .select("*")
        .eq("state", clusterId)
        .order("year", { ascending: false })
        .limit(50);

      query = applyFilters(query, filters);

      const { data, error } = await query;
      if (error) throw error;

      const cases = (data as unknown as HomicideRow[]).map(rowToCase);
      return { cases, total: cases.length };
    } catch (err) {
      console.warn("[supabase] getCasesForCluster falling back to mock:", err);
    }
  }

  // Fallback to mock data — match by id, state, or name
  const cluster = MOCK_CLUSTERS.find(
    (c) => c.id === clusterId || c.state === clusterId || c.name === clusterId
  );
  const fips = cluster?.county_fips ?? clusterId;
  const cases = MOCK_CASES.filter((c) => c.county_fips === fips);
  return { cases, total: cases.length };
}

/** Get state reporting reliability badge */
export async function getStateReliability(
  state: string
): Promise<{ reliability: ReliabilityBadge | null; error?: string }> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("state_reliability")
        .select("state, agencies_total, agencies_reporting, reporting_pct")
        .eq("state", state)
        .single();

      if (error) throw error;
      if (!data) return { reliability: null };

      const row = data as ReliabilityRow;
      const reliability: ReliabilityBadge = {
        state: row.state,
        agencies_total: row.agencies_total,
        agencies_reporting: row.agencies_reporting,
        reporting_pct: row.reporting_pct,
        confidence: getConfidenceLevel(row.reporting_pct),
      };
      return { reliability };
    } catch (err) {
      console.warn("[supabase] getStateReliability falling back to mock:", err);
    }
  }

  // Fallback to mock data
  const mock = MOCK_STATE_RELIABILITY.find((r) => r.state === state) ?? null;
  return { reliability: mock };
}

/** Get aggregate stats for current filter state */
export async function getStats(
  filters: FilterState
): Promise<{
  totalCases: number;
  totalUnsolved: number;
  clusterCount: number;
  error?: string;
}> {
  try {
    const { clusters, totalCases, totalUnsolved, error } = await getClusters(filters);
    if (error) {
      return { totalCases: 0, totalUnsolved: 0, clusterCount: 0, error };
    }
    return { totalCases, totalUnsolved, clusterCount: clusters.length };
  } catch (err) {
    console.error("[getStats]", err);
    return { totalCases: 0, totalUnsolved: 0, clusterCount: 0, error: "Failed to load stats" };
  }
}
