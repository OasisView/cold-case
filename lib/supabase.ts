// ALL Supabase queries live here — never import the client directly in components
// Each function: try real Supabase → on error, console.warn + fall back to mock data

import { createClient } from "@supabase/supabase-js";
import type {
  FilterState,
  ClusterResult,
  CaseResult,
  Cluster,
  Case,
  ReliabilityBadge,
} from "@/lib/types";
import { getConfidenceLevel } from "@/lib/constants";
import { MOCK_CLUSTERS, MOCK_CASES, MOCK_STATE_RELIABILITY } from "@/lib/mock-data";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// ── Helpers ──

/** Filter mock clusters by state and minimum cluster size */
function matchesFilters(cluster: Cluster, filters: FilterState): boolean {
  if (filters.state !== null && cluster.state !== filters.state) {
    return false;
  }
  if (cluster.total_cases < filters.minClusterSize) {
    return false;
  }
  return true;
}

// ── DB row types (raw shape from Supabase) ──

interface HomicideRow {
  county_fips: string | null;
  state: string;
  solved: boolean;
  lat: number | null;
  lng: number | null;
  weapon_code: number | null;
  victim_sex: string | null;
  year: number;
  id: string;
  ori: string;
  agency: string;
  agency_type: string;
  month: number;
  victim_age: number;
  victim_race: string;
  victim_ethnicity: string;
  offender_sex: string;
  offender_age: number;
  offender_race: string;
  offender_ethnicity: string;
  weapon_label: string;
  relationship: string;
  msa: string;
  circumstance: string;
}

interface ReliabilityRow {
  state: string;
  agencies_total: number;
  agencies_reporting: number;
  reporting_pct: number;
}

/** Group homicide rows by county_fips into Cluster objects */
function groupIntoClusters(rows: HomicideRow[], minClusterSize: number): Cluster[] {
  const groups = new Map<
    string,
    {
      state: string;
      total: number;
      unsolved: number;
      lat: number | null;
      lng: number | null;
      yearMin: number;
      yearMax: number;
      oris: Set<string>;
    }
  >();

  for (const row of rows) {
    if (!row.county_fips) continue;
    const key = row.county_fips;
    let group = groups.get(key);
    if (!group) {
      group = {
        state: row.state,
        total: 0,
        unsolved: 0,
        lat: row.lat,
        lng: row.lng,
        yearMin: row.year,
        yearMax: row.year,
        oris: new Set<string>(),
      };
      groups.set(key, group);
    }
    group.total++;
    if (!row.solved) group.unsolved++;
    if (row.lat !== null && group.lat === null) group.lat = row.lat;
    if (row.lng !== null && group.lng === null) group.lng = row.lng;
    if (row.year < group.yearMin) group.yearMin = row.year;
    if (row.year > group.yearMax) group.yearMax = row.year;
    if (row.ori) group.oris.add(row.ori);
  }

  const clusters: Cluster[] = [];
  for (const [fips, g] of groups) {
    if (g.total < minClusterSize) continue;
    clusters.push({
      id: fips,
      name: fips,
      county_fips: fips,
      state: g.state,
      total_cases: g.total,
      unsolved_cases: g.unsolved,
      solve_rate: g.total > 0 ? (g.total - g.unsolved) / g.total : 0,
      lat: g.lat ?? 0,
      lng: g.lng ?? 0,
      year_start: g.yearMin,
      year_end: g.yearMax,
      jurisdictions: g.oris.size,
    });
  }

  return clusters;
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

/** Get clusters matching filter criteria */
export async function getClusters(
  filters: FilterState
): Promise<ClusterResult> {
  console.log('[supabase] getClusters called, supabase client:', supabase ? 'initialized' : 'NULL - env vars missing');
  if (supabase) {
    try {
      // TEMP DIAGNOSTIC — remove after fix
      const { data: sample, error: sampleError } = await supabase
        .from("homicides")
        .select("county_fips, state, victim_sex, weapon_code, year, solved")
        .limit(3);

      console.log("[supabase] sample rows:", JSON.stringify(sample));
      console.log("[supabase] sample error:", sampleError?.message);

      const debugSample = sampleError
        ? `SAMPLE ERROR: ${sampleError.message}`
        : `SAMPLE: ${JSON.stringify(sample)}`;

      const query = supabase
        .from("homicides")
        .select("county_fips, state, solved, lat, lng, weapon_code, victim_sex, year, ori");

      if (filters.state !== null) query.eq("state", filters.state);
      if (filters.victimSex !== "all") {
        query.eq("victim_sex", filters.victimSex === "Female" ? "F" : "M");
      }
      if (filters.weaponType !== null) query.eq("weapon_code", filters.weaponType);
      query.gte("year", filters.dateRange[0]).lte("year", filters.dateRange[1]);
      if (filters.solveStatus === "unsolved") query.eq("solved", false);
      if (filters.solveStatus === "solved") query.eq("solved", true);
      if (filters.victimRace !== "all") query.eq("victim_race", filters.victimRace);

      const { data, error } = await query;
      console.log('[supabase] query result:', { dataLength: data?.length, error: error?.message });

      if (error) throw error;
      if (!data || data.length === 0) {
        return { clusters: [], totalCases: 0, totalUnsolved: 0, _debugSample: debugSample };
      }

      const clusters = groupIntoClusters(
        data as unknown as HomicideRow[],
        filters.minClusterSize
      );

      const totalCases = clusters.reduce((sum, c) => sum + c.total_cases, 0);
      const totalUnsolved = clusters.reduce((sum, c) => sum + c.unsolved_cases, 0);

      return { clusters, totalCases, totalUnsolved, _debugSample: debugSample };
    } catch (err) {
      console.warn("[supabase] falling back to mock:", err);
    }
  }

  // Fallback to mock data
  try {
    const filtered = MOCK_CLUSTERS.filter((c) => matchesFilters(c, filters));
    const totalCases = filtered.reduce((sum, c) => sum + c.total_cases, 0);
    const totalUnsolved = filtered.reduce((sum, c) => sum + c.unsolved_cases, 0);
    return { clusters: filtered, totalCases, totalUnsolved };
  } catch (err) {
    console.error("[getClusters]", err);
    return { clusters: [], totalCases: 0, totalUnsolved: 0, error: "Failed to load clusters" };
  }
}

/** Get a single cluster by ID (county_fips) */
export async function getClusterById(
  id: string
): Promise<{ cluster: Cluster | null; error?: string }> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("homicides")
        .select("county_fips, state, solved, lat, lng, weapon_code, victim_sex, year, ori")
        .eq("county_fips", id);

      if (error) throw error;
      if (!data || data.length === 0) {
        // Fall through to mock
      } else {
        const clusters = groupIntoClusters(data as unknown as HomicideRow[], 1);
        const cluster = clusters.find((c) => c.id === id) ?? null;
        return { cluster };
      }
    } catch (err) {
      console.warn("[supabase] falling back to mock:", err);
    }
  }

  // Fallback to mock data
  try {
    const cluster = MOCK_CLUSTERS.find((c) => c.id === id) ?? null;
    return { cluster };
  } catch (err) {
    console.error("[getClusterById]", err);
    return { cluster: null, error: "Failed to load cluster" };
  }
}

