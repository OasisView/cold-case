// Zustand store — filter state shared across Dashboard, Map, and all pages

import { create } from "zustand";
import type { FilterState, QueryParams } from "@/lib/types";
import {
  DEFAULT_FILTERS,
  CLUSTER_THRESHOLD,
  YEAR_RANGE,
} from "@/lib/constants";

interface FilterStore extends FilterState {
  selectedClusterId: string | null;

  // Actions
  setDateRange: (range: [number, number]) => void;
  setVictimSex: (sex: FilterState["victimSex"]) => void;
  setWeaponType: (code: number | null) => void;
  setStateFilter: (state: string | null) => void;
  setVictimRace: (race: FilterState["victimRace"]) => void;
  setSolveStatus: (status: FilterState["solveStatus"]) => void;
  setMinClusterSize: (size: number) => void;
  setSelectedClusterId: (id: string | null) => void;
  resetFilters: () => void;

  // Derived
  getQueryParams: () => QueryParams;
}

export const useFilterStore = create<FilterStore>()((set, get) => ({
  ...DEFAULT_FILTERS,
  selectedClusterId: null,

  setDateRange: (range) => {
    const start = Math.max(YEAR_RANGE.MIN, Math.min(range[0], range[1]));
    const end = Math.min(YEAR_RANGE.MAX, Math.max(range[0], range[1]));
    set({ dateRange: [start, end] });
  },

  setVictimSex: (sex) => set({ victimSex: sex }),

  setWeaponType: (code) => set({ weaponType: code }),

  setStateFilter: (state) => set({ state }),

  setVictimRace: (race) => set({ victimRace: race }),

  setSolveStatus: (status) => set({ solveStatus: status }),

  setMinClusterSize: (size) => {
    const rounded =
      Math.round(size / CLUSTER_THRESHOLD.STEP) * CLUSTER_THRESHOLD.STEP;
    const clamped = Math.min(
      Math.max(rounded, CLUSTER_THRESHOLD.MIN),
      CLUSTER_THRESHOLD.MAX
    );
    set({ minClusterSize: clamped });
  },

  setSelectedClusterId: (id) => set({ selectedClusterId: id }),

  resetFilters: () => set({ ...DEFAULT_FILTERS, selectedClusterId: null }),

  getQueryParams: () => {
    const s = get();
    const params: QueryParams = {
      year_start: s.dateRange[0],
      year_end: s.dateRange[1],
      min_cluster_size: s.minClusterSize,
    };
    if (s.victimSex !== "all") params.victim_sex = s.victimSex;
    if (s.weaponType !== null) params.weapon_code = s.weaponType;
    if (s.state !== null) params.state = s.state;
    if (s.victimRace !== "all") params.victim_race = s.victimRace;
    if (s.solveStatus !== "all") params.solved = s.solveStatus === "solved";
    return params;
  },
}));
