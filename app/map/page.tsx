// Map page — TopNav + FilterPanel (260px) | MapCanvas (fills remaining)
// SSR disabled for MapCanvas via next/dynamic (Mapbox GL requires browser APIs)
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import TopNav from "@/components/layout/TopNav";
import FilterPanel from "@/components/filters/FilterPanel";
import { useFilterStore } from "@/store/useFilterStore";
import { getClusters } from "@/lib/supabase";
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
  const dateRange = useFilterStore((s) => s.dateRange);
  const victimSex = useFilterStore((s) => s.victimSex);
  const weaponType = useFilterStore((s) => s.weaponType);
  const state = useFilterStore((s) => s.state);
  const victimRace = useFilterStore((s) => s.victimRace);
  const solveStatus = useFilterStore((s) => s.solveStatus);
  const minClusterSize = useFilterStore((s) => s.minClusterSize);

  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [totalCases, setTotalCases] = useState(0);
  const [totalUnsolved, setTotalUnsolved] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch clusters when filters change
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);

      const result = await getClusters({
        dateRange,
        victimSex,
        weaponType,
        state,
        victimRace,
        solveStatus,
        minClusterSize,
      });

      if (cancelled) return;

      if (result.error) {
        setClusters([]);
        setTotalCases(0);
        setTotalUnsolved(0);
      } else {
        setClusters(result.clusters);
        setTotalCases(result.totalCases);
        setTotalUnsolved(result.totalUnsolved);
      }

      setLoading(false);
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [dateRange, victimSex, weaponType, state, victimRace, solveStatus, minClusterSize]);

  return (
    <div
      className="flex flex-col h-screen overflow-hidden bg-bg"
      style={{ minWidth: "1280px" }}
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
          loading={loading}
        />
      </div>
    </div>
  );
}
