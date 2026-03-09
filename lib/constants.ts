// Constants — weapon codes, solve rate thresholds, state reliability rates, defaults

import type { FilterState, WeaponCode } from "@/lib/types";

// ── Weapon code mapping (all 14 from CLAUDE.md) ──
export const WEAPON_CODES: WeaponCode[] = [
  {
    code: 11,
    label: "Firearm, type not stated",
    shr_label: "Firearm, type not stated",
  },
  {
    code: 12,
    label: "Handgun",
    shr_label: "Handgun - pistol, revolver, etc",
  },
  { code: 13, label: "Rifle", shr_label: "Rifle" },
  { code: 14, label: "Shotgun", shr_label: "Shotgun" },
  { code: 15, label: "Other gun", shr_label: "Other gun" },
  {
    code: 20,
    label: "Knife or cutting instrument",
    shr_label: "Knife or cutting instrument",
  },
  { code: 30, label: "Blunt object", shr_label: "Blunt object - hammer, club, etc" },
  {
    code: 40,
    label: "Personal weapons",
    shr_label: "Personal weapons, includes beating",
  },
  { code: 65, label: "Fire", shr_label: "Fire" },
  {
    code: 70,
    label: "Narcotics or drugs",
    shr_label: "Narcotics or drugs, sleeping pills",
  },
  { code: 75, label: "Drowning", shr_label: "Drowning" },
  {
    code: 80,
    label: "Strangulation",
    shr_label: "Strangulation - hanging",
  },
  {
    code: 85,
    label: "Asphyxiation",
    shr_label: "Asphyxiation - includes death by gas",
  },
  {
    code: 99,
    label: "Other or type unknown",
    shr_label: "Other or type unknown",
  },
] as const;

// ── Weapon code lookup by numeric code ──
export const WEAPON_CODE_MAP: Record<number, string> = Object.fromEntries(
  WEAPON_CODES.map((w) => [w.code, w.label])
);

// ── Weapon filter dropdown options (subset shown in UI per DESIGN.md) ──
export const WEAPON_FILTER_OPTIONS: { label: string; code: number | null }[] = [
  { label: "All Weapons", code: null },
  { label: "Strangulation", code: 80 },
  { label: "Handgun", code: 12 },
  { label: "Knife", code: 20 },
  { label: "Blunt Object", code: 30 },
  { label: "Unknown", code: 99 },
];

// ── Cluster threshold (DESIGN.md: user-adjustable, never hardcoded) ──
export const CLUSTER_THRESHOLD = {
  MIN: 5,
  MAX: 50,
  STEP: 5,
  DEFAULT: 10,
} as const;

// ── Year range (SHR65_23.csv coverage) ──
export const YEAR_RANGE = {
  MIN: 1976,
  MAX: 2023,
} as const;

// ── Default filter state ──
export const DEFAULT_FILTERS: FilterState = {
  dateRange: [YEAR_RANGE.MIN, YEAR_RANGE.MAX],
  victimSex: "all",
  weaponType: null,
  state: null,
  victimRace: "all",
  solveStatus: "all",
  minClusterSize: CLUSTER_THRESHOLD.DEFAULT,
};

// ── State reliability rates (from State_Reporting_Rates_2022.xlsx) ──
// Low-confidence: MS (24%), FL (48%), IA (59%)
// High-confidence demo state: WA (92%)
export const STATE_RELIABILITY: Record<string, number> = {
  MS: 24,
  FL: 48,
  IA: 59,
  WA: 92,
};

// ── Confidence level thresholds ──
export function getConfidenceLevel(
  reportingPct: number
): "low" | "medium" | "high" {
  if (reportingPct < 50) return "low";
  if (reportingPct < 80) return "medium";
  return "high";
}

// ── Verified key stats (CLAUDE.md — use exactly in UI copy) ──
export const KEY_STATS = {
  TOTAL_RECORDS: 894_636,
  YEAR_START: 1976,
  YEAR_END: 2023,
  UNSOLVED_SINCE_1980: "237,000+",
  OVERALL_SOLVE_RATE: 70.7,
  FEMALE_VICTIM_PCT: 22.3,
  FEMALE_VICTIM_COUNT: 199_567,
  STRANGULATION_CASES: 10_157,
} as const;

// ── Solve rate cluster heat thresholds (DESIGN.md) ──
export const CLUSTER_HEAT = {
  HOT_MAX_SOLVE_RATE: 0.33, // ≤33% solved = red/hot
  WARM_MAX_SOLVE_RATE: 0.5, // 33–50% solved = amber/warm
} as const;

// ── US states for filter dropdown ──
export const US_STATES: string[] = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "District of Columbia", "Florida", "Georgia",
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota",
  "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island",
  "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
];

// ── Racial solve rate gap by decade (verified, DESIGN.md) ──
export const RACIAL_SOLVE_GAP = [
  { decade: "1980s", black: 73.0, white: 73.3, gap: 0.3 },
  { decade: "1990s", black: 64.9, white: 72.3, gap: 7.4 },
  { decade: "2000s", black: 62.7, white: 75.2, gap: 12.5 },
  { decade: "2010s", black: 61.4, white: 79.1, gap: 17.8 },
] as const;
