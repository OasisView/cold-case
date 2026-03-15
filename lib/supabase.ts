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
import { getConfidenceLevel, STATE_BOUNDS, DEFAULT_FILTERS } from "@/lib/constants";
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
  filters: FilterState
): Promise<ClusterResult> {
  if (supabase) {
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
        .filter((r) => r.total_cases >= filters.minClusterSize)
        .map((r) => {
          const bounds = STATE_BOUNDS[r.state];
          return {
            id:             r.state,
            name:           r.state,
            county_fips:    r.state,
            state:          r.state,
            total_cases:    Number(r.total_cases),
            unsolved_cases: Number(r.unsolved_cases),
            solve_rate:     r.total_cases > 0
              ? (r.total_cases - r.unsolved_cases) / r.total_cases
              : 0,
            lat:  bounds ? (bounds[1] + bounds[3]) / 2 : 39.5,
            lng:  bounds ? (bounds[0] + bounds[2]) / 2 : -98.35,
            year_start:   r.year_start,
            year_end:     r.year_end,
            jurisdictions: Number(r.jurisdictions),
          };
        })
        .sort((a, b) => b.unsolved_cases - a.unsolved_cases);

      const totalCases    = clusters.reduce((s, c) => s + c.total_cases, 0);
      const totalUnsolved = clusters.reduce((s, c) => s + c.unsolved_cases, 0);
      return { clusters, totalCases, totalUnsolved };
    } catch (err) {
      console.warn("[supabase] getClusters falling back to mock:", err);
    }
  }

  // Fallback to mock data
  let filtered = [...MOCK_CLUSTERS];
  if (filters.state !== null) filtered = filtered.filter((c) => c.state === filters.state);
  filtered = filtered.filter((c) => c.total_cases >= filters.minClusterSize);
  const totalCases    = filtered.reduce((s, c) => s + c.total_cases, 0);
  const totalUnsolved = filtered.reduce((s, c) => s + c.unsolved_cases, 0);
  return { clusters: filtered, totalCases, totalUnsolved };
}

/** Get a single cluster by id (county_fips or mock id) */
export async function getClusterById(
  id: string,
  filters: FilterState = DEFAULT_FILTERS
): Promise<{ cluster: Cluster | null; error?: string }> {
  try {
    const result = await getClusters({ ...filters, minClusterSize: 1 });
    const cluster = result.clusters.find((c) => c.id === id) ?? null;
    return { cluster };
  } catch (err) {
    console.error("[getClusterById]", err);
    return { cluster: null, error: "Failed to load cluster" };
  }
}

/** Get individual cases for a specific cluster (keyed by county_fips) */
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
        .order("year", { ascending: false });

      query = applyFilters(query, filters);

      const { data, error } = await query;
      if (error) throw error;

      const cases = (data as unknown as HomicideRow[]).map(rowToCase);
      return { cases, total: cases.length };
    } catch (err) {
      console.warn("[supabase] getCasesForCluster falling back to mock:", err);
    }
  }

  // Fallback to mock data
  const cluster = MOCK_CLUSTERS.find((c) => c.id === clusterId);
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
