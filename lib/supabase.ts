// ALL Supabase queries go through this file — never import the client directly in components.
// Rule from CLAUDE.md: "All Supabase queries go through lib/supabase.ts"

import { createClient } from '@supabase/supabase-js'
import type { Cluster, ClusterResult, FilterState, Homicide, StateReliability } from './types'
import { CLUSTER_THRESHOLD } from './constants'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Table name — must match loader.py HOMICIDES_TABLE constant
const CASES_TABLE = 'homicides'

// ============================================================
// getClusters
// Main query powering the dashboard cluster list and map nodes.
// Groups homicides by county_fips and applies all active filters.
// TODO: swap mock data for real Supabase call when schema is confirmed
// ============================================================
export async function getClusters(filters: FilterState): Promise<ClusterResult> {
  try {
    let query = supabase
      .from(CASES_TABLE)
      .select('county_fips, state, solved, lat, lng, weapon_code, year')

    if (filters.state) query = query.eq('state', filters.state)
    if (filters.victim_sex) query = query.eq('victim_sex', filters.victim_sex)
    if (filters.victim_race) query = query.eq('victim_race', filters.victim_race)
    if (filters.weapon_code) query = query.eq('weapon_code', filters.weapon_code)
    if (filters.year_start) query = query.gte('year', filters.year_start)
    if (filters.year_end) query = query.lte('year', filters.year_end)

    const { data, error } = await query

    if (error) throw error
    if (!data) return { clusters: [], total_cases: 0, total_unsolved: 0, overall_solve_rate: 0 }

    // Group by county_fips client-side
    // TODO: move to a Supabase RPC function for better performance once schema is confirmed
    const grouped = new Map<string, typeof data>()
    for (const row of data) {
      if (!row.county_fips) continue
      const key = row.county_fips
      if (!grouped.has(key)) grouped.set(key, [])
      grouped.get(key)!.push(row)
    }

    const threshold = filters.cluster_threshold ?? CLUSTER_THRESHOLD.default

    const clusters: Cluster[] = []
    for (const [fips, rows] of grouped.entries()) {
      if (rows.length < threshold) continue
      const unsolved = rows.filter(r => !r.solved).length
      const years = rows.map(r => r.year).filter(Boolean) as number[]
      const lats = rows.map(r => r.lat).filter(Boolean) as number[]
      const lngs = rows.map(r => r.lng).filter(Boolean) as number[]

      clusters.push({
        id: fips,
        county_fips: fips,
        county_name: fips,  // TODO: join to county name lookup
        state: rows[0].state ?? '',
        total_cases: rows.length,
        unsolved_cases: unsolved,
        solve_rate: rows.length > 0 ? (rows.length - unsolved) / rows.length : 0,
        lat: lats.length > 0 ? lats.reduce((a, b) => a + b, 0) / lats.length : 0,
        lng: lngs.length > 0 ? lngs.reduce((a, b) => a + b, 0) / lngs.length : 0,
        top_weapon: String(rows[0].weapon_code ?? 99),
        year_range: [Math.min(...years), Math.max(...years)],
        reliability: null,  // populated by getStateReliability() if needed
      })
    }

    clusters.sort((a, b) => b.unsolved_cases - a.unsolved_cases)

    const total_cases = data.length
    const total_unsolved = data.filter(r => !r.solved).length

    return {
      clusters,
      total_cases,
      total_unsolved,
      overall_solve_rate: total_cases > 0 ? (total_cases - total_unsolved) / total_cases : 0,
    }
  } catch (err) {
    console.error('[getClusters]', err)
    return { clusters: [], total_cases: 0, total_unsolved: 0, overall_solve_rate: 0 }
  }
}

// ============================================================
// getClusterById
// Returns summary data for a single cluster (Case File page)
// ============================================================
export async function getClusterById(countyFips: string, filters: FilterState): Promise<Cluster | null> {
  try {
    const result = await getClusters({ ...filters, cluster_threshold: 1 })
    return result.clusters.find(c => c.county_fips === countyFips) ?? null
  } catch (err) {
    console.error('[getClusterById]', err)
    return null
  }
}

// ============================================================
// getHomicidesForCluster
// Returns individual case rows for the Case File detail table
// ============================================================
export async function getHomicidesForCluster(
  countyFips: string,
  filters: FilterState
): Promise<Homicide[]> {
  try {
    let query = supabase
      .from(CASES_TABLE)
      .select('*')
      .eq('county_fips', countyFips)

    if (filters.state) query = query.eq('state', filters.state)
    if (filters.victim_sex) query = query.eq('victim_sex', filters.victim_sex)
    if (filters.victim_race) query = query.eq('victim_race', filters.victim_race)
    if (filters.weapon_code) query = query.eq('weapon_code', filters.weapon_code)
    if (filters.year_start) query = query.gte('year', filters.year_start)
    if (filters.year_end) query = query.lte('year', filters.year_end)

    query = query.order('year', { ascending: false })

    const { data, error } = await query
    if (error) throw error
    return (data ?? []) as Homicide[]
  } catch (err) {
    console.error('[getHomicidesForCluster]', err)
    return []
  }
}

// ============================================================
// getStateReliability
// Returns reporting confidence data for the reliability badge
// ============================================================
export async function getStateReliability(state: string): Promise<StateReliability | null> {
  try {
    const { data, error } = await supabase
      .from('state_reliability')
      .select('*')
      .eq('state', state)
      .single()

    if (error) throw error
    return data as StateReliability
  } catch (err) {
    console.error('[getStateReliability]', err)
    return null
  }
}

// ============================================================
// getAllStateReliability
// Returns all state reliability records (for map badges)
// ============================================================
export async function getAllStateReliability(): Promise<StateReliability[]> {
  try {
    const { data, error } = await supabase
      .from('state_reliability')
      .select('*')
      .order('reporting_pct', { ascending: true })

    if (error) throw error
    return (data ?? []) as StateReliability[]
  } catch (err) {
    console.error('[getAllStateReliability]', err)
    return []
  }
}
