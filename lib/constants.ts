// Shared constants for Cold Case Cluster Finder
// Weapon codes mirror WEAPON_MAP in scripts/loader.py — keep in sync

export const WEAPON_CODES: Record<number, string> = {
  11: 'Firearm, type not stated',
  12: 'Handgun',
  13: 'Rifle',
  14: 'Shotgun',
  15: 'Other gun',
  20: 'Knife or cutting instrument',
  30: 'Blunt object',
  40: 'Personal weapons / beating',
  65: 'Fire',
  70: 'Narcotics or drugs',
  75: 'Drowning',
  80: 'Strangulation',
  85: 'Asphyxiation',
  99: 'Other or unknown',
}

// Reverse lookup: label → code (for filter dropdowns)
export const WEAPON_CODE_BY_LABEL: Record<string, number> = Object.fromEntries(
  Object.entries(WEAPON_CODES).map(([code, label]) => [label, Number(code)])
)

export const CLUSTER_THRESHOLD = {
  default: 10,
  min: 5,
  max: 50,
  step: 5,
} as const

// States with low FBI reporting rates — show reliability warning badge in UI
// Source: State_Reporting_Rates_2022.csv
export const LOW_REPORTING_STATES: Record<string, number> = {
  Mississippi: 0.24,
  Florida: 0.48,
  Iowa: 0.59,
}

export const LOW_REPORTING_THRESHOLD = 0.60  // below this → show warning badge

// Key stats shown in UI (CLAUDE.md — use exactly)
export const DATASET_STATS = {
  total_homicides: 894636,
  year_start: 1976,
  year_end: 2023,
  unsolved_since_1980: 237000,
  overall_solve_rate: 0.707,
  female_victims: 199567,
  female_victim_pct: 0.223,
  strangulation_cases: 10157,
} as const

// Solve rate = offender sex is known (MAP definition: OFFSEX !== 'U')
export const SOLVED_INDICATOR = (offender_sex: string): boolean =>
  offender_sex !== 'U'
