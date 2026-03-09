import {
  getClusters,
  getClusterById,
  getCasesForCluster,
  getStateReliability,
  getStats,
} from "@/lib/supabase";
import { DEFAULT_FILTERS } from "@/lib/constants";
import type { FilterState } from "@/lib/types";

describe("getClusters", () => {
  it("returns clusters above default minClusterSize (10) with default filters", async () => {
    // Default minClusterSize=10 filters out Snohomish (8) and Clark (7)
    const result = await getClusters(DEFAULT_FILTERS);
    expect(result.error).toBeUndefined();
    expect(result.clusters).toHaveLength(4);
    for (const cluster of result.clusters) {
      expect(cluster.total_cases).toBeGreaterThanOrEqual(10);
    }
    expect(result.totalCases).toBeGreaterThan(0);
    expect(result.totalUnsolved).toBeGreaterThan(0);
  });

  it("returns all 6 clusters when minClusterSize is lowered to 5", async () => {
    const filters: FilterState = { ...DEFAULT_FILTERS, minClusterSize: 5 };
    const result = await getClusters(filters);
    expect(result.clusters).toHaveLength(6);
  });

  it("filters by state correctly", async () => {
    const filters: FilterState = {
      ...DEFAULT_FILTERS,
      state: "Washington",
      minClusterSize: 5,
    };
    const result = await getClusters(filters);
    expect(result.clusters).toHaveLength(5);
    for (const cluster of result.clusters) {
      expect(cluster.state).toBe("Washington");
    }
  });

  it("returns DC cluster when filtering for District of Columbia", async () => {
    const filters: FilterState = {
      ...DEFAULT_FILTERS,
      state: "District of Columbia",
    };
    const result = await getClusters(filters);
    expect(result.clusters).toHaveLength(1);
    expect(result.clusters[0].total_cases).toBe(7108);
    expect(result.clusters[0].solve_rate).toBe(0.342);
  });

  it("filters by minClusterSize", async () => {
    const filters: FilterState = {
      ...DEFAULT_FILTERS,
      minClusterSize: 15,
    };
    const result = await getClusters(filters);
    for (const cluster of result.clusters) {
      expect(cluster.total_cases).toBeGreaterThanOrEqual(15);
    }
  });

  it("returns empty result for non-existent state", async () => {
    const filters: FilterState = {
      ...DEFAULT_FILTERS,
      state: "Atlantis",
    };
    const result = await getClusters(filters);
    expect(result.clusters).toHaveLength(0);
    expect(result.totalCases).toBe(0);
    expect(result.totalUnsolved).toBe(0);
    expect(result.error).toBeUndefined();
  });

  it("totalCases and totalUnsolved sum correctly", async () => {
    const result = await getClusters(DEFAULT_FILTERS);
    const expectedTotal = result.clusters.reduce(
      (sum, c) => sum + c.total_cases,
      0
    );
    const expectedUnsolved = result.clusters.reduce(
      (sum, c) => sum + c.unsolved_cases,
      0
    );
    expect(result.totalCases).toBe(expectedTotal);
    expect(result.totalUnsolved).toBe(expectedUnsolved);
  });
});

describe("getClusterById", () => {
  it("returns King County cluster by id", async () => {
    const result = await getClusterById("wa-king");
    expect(result.error).toBeUndefined();
    expect(result.cluster).not.toBeNull();
    expect(result.cluster!.name).toBe("King County, WA");
    expect(result.cluster!.total_cases).toBe(52);
  });

  it("returns DC cluster by id", async () => {
    const result = await getClusterById("dc-district");
    expect(result.cluster).not.toBeNull();
    expect(result.cluster!.total_cases).toBe(7108);
  });

  it("returns null for unknown id", async () => {
    const result = await getClusterById("nonexistent");
    expect(result.cluster).toBeNull();
    expect(result.error).toBeUndefined();
  });
});

describe("getCasesForCluster", () => {
  it("returns cases for King County cluster", async () => {
    const result = await getCasesForCluster("wa-king");
    expect(result.error).toBeUndefined();
    expect(result.cases.length).toBeGreaterThan(0);
    for (const c of result.cases) {
      expect(c.county_fips).toBe("53033");
    }
  });

  it("returns empty for unknown cluster", async () => {
    const result = await getCasesForCluster("nonexistent");
    expect(result.cases).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});

describe("getStateReliability", () => {
  it("returns Washington reliability (92%, high)", async () => {
    const result = await getStateReliability("Washington");
    expect(result.error).toBeUndefined();
    expect(result.reliability).not.toBeNull();
    expect(result.reliability!.reporting_pct).toBe(92);
    expect(result.reliability!.confidence).toBe("high");
  });

  it("returns Mississippi reliability (24%, low)", async () => {
    const result = await getStateReliability("Mississippi");
    expect(result.reliability!.reporting_pct).toBe(24);
    expect(result.reliability!.confidence).toBe("low");
  });

  it("returns null for unknown state", async () => {
    const result = await getStateReliability("Narnia");
    expect(result.reliability).toBeNull();
    expect(result.error).toBeUndefined();
  });
});

describe("getStats", () => {
  it("returns aggregate stats for default filters", async () => {
    const result = await getStats(DEFAULT_FILTERS);
    expect(result.error).toBeUndefined();
    // Default minClusterSize=10 filters out Snohomish (8) and Clark (7)
    expect(result.clusterCount).toBe(4);
    expect(result.totalCases).toBeGreaterThan(0);
    expect(result.totalUnsolved).toBeGreaterThan(0);
  });

  it("stats match getClusters output", async () => {
    const filters: FilterState = {
      ...DEFAULT_FILTERS,
      state: "Washington",
    };
    const stats = await getStats(filters);
    const clusters = await getClusters(filters);
    expect(stats.clusterCount).toBe(clusters.clusters.length);
    expect(stats.totalCases).toBe(clusters.totalCases);
    expect(stats.totalUnsolved).toBe(clusters.totalUnsolved);
  });
});
