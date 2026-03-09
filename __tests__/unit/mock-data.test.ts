import {
  MOCK_CLUSTERS,
  MOCK_CASES,
  MOCK_STATE_RELIABILITY,
} from "@/lib/mock-data";

describe("MOCK_CLUSTERS", () => {
  it("contains 6 clusters (5 WA + DC)", () => {
    expect(MOCK_CLUSTERS).toHaveLength(6);
  });

  it("King County has 52 cases (DESIGN.md verified)", () => {
    const king = MOCK_CLUSTERS.find((c) => c.id === "wa-king");
    expect(king).toBeDefined();
    expect(king!.total_cases).toBe(52);
    expect(king!.name).toBe("King County, WA");
    expect(king!.county_fips).toBe("53033");
    expect(king!.state).toBe("Washington");
  });

  it("King County has 4 jurisdictions (demo line verified)", () => {
    const king = MOCK_CLUSTERS.find((c) => c.id === "wa-king")!;
    expect(king.jurisdictions).toBe(4);
  });

  it("Pierce County has 18 cases", () => {
    const pierce = MOCK_CLUSTERS.find((c) => c.id === "wa-pierce");
    expect(pierce!.total_cases).toBe(18);
  });

  it("Spokane County has 14 cases", () => {
    const spokane = MOCK_CLUSTERS.find((c) => c.id === "wa-spokane");
    expect(spokane!.total_cases).toBe(14);
  });

  it("Snohomish County has 8 cases", () => {
    const snohomish = MOCK_CLUSTERS.find((c) => c.id === "wa-snohomish");
    expect(snohomish!.total_cases).toBe(8);
  });

  it("Clark County has 7 cases", () => {
    const clark = MOCK_CLUSTERS.find((c) => c.id === "wa-clark");
    expect(clark!.total_cases).toBe(7);
  });

  it("DC has 7,108 cases and 34.2% solve rate (CLAUDE.md verified)", () => {
    const dc = MOCK_CLUSTERS.find((c) => c.id === "dc-district");
    expect(dc).toBeDefined();
    expect(dc!.total_cases).toBe(7108);
    expect(dc!.solve_rate).toBe(0.342);
  });

  it("DC has ~4,677 unsolved cases (derived from 34.2%)", () => {
    const dc = MOCK_CLUSTERS.find((c) => c.id === "dc-district")!;
    expect(dc.unsolved_cases).toBe(4677);
  });

  it("every cluster has valid solve_rate between 0 and 1", () => {
    for (const cluster of MOCK_CLUSTERS) {
      expect(cluster.solve_rate).toBeGreaterThanOrEqual(0);
      expect(cluster.solve_rate).toBeLessThanOrEqual(1);
    }
  });

  it("every cluster has total_cases > 0", () => {
    for (const cluster of MOCK_CLUSTERS) {
      expect(cluster.total_cases).toBeGreaterThan(0);
    }
  });

  it("every cluster has lat/lng coordinates", () => {
    for (const cluster of MOCK_CLUSTERS) {
      expect(typeof cluster.lat).toBe("number");
      expect(typeof cluster.lng).toBe("number");
      expect(cluster.lat).not.toBe(0);
      expect(cluster.lng).not.toBe(0);
    }
  });

  it("no cluster has null county_fips", () => {
    for (const cluster of MOCK_CLUSTERS) {
      expect(cluster.county_fips).not.toBeNull();
    }
  });
});

describe("MOCK_CASES", () => {
  it("contains sample cases", () => {
    expect(MOCK_CASES.length).toBeGreaterThan(0);
  });

  it("all sample cases are King County (53033) strangulation cases", () => {
    for (const c of MOCK_CASES) {
      expect(c.county_fips).toBe("53033");
      expect(c.weapon_code).toBe(80);
      expect(c.state).toBe("Washington");
    }
  });

  it("includes both solved and unsolved cases", () => {
    const solved = MOCK_CASES.filter((c) => c.solved);
    const unsolved = MOCK_CASES.filter((c) => !c.solved);
    expect(solved.length).toBeGreaterThan(0);
    expect(unsolved.length).toBeGreaterThan(0);
  });
});

describe("MOCK_STATE_RELIABILITY", () => {
  it("contains 4 state entries", () => {
    expect(MOCK_STATE_RELIABILITY).toHaveLength(4);
  });

  it("Mississippi has 24% reporting (low confidence)", () => {
    const ms = MOCK_STATE_RELIABILITY.find((r) => r.state === "Mississippi");
    expect(ms).toBeDefined();
    expect(ms!.reporting_pct).toBe(24);
    expect(ms!.confidence).toBe("low");
  });

  it("Florida has 48% reporting (low confidence)", () => {
    const fl = MOCK_STATE_RELIABILITY.find((r) => r.state === "Florida");
    expect(fl!.reporting_pct).toBe(48);
    expect(fl!.confidence).toBe("low");
  });

  it("Iowa has 59% reporting (medium confidence)", () => {
    const ia = MOCK_STATE_RELIABILITY.find((r) => r.state === "Iowa");
    expect(ia!.reporting_pct).toBe(59);
    expect(ia!.confidence).toBe("medium");
  });

  it("Washington has 92% reporting (high confidence)", () => {
    const wa = MOCK_STATE_RELIABILITY.find((r) => r.state === "Washington");
    expect(wa!.reporting_pct).toBe(92);
    expect(wa!.confidence).toBe("high");
  });
});
