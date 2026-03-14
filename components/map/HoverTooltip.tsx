// HoverTooltip — appears on cluster node hover showing county name, case count, unsolved %
// Follows cursor, disappears on mouse leave. Isolated block — does not affect map layout.
"use client";

import type { Cluster } from "@/lib/types";

interface HoverTooltipProps {
  cluster: Cluster | null;
  x: number;
  y: number;
}

export default function HoverTooltip({ cluster, x, y }: HoverTooltipProps) {
  if (!cluster) return null;

  const unsolvedPct = Math.round((1 - cluster.solve_rate) * 100);

  return (
    <div
      style={{
        position: "fixed",
        left: x + 14,
        top: y - 10,
        zIndex: 50,
        background: "rgba(11,13,18,0.94)",
        backdropFilter: "blur(6px)",
        border: "1px solid #1F2430",
        borderRadius: "2px",
        padding: "8px 12px",
        pointerEvents: "none",
        maxWidth: "220px",
      }}
      data-testid="map-hover-tooltip"
    >
      {/* County name */}
      <div
        className="font-[family-name:var(--font-mono)] text-ice"
        style={{
          fontSize: "11px",
          letterSpacing: "0.5px",
          fontWeight: 500,
          marginBottom: "4px",
        }}
      >
        {cluster.name}
      </div>

      {/* Stats line */}
      <div
        className="font-[family-name:var(--font-mono)] text-muted2"
        style={{ fontSize: "9px", letterSpacing: "1px" }}
      >
        <span className="text-ice" style={{ fontWeight: 500 }}>
          {cluster.total_cases.toLocaleString()}
        </span>{" "}
        cases{" "}
        <span style={{ color: "#1F2430", margin: "0 4px" }}>·</span>
        <span style={{ color: "#C8102E", fontWeight: 500 }}>
          {unsolvedPct}%
        </span>{" "}
        unsolved
      </div>
    </div>
  );
}
