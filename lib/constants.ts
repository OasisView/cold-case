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

// ── State bounding boxes for fitBounds [west, south, east, north] ──
export const STATE_BOUNDS: Record<string, [number, number, number, number]> = {
  "Alabama":              [-88.473227, 30.223334, -84.888246, 35.008028],
  "Alaska":               [-168.0, 54.0, -130.0, 71.5],
  "Arizona":              [-114.81651, 31.332177, -109.045223, 37.00426],
  "Arkansas":             [-94.617919, 33.004106, -89.644395, 36.4996],
  "California":           [-124.409591, 32.534156, -114.131211, 42.009518],
  "Colorado":             [-109.060253, 36.992426, -102.041524, 41.003444],
  "Connecticut":          [-73.727775, 40.980144, -71.786994, 42.050587],
  "Delaware":             [-75.788658, 38.451013, -75.048939, 39.839007],
  "District of Columbia": [-77.119759, 38.791645, -76.909395, 38.99511],
  "Florida":              [-87.634938, 24.523096, -80.031362, 31.000888],
  "Georgia":              [-85.605165, 30.357851, -80.839729, 35.000659],
  "Hawaii":               [-160.0, 18.0, -154.0, 23.0],
  "Idaho":                [-117.243027, 41.988057, -111.043564, 49.001146],
  "Illinois":             [-91.513079, 36.970298, -87.494756, 42.508481],
  "Indiana":              [-88.097892, 37.771742, -84.784579, 41.760592],
  "Iowa":                 [-96.639704, 40.375501, -90.140061, 43.501196],
  "Kansas":               [-102.051744, 36.993016, -94.588413, 40.003162],
  "Kentucky":             [-89.571509, 36.497129, -81.964971, 39.147458],
  "Louisiana":            [-94.043147, 28.928609, -88.817017, 33.019457],
  "Maine":                [-71.083924, 42.977764, -66.949895, 47.459686],
  "Maryland":             [-79.487651, 37.911717, -75.048939, 39.723043],
  "Massachusetts":        [-73.508142, 41.237964, -69.928393, 42.886589],
  "Michigan":             [-90.418136, 41.696118, -82.413474, 48.2388],
  "Minnesota":            [-97.239209, 43.499356, -89.491739, 49.384358],
  "Mississippi":          [-91.655009, 30.173943, -88.097888, 34.996052],
  "Missouri":             [-95.774704, 35.995683, -89.098843, 40.61364],
  "Montana":              [-116.049153, 44.358221, -104.039138, 49.00139],
  "Nebraska":             [-104.053514, 39.999998, -95.30829, 43.001708],
  "Nevada":               [-120.005746, 35.001857, -114.039648, 42.002207],
  "New Hampshire":        [-72.557247, 42.69699, -70.610621, 45.305476],
  "New Jersey":           [-75.559614, 38.928519, -73.893979, 41.357423],
  "New Mexico":           [-109.050173, 31.332301, -103.001964, 37.000232],
  "New York":             [-79.762152, 40.496103, -71.856214, 45.01585],
  "North Carolina":       [-84.321869, 33.842316, -75.460621, 36.588117],
  "North Dakota":         [-104.0489, 45.935054, -96.554507, 49.000574],
  "Ohio":                 [-84.820159, 38.403202, -80.518693, 41.977523],
  "Oklahoma":             [-103.002565, 33.615833, -94.430662, 37.002206],
  "Oregon":               [-124.566244, 41.991794, -116.463504, 46.292035],
  "Pennsylvania":         [-80.519891, 39.7198, -74.689516, 42.26986],
  "Rhode Island":         [-71.862772, 41.146339, -71.12057, 42.018798],
  "South Carolina":       [-83.35391, 32.0346, -78.54203, 35.215402],
  "South Dakota":         [-104.057698, 42.479635, -96.436589, 45.94545],
  "Tennessee":            [-90.310298, 34.982972, -81.6469, 36.678118],
  "Texas":                [-106.645646, 25.837377, -93.508292, 36.500704],
  "Utah":                 [-114.052962, 36.997968, -109.041058, 42.001567],
  "Vermont":              [-73.43774, 42.726853, -71.464555, 45.016659],
  "Virginia":             [-83.675395, 36.540738, -75.242266, 39.466012],
  "Washington":           [-124.763068, 45.543541, -116.915989, 49.002494],
  "West Virginia":        [-82.644739, 37.201483, -77.719519, 40.638801],
  "Wisconsin":            [-92.888114, 42.491983, -86.805415, 47.080621],
  "Wyoming":              [-111.056888, 40.994746, -104.052245, 45.005904],
};

