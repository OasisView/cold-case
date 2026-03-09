// ALL Supabase queries live here — never import the client directly in components
// Every function: try/catch, typed result, TODO for real Supabase swap

import type {
  FilterState,
  ClusterResult,
  CaseResult,
  Cluster,
  ReliabilityBadge,
} from "@/lib/types";
import { MOCK_CLUSTERS, MOCK_CASES, MOCK_STATE_RELIABILITY } from "@/lib/mock-data";

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

// ── Query Functions ──

/** Get clusters matching filter criteria */
export async function getClusters(
  filters: FilterState
): Promise<ClusterResult> {
  // TODO: swap for real Supabase call when Manny's schema is ready
  try {
    const filtered = MOCK_CLUSTERS.filter((c) => matchesFilters(c, filters));

    if (filtered.length === 0) {
      return { clusters: [], totalCases: 0, totalUnsolved: 0 };
    }

    const totalCases = filtered.reduce((sum, c) => sum + c.total_cases, 0);
    const totalUnsolved = filtered.reduce(
      (sum, c) => sum + c.unsolved_cases,
      0
    );

    return { clusters: filtered, totalCases, totalUnsolved };
  } catch (err) {
    console.error("[getClusters]", err);
    return {
      clusters: [],
      totalCases: 0,
      totalUnsolved: 0,
      error: "Failed to load clusters",
    };
  }
}

/** Get a single cluster by ID */
export async function getClusterById(
  id: string
): Promise<{ cluster: Cluster | null; error?: string }> {
  // TODO: swap for real Supabase call when Manny's schema is ready
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
  // TODO: swap for real Supabase call when Manny's schema is ready
  try {
    const cluster = MOCK_CLUSTERS.find((c) => c.id === clusterId);
    if (!cluster) {
      return { cases: [], total: 0 };
    }

    const cases = MOCK_CASES.filter(
      (c) => c.county_fips === cluster.county_fips
    );
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
  // TODO: swap for real Supabase call when Manny's schema is ready
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
  // TODO: swap for real Supabase call when Manny's schema is ready
  try {
    const { clusters, totalCases, totalUnsolved } = await getClusters(filters);
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
