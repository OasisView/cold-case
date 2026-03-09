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
  VA: 100,
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

// ── State map views for flyTo animation (center [lng, lat] + zoom) ──
export const STATE_MAP_VIEWS: Record<string, { center: [number, number]; zoom: number }> = {
  "Alabama":              { center: [-86.9023, 32.3182],   zoom: 6 },
  "Alaska":               { center: [-153.4937, 64.2008],  zoom: 4 },
  "Arizona":              { center: [-111.0937, 34.0489],   zoom: 6 },
  "Arkansas":             { center: [-92.1999, 34.7999],    zoom: 6 },
  "California":           { center: [-119.4179, 36.7783],   zoom: 5 },
  "Colorado":             { center: [-105.7821, 39.5501],   zoom: 6 },
  "Connecticut":          { center: [-72.7554, 41.6032],    zoom: 7 },
  "Delaware":             { center: [-75.5277, 39.1582],    zoom: 7 },
  "District of Columbia": { center: [-77.0369, 38.9072],    zoom: 11 },
  "Florida":              { center: [-81.5158, 27.6648],    zoom: 6 },
  "Georgia":              { center: [-83.5002, 32.1656],    zoom: 6 },
  "Hawaii":               { center: [-155.5828, 19.8968],   zoom: 6 },
  "Idaho":                { center: [-114.7420, 44.0682],   zoom: 6 },
  "Illinois":             { center: [-89.3985, 40.6331],    zoom: 6 },
  "Indiana":              { center: [-86.1349, 40.2672],    zoom: 6 },
  "Iowa":                 { center: [-93.0977, 41.8780],    zoom: 6 },
  "Kansas":               { center: [-98.4842, 39.0119],    zoom: 6 },
  "Kentucky":             { center: [-84.2700, 37.8393],    zoom: 6 },
  "Louisiana":            { center: [-91.9623, 30.9843],    zoom: 6 },
  "Maine":                { center: [-69.4455, 45.2538],    zoom: 6 },
  "Maryland":             { center: [-76.6413, 39.0458],    zoom: 7 },
  "Massachusetts":        { center: [-71.3824, 42.4072],    zoom: 7 },
  "Michigan":             { center: [-84.5361, 44.3148],    zoom: 6 },
  "Minnesota":            { center: [-94.6859, 46.7296],    zoom: 6 },
  "Mississippi":          { center: [-89.3985, 32.3547],    zoom: 6 },
  "Missouri":             { center: [-91.8318, 37.9643],    zoom: 6 },
  "Montana":              { center: [-109.6333, 46.8797],   zoom: 5 },
  "Nebraska":             { center: [-99.9018, 41.4925],    zoom: 6 },
  "Nevada":               { center: [-116.4194, 38.8026],   zoom: 6 },
  "New Hampshire":        { center: [-71.5724, 43.1939],    zoom: 7 },
  "New Jersey":           { center: [-74.4057, 40.0583],    zoom: 7 },
  "New Mexico":           { center: [-105.8701, 34.5199],   zoom: 6 },
  "New York":             { center: [-75.0000, 43.0000],    zoom: 6 },
  "North Carolina":       { center: [-79.0193, 35.7596],    zoom: 6 },
  "North Dakota":         { center: [-101.0020, 47.5515],   zoom: 6 },
  "Ohio":                 { center: [-82.9071, 40.4173],    zoom: 6 },
  "Oklahoma":             { center: [-97.0929, 35.0078],    zoom: 6 },
  "Oregon":               { center: [-120.5542, 43.8041],   zoom: 6 },
  "Pennsylvania":         { center: [-77.1945, 41.2033],    zoom: 6 },
  "Rhode Island":         { center: [-71.4774, 41.5801],    zoom: 7 },
  "South Carolina":       { center: [-81.1637, 33.8361],    zoom: 6 },
  "South Dakota":         { center: [-99.9018, 43.9695],    zoom: 6 },
  "Tennessee":            { center: [-86.5804, 35.5175],    zoom: 6 },
  "Texas":                { center: [-99.9018, 31.9686],    zoom: 5 },
  "Utah":                 { center: [-111.0937, 39.3210],   zoom: 6 },
  "Vermont":              { center: [-72.5778, 44.5588],    zoom: 7 },
  "Virginia":             { center: [-78.6569, 37.4316],    zoom: 6 },
  "Washington":           { center: [-120.5015, 47.5000],   zoom: 6 },
  "West Virginia":        { center: [-80.4549, 38.5976],    zoom: 6 },
  "Wisconsin":            { center: [-89.6165, 43.7844],    zoom: 6 },
  "Wyoming":              { center: [-107.2903, 43.0760],   zoom: 5 },
};

// ── Default US map view (flyTo reset) ──
export const DEFAULT_MAP_VIEW = {
  center: [-98.5795, 39.8283] as [number, number],
  zoom: 3.5,
} as const;

// ── Racial solve rate gap by decade (verified, DESIGN.md) ──
export const RACIAL_SOLVE_GAP = [
  { decade: "1980s", black: 73.0, white: 73.3, gap: 0.3 },
  { decade: "1990s", black: 64.9, white: 72.3, gap: 7.4 },
  { decade: "2000s", black: 62.7, white: 75.2, gap: 12.5 },
  { decade: "2010s", black: 61.4, white: 79.1, gap: 17.8 },
] as const;

// ── Worst-performing jurisdictions (verified, DESIGN.md) ──
export const WORST_JURISDICTIONS = [
  { name: "District of Columbia", solveRate: 34.2, cases: 7_108 },
  { name: "San Mateo, CA", solveRate: 32.9, cases: 283 },
  { name: "Los Angeles, CA", solveRate: 38.3, cases: 1_113 },
] as const;

// ── National homicide trend (verified, CLAUDE.md) ──
export const NATIONAL_TREND = {
  PEAK_YEAR: 2022,
  PEAK_COUNT: 20_306,
  LATEST_YEAR: 2024,
  LATEST_COUNT: 15_795,
  DECLINE_PCT: 22,
} as const;
