// Map page — TopNav + FilterPanel (260px) | MapCanvas (fills remaining)
// SSR disabled for MapCanvas via next/dynamic (Mapbox GL requires browser APIs)
// Progressive loading: hardcoded clusters render instantly, RPC data replaces on arrival
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import TopNav from "@/components/layout/TopNav";
import FilterPanel from "@/components/filters/FilterPanel";
import { HARDCODED_STATE_CLUSTERS, getClusters } from "@/lib/supabase";
import { useFilterStore } from "@/store/useFilterStore";
import type { Cluster } from "@/lib/types";

// SSR disabled — Mapbox GL JS requires window/document
const MapCanvas = dynamic(() => import("@/components/map/MapCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center flex-1 bg-bg">
      <span
        className="font-[family-name:var(--font-mono)] text-muted uppercase"
        style={{ fontSize: "10px", letterSpacing: "2px" }}
      >
        Loading map...
      </span>
    </div>
  ),
});

export default function MapPage() {
  const state = useFilterStore((s) => s.state);
  const victimSex = useFilterStore((s) => s.victimSex);
  const weaponType = useFilterStore((s) => s.weaponType);
  const victimRace = useFilterStore((s) => s.victimRace);
  const solveStatus = useFilterStore((s) => s.solveStatus);
  const dateRange = useFilterStore((s) => s.dateRange);
  const minClusterSize = useFilterStore((s) => s.minClusterSize);

  const [clusters, setClusters] = useState<Cluster[]>(HARDCODED_STATE_CLUSTERS);
  const [totalCases, setTotalCases] = useState(852394);
  const [totalUnsolved, setTotalUnsolved] = useState(251082);

  // Progressive load on mount + re-fire when filters change
  useEffect(() => {
    let cancelled = false;

    const isDefault =
      state === null &&
      victimSex === "all" &&
      weaponType === null &&
      victimRace === "all" &&
      solveStatus === "all" &&
      dateRange[0] === 1976 &&
      dateRange[1] === 2023;

    // Always show hardcoded instantly for default view
    if (isDefault) {
      setClusters(HARDCODED_STATE_CLUSTERS.filter((c) => c.total_cases > 0));
      setTotalCases(852394);
      setTotalUnsolved(251082);
      // Then upgrade with real RPC data — reveal clusters one by one, largest first
      getClusters(
        { state, victimSex, weaponType, victimRace, solveStatus, dateRange, minClusterSize },
        true
      ).then((result) => {
        if (!cancelled && result.clusters.length > 0) {
          const sorted = [...result.clusters]
            .filter((c) => c.total_cases > 0)
            .sort((a, b) => b.total_cases - a.total_cases); // largest first

          sorted.forEach((cluster, index) => {
            setTimeout(() => {
              if (!cancelled) {
                setClusters((prev) => {
                  const exists = prev.find((c) => c.id === cluster.id);
                  if (exists) {
                    return prev.map((c) => (c.id === cluster.id ? cluster : c));
                  }
                  return [...prev, cluster];
                });
              }
            }, index * 80); // 80ms between each cluster
          });

          // Update totals after all clusters reveal
          setTimeout(() => {
            if (!cancelled) {
              setTotalCases(result.totalCases);
              setTotalUnsolved(result.totalUnsolved);
            }
          }, sorted.length * 80);
        }
      });
      return;
    }

    // Filtered view — keep current clusters visible while RPC loads
    // Only clear if weapon/sex/race filters are applied (more specific)
    const hasSpecificFilters =
      victimSex !== "all" || weaponType !== null || victimRace !== "all";
    if (hasSpecificFilters) {
      setClusters([]);
    }

    getClusters(
      { state, victimSex, weaponType, victimRace, solveStatus, dateRange, minClusterSize },
      true
    ).then((result) => {
      if (!cancelled) {
        setClusters(result.clusters.filter((c) => c.total_cases > 0));
        setTotalCases(result.totalCases);
        setTotalUnsolved(result.totalUnsolved);
      }
    });

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, victimSex, weaponType, victimRace, solveStatus, dateRange[0], dateRange[1], minClusterSize]);

  return (
    <div
      className="flex flex-col h-screen overflow-hidden bg-bg"
      style={{ minWidth: "1280px", paddingTop: "64px" }}
    >
      {/* TopNav — isolated block */}
      <TopNav />

      {/* 2-column layout: FilterPanel (260px fixed) | MapCanvas (fills remaining) */}
      <div
        className="flex overflow-hidden"
        style={{ height: "calc(100vh - 64px)" }}
      >
        <FilterPanel />
        <MapCanvas
          clusters={clusters}
          totalCases={totalCases}
          totalUnsolved={totalUnsolved}
          loading={false}
        />
      </div>
    </div>
  );
}
