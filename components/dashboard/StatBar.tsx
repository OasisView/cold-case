// StatBar — 4 stat cards (Total Cases, Unsolved, Clusters Flagged, Jurisdictions). Isolated block.
"use client";

import { CLUSTER_HEAT } from "@/lib/constants";

interface StatBarProps {
  totalCases: number;
  totalUnsolved: number;
  clusterCount: number;
  jurisdictions: number;
  overallSolveRate: number;
  loading: boolean;
}

interface StatCardProps {
  label: string;
  value: string;
  color: "ice" | "red" | "amber";
}

function StatCard({ label, value, color }: StatCardProps) {
  const colorClass =
    color === "red" ? "text-red" : color === "amber" ? "text-amber" : "text-ice";

  return (
    <div className="flex flex-col gap-[4px] bg-bg3 border border-border overflow-hidden px-[14px] py-[10px]" style={{ borderRadius: "2px" }}>
      <span
        className="font-[family-name:var(--font-mono)] text-muted uppercase"
        style={{ fontSize: "8px", letterSpacing: "2.5px" }}
      >
        {label}
      </span>
      <span
        className={`font-[family-name:var(--font-display)] ${colorClass}`}
        style={{ fontSize: "28px", letterSpacing: "1px", lineHeight: 1 }}
      >
        {value}
      </span>
    </div>
  );
}

export default function StatBar({
  totalCases,
  totalUnsolved,
  clusterCount,
  jurisdictions,
  overallSolveRate,
  loading,
}: StatBarProps) {
  if (loading) {
    return (
      <div
        className="grid grid-cols-4 gap-[8px] px-[12px] bg-bg border-b border-border overflow-hidden shrink-0 items-center"
        style={{ height: "80px" }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-[4px] bg-bg3 border border-border overflow-hidden px-[14px] py-[10px]"
            style={{ borderRadius: "2px" }}
          >
            <div className="skeleton" style={{ width: "60px", height: "10px" }} />
            <div className="skeleton" style={{ width: "40px", height: "28px" }} />
          </div>
        ))}
      </div>
    );
  }

  const unsolvedColor =
    overallSolveRate <= CLUSTER_HEAT.HOT_MAX_SOLVE_RATE ? "red" : "amber";

  return (
    <div
      className="grid grid-cols-4 gap-[8px] px-[12px] bg-bg border-b border-border overflow-hidden shrink-0 items-center"
      style={{ height: "80px" }}
    >
      <StatCard
        label="Total Cases"
        value={totalCases.toLocaleString()}
        color="ice"
      />
      <StatCard
        label="Unsolved"
        value={totalUnsolved.toLocaleString()}
        color={unsolvedColor}
      />
      <StatCard
        label="Clusters Flagged"
        value={String(clusterCount)}
        color="amber"
      />
      <StatCard
        label="Jurisdictions"
        value={String(jurisdictions)}
        color="ice"
      />
    </div>
  );
}
