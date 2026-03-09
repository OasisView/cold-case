import { useFilterStore } from "@/store/useFilterStore";
import { DEFAULT_FILTERS } from "@/lib/constants";

// Reset store to defaults before each test
beforeEach(() => {
  useFilterStore.getState().resetFilters();
});

describe("useFilterStore — default state", () => {
  it("matches DEFAULT_FILTERS on init", () => {
    const state = useFilterStore.getState();
    expect(state.dateRange).toEqual(DEFAULT_FILTERS.dateRange);
    expect(state.victimSex).toBe(DEFAULT_FILTERS.victimSex);
    expect(state.weaponType).toBe(DEFAULT_FILTERS.weaponType);
    expect(state.state).toBe(DEFAULT_FILTERS.state);
    expect(state.victimRace).toBe(DEFAULT_FILTERS.victimRace);
    expect(state.solveStatus).toBe(DEFAULT_FILTERS.solveStatus);
    expect(state.minClusterSize).toBe(DEFAULT_FILTERS.minClusterSize);
  });

  it("selectedClusterId is null on init", () => {
    expect(useFilterStore.getState().selectedClusterId).toBeNull();
  });
});

describe("useFilterStore — setters", () => {
  it("setDateRange updates dateRange", () => {
    useFilterStore.getState().setDateRange([1990, 2010]);
    expect(useFilterStore.getState().dateRange).toEqual([1990, 2010]);
  });

  it("setDateRange clamps to valid year range", () => {
    useFilterStore.getState().setDateRange([1900, 2100]);
    const [start, end] = useFilterStore.getState().dateRange;
    expect(start).toBe(1976);
    expect(end).toBe(2023);
  });

  it("setDateRange swaps if start > end", () => {
    useFilterStore.getState().setDateRange([2010, 1990]);
    const [start, end] = useFilterStore.getState().dateRange;
    expect(start).toBe(1990);
    expect(end).toBe(2010);
  });

  it("setVictimSex updates victimSex", () => {
    useFilterStore.getState().setVictimSex("Female");
    expect(useFilterStore.getState().victimSex).toBe("Female");
  });

  it("setWeaponType updates weaponType", () => {
    useFilterStore.getState().setWeaponType(80);
    expect(useFilterStore.getState().weaponType).toBe(80);
  });

  it("setWeaponType accepts null for all weapons", () => {
    useFilterStore.getState().setWeaponType(80);
    useFilterStore.getState().setWeaponType(null);
    expect(useFilterStore.getState().weaponType).toBeNull();
  });

  it("setStateFilter updates state", () => {
    useFilterStore.getState().setStateFilter("Washington");
    expect(useFilterStore.getState().state).toBe("Washington");
  });

  it("setVictimRace updates victimRace", () => {
    useFilterStore.getState().setVictimRace("Black");
    expect(useFilterStore.getState().victimRace).toBe("Black");
  });

  it("setSolveStatus updates solveStatus", () => {
    useFilterStore.getState().setSolveStatus("unsolved");
    expect(useFilterStore.getState().solveStatus).toBe("unsolved");
  });

  it("setSelectedClusterId updates selectedClusterId", () => {
    useFilterStore.getState().setSelectedClusterId("wa-king");
    expect(useFilterStore.getState().selectedClusterId).toBe("wa-king");
  });
});

