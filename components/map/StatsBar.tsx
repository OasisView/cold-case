// StatsBar — floating top-right overlay inside the map showing case stats
// DESIGN.md: background rgba(11,13,18,0.90), backdrop-filter blur(6px), border 1px solid #1F2430
// Format: [N] cases · [N unsolved, red] · [N] clusters
"use client";

interface StatsBarProps {
  totalCases: number;
  totalUnsolved: number;
  clusterCount: number;
  loading: boolean;
}

function Separator() {
  return (
    <div
      style={{
        width: "1px",
        height: "14px",
        background: "#1F2430",
      }}
    />
  );
}

export default function StatsBar({
  totalCases,
  totalUnsolved,
  clusterCount,
  loading,
}: StatsBarProps) {
  if (loading) {
    return (
      <div
        className="absolute overflow-hidden"
        style={{
          top: "12px",
          right: "12px",
          zIndex: 10,
          background: "rgba(11,13,18,0.90)",
          backdropFilter: "blur(6px)",
          border: "1px solid #1F2430",
          borderRadius: "2px",
          padding: "8px 14px",
        }}
        data-testid="map-stats-bar"
      >
        <span
          className="font-[family-name:var(--font-mono)] text-muted uppercase"
          style={{ fontSize: "10px", letterSpacing: "1.5px" }}
        >
          Loading...
        </span>
      </div>
    );
  }

  return (
    <div
      className="absolute flex items-center gap-[10px] overflow-hidden"
      style={{
        top: "12px",
        right: "12px",
        zIndex: 10,
        background: "rgba(11,13,18,0.90)",
        backdropFilter: "blur(6px)",
        border: "1px solid #1F2430",
        borderRadius: "2px",
        padding: "8px 14px",
      }}
      data-testid="map-stats-bar"
    >
      {/* Total cases */}
      <span
        className="font-[family-name:var(--font-mono)] text-ice"
        style={{ fontSize: "10px", letterSpacing: "0.5px" }}
      >
        <span style={{ fontWeight: 500 }}>
          {totalCases.toLocaleString()}
        </span>{" "}
        <span className="text-muted" style={{ fontSize: "10px" }}>
          cases
        </span>
      </span>

      <Separator />

      {/* Unsolved — red */}
      <span
        className="font-[family-name:var(--font-mono)]"
        style={{ fontSize: "10px", letterSpacing: "0.5px" }}
      >
        <span style={{ fontWeight: 500, color: "#C8102E" }}>
          {totalUnsolved.toLocaleString()}
        </span>{" "}
        <span className="text-muted" style={{ fontSize: "10px" }}>
          unsolved
        </span>
      </span>

      <Separator />

      {/* Clusters */}
      <span
        className="font-[family-name:var(--font-mono)] text-ice"
        style={{ fontSize: "10px", letterSpacing: "0.5px" }}
      >
        <span style={{ fontWeight: 500 }}>{clusterCount}</span>{" "}
        <span className="text-muted" style={{ fontSize: "10px" }}>
          clusters
        </span>
      </span>
    </div>
  );
}