// ── Accurate state center points for map markers [lat, lng] ──
export const STATE_CENTERS: Record<string, [number, number]> = {
  "Alabama": [32.7794, -86.8287],
  "Alaska": [64.2008, -153.4937],
  "Arizona": [34.2744, -111.6602],
  "Arkansas": [34.8938, -92.4426],
  "California": [37.1841, -119.4696],
  "Colorado": [38.9972, -105.5478],
  "Connecticut": [41.6219, -72.7273],
  "Delaware": [38.9896, -75.5050],
  "District of Columbia": [38.9072, -77.0369],
  "Florida": [28.6305, -82.4497],
  "Georgia": [32.6415, -83.4426],
  "Hawaii": [20.2927, -156.3737],
  "Idaho": [44.3509, -114.6130],
  "Illinois": [40.0417, -89.1965],
  "Indiana": [39.8942, -86.2816],
  "Iowa": [42.0751, -93.4960],
  "Kansas": [38.4937, -98.3804],
  "Kentucky": [37.5347, -85.3021],
  "Louisiana": [31.0689, -91.9968],
  "Maine": [45.3695, -69.2428],
  "Maryland": [39.0550, -76.7909],
  "Massachusetts": [42.2596, -71.8083],
  "Michigan": [44.3467, -85.4102],
  "Minnesota": [46.2807, -94.3053],
  "Mississippi": [32.7364, -89.6678],
  "Missouri": [38.3566, -92.4580],
  "Montana": [47.0527, -109.6333],
  "Nebraska": [41.5378, -99.7951],
  "Nevada": [39.3289, -116.6312],
  "New Hampshire": [43.6805, -71.5811],
  "New Jersey": [40.1907, -74.6728],
  "New Mexico": [34.4071, -106.1126],
  "New York": [42.9538, -75.5268],
  "North Carolina": [35.5557, -79.3877],
  "North Dakota": [47.4501, -100.4659],
  "Ohio": [40.2862, -82.7937],
  "Oklahoma": [35.5889, -97.4943],
  "Oregon": [43.9336, -120.5583],
  "Pennsylvania": [40.8781, -77.7996],
  "Rhode Island": [41.6762, -71.5562],
  "South Carolina": [33.9169, -80.8964],
  "South Dakota": [44.4443, -100.2263],
  "Tennessee": [35.8580, -86.3505],
  "Texas": [31.4757, -99.3312],
  "Utah": [39.3210, -111.0937],
  "Vermont": [44.0687, -72.6658],
  "Virginia": [37.5215, -78.8537],
  "Washington": [47.3826, -120.4472],
  "West Virginia": [38.6409, -80.6227],
  "Wisconsin": [44.6243, -89.9941],
  "Wyoming": [42.9957, -107.5512],
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

// ── Expanded homicide context data (national trend line only, not case-level) ──
export const EXPANDED_HOMICIDE_SOURCE = {
  name: "expanded-homicide-2024.zip",
  records: "Aggregate",
  years: "2020–2024",
  role: "National trend line context. Used for Finding 03 on the Insights page — 2022 peak (20,306) and 2024 decline (15,795). Does not contain individual case records.",
} as const;

// ── National homicide trend (verified, CLAUDE.md) ──
export const NATIONAL_TREND = {
  PEAK_YEAR: 2022,
  PEAK_COUNT: 20_306,
  LATEST_YEAR: 2024,
  LATEST_COUNT: 15_795,
  DECLINE_PCT: 22,
} as const;
