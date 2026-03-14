import {
  WEAPON_CODES,
  WEAPON_CODE_MAP,
  WEAPON_FILTER_OPTIONS,
  CLUSTER_THRESHOLD,
  YEAR_RANGE,
  DEFAULT_FILTERS,
  STATE_RELIABILITY,
  KEY_STATS,
  CLUSTER_HEAT,
  RACIAL_SOLVE_GAP,
  getConfidenceLevel,
} from "@/lib/constants";

describe("WEAPON_CODES", () => {
  it("contains exactly 14 weapon types", () => {
    expect(WEAPON_CODES).toHaveLength(14);
  });

  it("maps all codes from CLAUDE.md", () => {
    const codes = WEAPON_CODES.map((w) => w.code);
    expect(codes).toEqual([11, 12, 13, 14, 15, 20, 30, 40, 65, 70, 75, 80, 85, 99]);
  });

  it("Strangulation is code 80 with SHR label 'Strangulation - hanging'", () => {
    const strangulation = WEAPON_CODES.find((w) => w.code === 80);
    expect(strangulation).toBeDefined();
    expect(strangulation!.label).toBe("Strangulation");
    expect(strangulation!.shr_label).toBe("Strangulation - hanging");
  });

  it("Handgun is code 12 with SHR label 'Handgun - pistol, revolver, etc'", () => {
    const handgun = WEAPON_CODES.find((w) => w.code === 12);
    expect(handgun).toBeDefined();
    expect(handgun!.label).toBe("Handgun");
    expect(handgun!.shr_label).toBe("Handgun - pistol, revolver, etc");
  });

  it("every code has a non-empty label and shr_label", () => {
    for (const w of WEAPON_CODES) {
      expect(w.label.length).toBeGreaterThan(0);
      expect(w.shr_label.length).toBeGreaterThan(0);
    }
  });
});

describe("WEAPON_CODE_MAP", () => {
  it("contains 14 entries matching WEAPON_CODES", () => {
    expect(Object.keys(WEAPON_CODE_MAP)).toHaveLength(14);
  });

  it("returns correct label for code 80", () => {
    expect(WEAPON_CODE_MAP[80]).toBe("Strangulation");
  });
});

describe("WEAPON_FILTER_OPTIONS", () => {
  it("has 6 options (All + 5 specific)", () => {
    expect(WEAPON_FILTER_OPTIONS).toHaveLength(6);
  });

  it("first option is 'All Weapons' with null code", () => {
    expect(WEAPON_FILTER_OPTIONS[0]).toEqual({
      label: "All Weapons",
      code: null,
    });
  });

  it("includes Strangulation → 80", () => {
    const strang = WEAPON_FILTER_OPTIONS.find(
      (o) => o.label === "Strangulation"
    );
    expect(strang?.code).toBe(80);
  });
});

describe("CLUSTER_THRESHOLD", () => {
  it("defaults to 10, min 5, max 50, step 5", () => {
    expect(CLUSTER_THRESHOLD.DEFAULT).toBe(10);
    expect(CLUSTER_THRESHOLD.MIN).toBe(5);
    expect(CLUSTER_THRESHOLD.MAX).toBe(50);
    expect(CLUSTER_THRESHOLD.STEP).toBe(5);
  });
});

describe("YEAR_RANGE", () => {
  it("covers 1976–2023", () => {
    expect(YEAR_RANGE.MIN).toBe(1976);
    expect(YEAR_RANGE.MAX).toBe(2023);
  });
});

describe("DEFAULT_FILTERS", () => {
  it("date range is full year range", () => {
    expect(DEFAULT_FILTERS.dateRange).toEqual([1976, 2023]);
  });

  it("all dropdowns default to 'all' or null", () => {
    expect(DEFAULT_FILTERS.victimSex).toBe("all");
    expect(DEFAULT_FILTERS.weaponType).toBeNull();
    expect(DEFAULT_FILTERS.state).toBeNull();
    expect(DEFAULT_FILTERS.victimRace).toBe("all");
    expect(DEFAULT_FILTERS.solveStatus).toBe("all");
  });

  it("cluster size defaults to 10", () => {
    expect(DEFAULT_FILTERS.minClusterSize).toBe(10);
  });
});

describe("STATE_RELIABILITY", () => {
  it("MS = 24%, FL = 48%, IA = 59%, WA = 92%", () => {
    expect(STATE_RELIABILITY.MS).toBe(24);
    expect(STATE_RELIABILITY.FL).toBe(48);
    expect(STATE_RELIABILITY.IA).toBe(59);
    expect(STATE_RELIABILITY.WA).toBe(92);
  });
});

describe("getConfidenceLevel", () => {
  it("returns 'low' below 50%", () => {
    expect(getConfidenceLevel(24)).toBe("low");
    expect(getConfidenceLevel(48)).toBe("low");
    expect(getConfidenceLevel(49)).toBe("low");
  });

  it("returns 'medium' for 50–79%", () => {
    expect(getConfidenceLevel(50)).toBe("medium");
    expect(getConfidenceLevel(59)).toBe("medium");
    expect(getConfidenceLevel(79)).toBe("medium");
  });

  it("returns 'high' for 80%+", () => {
    expect(getConfidenceLevel(80)).toBe("high");
    expect(getConfidenceLevel(92)).toBe("high");
    expect(getConfidenceLevel(100)).toBe("high");
  });
});

describe("KEY_STATS", () => {
  it("matches verified numbers from CLAUDE.md", () => {
    expect(KEY_STATS.TOTAL_RECORDS).toBe(894636);
    expect(KEY_STATS.YEAR_START).toBe(1976);
    expect(KEY_STATS.YEAR_END).toBe(2023);
    expect(KEY_STATS.UNSOLVED_SINCE_1980).toBe("237,000+");
    expect(KEY_STATS.OVERALL_SOLVE_RATE).toBe(70.7);
    expect(KEY_STATS.FEMALE_VICTIM_PCT).toBe(22.3);
    expect(KEY_STATS.FEMALE_VICTIM_COUNT).toBe(199567);
    expect(KEY_STATS.STRANGULATION_CASES).toBe(10157);
  });
});

describe("CLUSTER_HEAT", () => {
  it("hot threshold is ≤33%, warm threshold is ≤50%", () => {
    expect(CLUSTER_HEAT.HOT_MAX_SOLVE_RATE).toBe(0.33);
    expect(CLUSTER_HEAT.WARM_MAX_SOLVE_RATE).toBe(0.5);
  });
});

describe("RACIAL_SOLVE_GAP", () => {
  it("has 4 decades of data", () => {
    expect(RACIAL_SOLVE_GAP).toHaveLength(4);
  });

  it("1980s gap is 0.3pp", () => {
    const eighties = RACIAL_SOLVE_GAP.find((r) => r.decade === "1980s");
    expect(eighties?.black).toBe(73.0);
    expect(eighties?.white).toBe(73.3);
    expect(eighties?.gap).toBe(0.3);
  });

  it("2010s gap grew to 17.8pp", () => {
    const tens = RACIAL_SOLVE_GAP.find((r) => r.decade === "2010s");
    expect(tens?.black).toBe(61.4);
    expect(tens?.white).toBe(79.1);
    expect(tens?.gap).toBe(17.8);
  });
});