describe("useFilterStore — setMinClusterSize", () => {
  it("sets value at default 10", () => {
    useFilterStore.getState().setMinClusterSize(10);
    expect(useFilterStore.getState().minClusterSize).toBe(10);
  });

  it("rounds to nearest step of 5", () => {
    useFilterStore.getState().setMinClusterSize(12);
    expect(useFilterStore.getState().minClusterSize).toBe(10);

    useFilterStore.getState().setMinClusterSize(13);
    expect(useFilterStore.getState().minClusterSize).toBe(15);
  });

  it("clamps to minimum 5", () => {
    useFilterStore.getState().setMinClusterSize(1);
    expect(useFilterStore.getState().minClusterSize).toBe(5);

    useFilterStore.getState().setMinClusterSize(0);
    expect(useFilterStore.getState().minClusterSize).toBe(5);
  });

  it("clamps to maximum 50", () => {
    useFilterStore.getState().setMinClusterSize(100);
    expect(useFilterStore.getState().minClusterSize).toBe(50);

    useFilterStore.getState().setMinClusterSize(55);
    expect(useFilterStore.getState().minClusterSize).toBe(50);
  });

  it("handles exact boundaries (5 and 50)", () => {
    useFilterStore.getState().setMinClusterSize(5);
    expect(useFilterStore.getState().minClusterSize).toBe(5);

    useFilterStore.getState().setMinClusterSize(50);
    expect(useFilterStore.getState().minClusterSize).toBe(50);
  });
});

describe("useFilterStore — resetFilters", () => {
  it("resets all filters to defaults", () => {
    useFilterStore.getState().setVictimSex("Female");
    useFilterStore.getState().setWeaponType(80);
    useFilterStore.getState().setStateFilter("Washington");
    useFilterStore.getState().setDateRange([1990, 2000]);
    useFilterStore.getState().setSelectedClusterId("wa-king");

    useFilterStore.getState().resetFilters();

    const state = useFilterStore.getState();
    expect(state.dateRange).toEqual([1976, 2023]);
    expect(state.victimSex).toBe("all");
    expect(state.weaponType).toBeNull();
    expect(state.state).toBeNull();
    expect(state.victimRace).toBe("all");
    expect(state.solveStatus).toBe("all");
    expect(state.minClusterSize).toBe(10);
    expect(state.selectedClusterId).toBeNull();
  });
});

describe("useFilterStore — getQueryParams", () => {
  it("returns default params with no filters applied", () => {
    const params = useFilterStore.getState().getQueryParams();
    expect(params.year_start).toBe(1976);
    expect(params.year_end).toBe(2023);
    expect(params.min_cluster_size).toBe(10);
    expect(params.victim_sex).toBeUndefined();
    expect(params.weapon_code).toBeUndefined();
    expect(params.state).toBeUndefined();
    expect(params.victim_race).toBeUndefined();
    expect(params.solved).toBeUndefined();
  });

  it("includes victim_sex when set", () => {
    useFilterStore.getState().setVictimSex("Female");
    const params = useFilterStore.getState().getQueryParams();
    expect(params.victim_sex).toBe("Female");
  });

  it("includes weapon_code when set", () => {
    useFilterStore.getState().setWeaponType(80);
    const params = useFilterStore.getState().getQueryParams();
    expect(params.weapon_code).toBe(80);
  });

  it("includes state when set", () => {
    useFilterStore.getState().setStateFilter("Washington");
    const params = useFilterStore.getState().getQueryParams();
    expect(params.state).toBe("Washington");
  });

  it("includes victim_race when set", () => {
    useFilterStore.getState().setVictimRace("Black");
    const params = useFilterStore.getState().getQueryParams();
    expect(params.victim_race).toBe("Black");
  });

  it("solved=true when solveStatus is 'solved'", () => {
    useFilterStore.getState().setSolveStatus("solved");
    const params = useFilterStore.getState().getQueryParams();
    expect(params.solved).toBe(true);
  });

  it("solved=false when solveStatus is 'unsolved'", () => {
    useFilterStore.getState().setSolveStatus("unsolved");
    const params = useFilterStore.getState().getQueryParams();
    expect(params.solved).toBe(false);
  });

  it("produces correct Green River demo params", () => {
    useFilterStore.getState().setStateFilter("Washington");
    useFilterStore.getState().setVictimSex("Female");
    useFilterStore.getState().setWeaponType(80);
    useFilterStore.getState().setDateRange([1980, 2000]);

    const params = useFilterStore.getState().getQueryParams();
    expect(params).toEqual({
      year_start: 1980,
      year_end: 2000,
      min_cluster_size: 10,
      victim_sex: "Female",
      weapon_code: 80,
      state: "Washington",
    });
  });
});
