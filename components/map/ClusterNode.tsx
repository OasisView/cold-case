// ClusterNode — cluster marker rendered as glowing circle inside Mapbox GL markers
// Size scales with case count. Color: hot (red), warm (amber), cold (muted).
// Pulse ring animation on hot nodes. Selected node gets two spinning dashed rings.
"use client";

interface ClusterNodeProps {
  size: number;
  heat: "hot" | "warm" | "cold";
  isSelected: boolean;
  caseCount: number;
}

const HEAT_STYLES = {
  hot: {
    outerBg: "rgba(200,16,46,0.12)",
    outerBorder: "1px solid rgba(200,16,46,0.35)",
    outerShadow: "0 0 28px rgba(200,16,46,0.15)",
    innerBg: "rgba(200,16,46,0.65)",
    innerBorder: "1.5px solid #C8102E",
    spinColor: "#C8102E",
  },
  warm: {
    outerBg: "rgba(232,160,32,0.08)",
    outerBorder: "1px solid rgba(232,160,32,0.25)",
    outerShadow: "none",
    innerBg: "rgba(232,160,32,0.50)",
    innerBorder: "1.5px solid #E8A020",
    spinColor: "#E8A020",
  },
  cold: {
    outerBg: "rgba(90,96,112,0.08)",
    outerBorder: "1px solid rgba(90,96,112,0.25)",
    outerShadow: "none",
    innerBg: "rgba(90,96,112,0.35)",
    innerBorder: "1.5px solid #5A6070",
    spinColor: "#5A6070",
  },
} as const;

export default function ClusterNode({
  size,
  heat,
  isSelected,
  caseCount,
}: ClusterNodeProps) {
  const s = HEAT_STYLES[heat];
  const innerSize = Math.round(size * 0.5);
  const showPulse = heat === "hot";

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "clusterIn 0.4s ease-out both",
      }}
      data-heat={heat}
    >
      {/* Outer ring */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: s.outerBg,
          border: s.outerBorder,
          boxShadow: s.outerShadow,
        }}
      />

      {/* Pulse ring — hot nodes only (DESIGN.md: pulseRing 2.5s infinite) */}
      {showPulse && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "1.5px solid rgba(200,16,46,0.5)",
            animation: "pulseRing 2.5s infinite",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Selected: outer spinning dashed ring — 8s linear infinite */}
      {isSelected && (
        <div
          style={{
            position: "absolute",
            inset: "-4px",
            borderRadius: "50%",
            border: `1.5px dashed ${s.spinColor}`,
            animation: "spin 8s linear infinite",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Selected: inner spinning dashed ring — 14s linear infinite reverse */}
      {isSelected && (
        <div
          style={{
            position: "absolute",
            inset: "-8px",
            borderRadius: "50%",
            border: `1px dashed ${s.spinColor}`,
            animation: "spin 14s linear infinite reverse",
            opacity: 0.6,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Inner circle */}
      <div
        style={{
          width: `${innerSize}px`,
          height: `${innerSize}px`,
          borderRadius: "50%",
          background: s.innerBg,
          border: s.innerBorder,
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Case count label — only if inner circle is large enough */}
        {innerSize >= 20 && (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: innerSize >= 28 ? "8px" : "7px",
              letterSpacing: "0.5px",
              color: "#F0F2F5",
              fontWeight: 500,
              lineHeight: 1,
              textAlign: "center",
            }}
          >
            {caseCount >= 1000
              ? `${(caseCount / 1000).toFixed(1)}k`
              : caseCount}
          </span>
        )}
      </div>
    </div>
  );
}
