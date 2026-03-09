// Dashboard — filters + stat bar + cluster list + detail panel
"use client";

import { useEffect, useState } from "react";
import TopNav from "@/components/layout/TopNav";
import FilterPanel from "@/components/filters/FilterPanel";
import StatBar from "@/components/dashboard/StatBar";
import ClusterList from "@/components/dashboard/ClusterList";
import DetailPanel from "@/components/dashboard/DetailPanel";
import { useFilterStore } from "@/store/useFilterStore";
import { getClusters } from "@/lib/supabase";
import type { Cluster } from "@/lib/types";

export default function DashboardPage() {
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
  const [error, setError] = useState<string | undefined>();

  // Fetch clusters when filters change
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(undefined);

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
        setError(result.error);
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

  const jurisdictions = clusters.reduce(
    (sum, c) => sum + c.jurisdictions,
    0
  );
  const overallSolveRate =
    totalCases > 0 ? (totalCases - totalUnsolved) / totalCases : 0;

  return (
    <div
      className="flex flex-col h-screen overflow-hidden bg-bg"
      style={{ minWidth: "1280px" }}
    >
      {/* TopNav — isolated block */}
      <TopNav />

      {/* Main 3-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: FilterPanel — 260px fixed */}
        <FilterPanel />

        {/* Center: StatBar + ClusterList */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <StatBar
            totalCases={totalCases}
            totalUnsolved={totalUnsolved}
            clusterCount={clusters.length}
            jurisdictions={jurisdictions}
            overallSolveRate={overallSolveRate}
            loading={loading}
          />
          <ClusterList clusters={clusters} loading={loading} error={error} />
        </div>

        {/* Right: DetailPanel — drag-resizable, default 340px, min 300px, max 600px */}
        <DetailPanel clusters={clusters} />
      </div>
    </div>
  );
}