/** Get individual cases for a specific cluster */
export async function getCasesForCluster(
  clusterId: string
): Promise<CaseResult> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("homicides")
        .select("*")
        .eq("county_fips", clusterId);

      if (error) throw error;
      if (!data || data.length === 0) {
        // Fall through to mock
      } else {
        const cases = (data as unknown as HomicideRow[]).map(rowToCase);
        return { cases, total: cases.length };
      }
    } catch (err) {
      console.warn("[supabase] falling back to mock:", err);
    }
  }

  // Fallback to mock data
  try {
    const cluster = MOCK_CLUSTERS.find((c) => c.id === clusterId);
    if (!cluster) {
      return { cases: [], total: 0 };
    }
    const cases = MOCK_CASES.filter((c) => c.county_fips === cluster.county_fips);
    return { cases, total: cases.length };
  } catch (err) {
    console.error("[getCasesForCluster]", err);
    return { cases: [], total: 0, error: "Failed to load cases" };
  }
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
      if (!data) {
        // Fall through to mock
      } else {
        const row = data as ReliabilityRow;
        const reliability: ReliabilityBadge = {
          state: row.state,
          agencies_total: row.agencies_total,
          agencies_reporting: row.agencies_reporting,
          reporting_pct: row.reporting_pct,
          confidence: getConfidenceLevel(row.reporting_pct),
        };
        return { reliability };
      }
    } catch (err) {
      console.warn("[supabase] falling back to mock:", err);
    }
  }

  // Fallback to mock data
  try {
    const reliability =
      MOCK_STATE_RELIABILITY.find((r) => r.state === state) ?? null;
    return { reliability };
  } catch (err) {
    console.error("[getStateReliability]", err);
    return { reliability: null, error: "Failed to load reliability data" };
  }
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
    return {
      totalCases: 0,
      totalUnsolved: 0,
      clusterCount: 0,
      error: "Failed to load stats",
    };
  }
}
