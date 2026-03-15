// ClusterList — ranked list sorted by unsolved count, each row with solve rate bar. Isolated block.
"use client";

import type { Cluster } from "@/lib/types";
import { useFilterStore } from "@/store/useFilterStore";
import { CLUSTER_HEAT } from "@/lib/constants";

interface ClusterListProps {
  clusters: Cluster[];
  loading: boolean;
  error?: string;
}

function ClusterRow({
  cluster,
  rank,
  isSelected,
  onSelect,
}: {
  cluster: Cluster;
  rank: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const isHot = cluster.solve_rate <= CLUSTER_HEAT.HOT_MAX_SOLVE_RATE;
  const isWarm =
    cluster.solve_rate > CLUSTER_HEAT.HOT_MAX_SOLVE_RATE &&
    cluster.solve_rate <= CLUSTER_HEAT.WARM_MAX_SOLVE_RATE;
  const barColor = isHot ? "bg-red" : isWarm ? "bg-amber" : "bg-muted";
  const rateColor = isHot ? "text-red" : isWarm ? "text-amber" : "text-muted2";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex flex-col gap-[8px] px-[14px] py-[12px] border-b border-border text-left cursor-pointer transition-colors w-full ${
        isSelected ? "bg-bg3" : "bg-transparent hover:bg-bg3/50"
      }`}
    >
      {/* Row top: rank + name + cases */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[8px]">
          <span
            className="font-[family-name:var(--font-mono)] text-muted"
            style={{ fontSize: "10px", letterSpacing: "1px", width: "18px" }}
          >
            {String(rank).padStart(2, "0")}
          </span>
          <span
            className="font-[family-name:var(--font-mono)] text-ice"
            style={{ fontSize: "12px", letterSpacing: "0.5px" }}
          >
            {cluster.name}
          </span>
        </div>
        <span
          className="font-[family-name:var(--font-display)] text-ice"
          style={{ fontSize: "24px", letterSpacing: "1px", lineHeight: 1 }}
        >
          {cluster.total_cases.toLocaleString()}
        </span>
      </div>

      {/* Row bottom: solve rate bar + percentage */}
      <div className="flex items-center gap-[8px] pl-[24px]">
        <div
          className="flex-1 bg-border overflow-hidden"
          style={{ height: "3px", borderRadius: "1px" }}
        >
          <div
            className={barColor}
            style={{
              width: `${(1 - cluster.solve_rate) * 100}%`,
              height: "3px",
              borderRadius: "1px",
            }}
          />
        </div>
        <span
          className={`font-[family-name:var(--font-mono)] ${rateColor} shrink-0`}
          style={{ fontSize: "10px", letterSpacing: "1px", width: "40px", textAlign: "right" }}
        >
          {Math.round(cluster.solve_rate * 100)}% sr
        </span>
        <span
          className="font-[family-name:var(--font-mono)] text-red shrink-0"
          style={{ fontSize: "10px", letterSpacing: "1px" }}
        >
          {cluster.unsolved_cases.toLocaleString()} unsolved
        </span>
      </div>
    </button>
  );
}

export default function ClusterList({
  clusters,
  loading,
  error,
}: ClusterListProps) {
  const selectedClusterId = useFilterStore((s) => s.selectedClusterId);
  const setSelectedClusterId = useFilterStore((s) => s.setSelectedClusterId);

  // Sort by unsolved count descending
  const sorted = [...clusters].sort(
    (a, b) => b.unsolved_cases - a.unsolved_cases
  );

  if (loading) {
    return (
      <div className="flex-1 flex flex-col bg-bg overflow-hidden">
        <div
          className="flex items-center justify-between px-[12px] border-b border-border shrink-0"
          style={{ height: "32px" }}
        >
          <div className="skeleton" style={{ width: "100px", height: "8px" }} />
          <div className="skeleton" style={{ width: "50px", height: "8px" }} />
        </div>
        <div className="flex-1 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-[14px] py-[12px] border-b border-border"
            >
              <div className="skeleton" style={{ width: "120px", height: "12px" }} />
              <div className="skeleton" style={{ width: "40px", height: "20px" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-[8px] bg-bg overflow-hidden">
        <span
          className="font-[family-name:var(--font-mono)] text-red"
          style={{ fontSize: "10px", letterSpacing: "1px" }}
        >
          {error}
        </span>
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg overflow-hidden">
        <span
          className="font-[family-name:var(--font-mono)] text-muted"
          style={{ fontSize: "10px", letterSpacing: "1px" }}
        >
          No clusters match current filters
        </span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-bg overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-[12px] border-b border-border shrink-0"
        style={{ height: "32px" }}
      >
        <span
          className="font-[family-name:var(--font-mono)] text-muted uppercase"
          style={{ fontSize: "8px", letterSpacing: "2.5px" }}
        >
          Cluster Ranking
        </span>
        <span
          className="font-[family-name:var(--font-mono)] text-muted"
          style={{ fontSize: "9px", letterSpacing: "1px" }}
        >
          {sorted.length} clusters
        </span>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto">
        {sorted.map((cluster, i) => (
          <ClusterRow
            key={cluster.id}
            cluster={cluster}
            rank={i + 1}
            isSelected={selectedClusterId === cluster.id}
            onSelect={() => setSelectedClusterId(cluster.id)}
          />
        ))}
      </div>
    </div>
  );
}
