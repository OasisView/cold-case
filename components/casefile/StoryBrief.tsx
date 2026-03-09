// StoryBrief — templated narrative block with "AI GENERATED" amber badge
// Accepts cluster data, renders a generated paragraph with bold key numbers
"use client";

import type { Cluster } from "@/lib/types";

interface StoryBriefProps {
  cluster: Cluster;
}

export default function StoryBrief({ cluster }: StoryBriefProps) {
  const solvePercent = Math.round(cluster.solve_rate * 100);

  return (
    <div className="overflow-hidden" data-testid="story-brief">
      {/* Label row with AI GENERATED badge */}
      <div className="flex items-center gap-[8px]" style={{ marginBottom: "12px" }}>
        <span
          className="font-[family-name:var(--font-mono)] uppercase"
          style={{ fontSize: "8px", letterSpacing: "2.5px", color: "#888078" }}
        >
          Generated Brief
        </span>
        <span
          className="font-[family-name:var(--font-mono)] uppercase"
          style={{
            fontSize: "7px",
            letterSpacing: "1.5px",
            color: "#E8A020",
            background: "rgba(232,160,32,0.12)",
            border: "1px solid rgba(232,160,32,0.25)",
            borderRadius: "2px",
            padding: "2px 6px",
          }}
          data-testid="ai-badge"
        >
          AI Generated
        </span>
      </div>

      {/* Narrative body */}
      <p
        className="font-[family-name:var(--font-body)]"
        style={{
          fontSize: "13px",
          fontWeight: 300,
          color: "#3A3830",
          lineHeight: 1.78,
          letterSpacing: "0.3px",
        }}
        data-testid="story-body"
      >
        Between{" "}
        <strong style={{ fontWeight: 600, color: "#1A1C22" }}>
          {cluster.year_start}
        </strong>{" "}
        and{" "}
        <strong style={{ fontWeight: 600, color: "#1A1C22" }}>
          {cluster.year_end}
        </strong>
        ,{" "}
        <strong style={{ fontWeight: 600, color: "#1A1C22" }}>
          {cluster.total_cases.toLocaleString()}
        </strong>{" "}
        homicide cases were recorded across{" "}
        <strong style={{ fontWeight: 600, color: "#1A1C22" }}>
          {cluster.jurisdictions}
        </strong>{" "}
        {cluster.jurisdictions === 1 ? "jurisdiction" : "jurisdictions"} in{" "}
        <strong style={{ fontWeight: 600, color: "#1A1C22" }}>
          {cluster.state}
        </strong>
        . Of these,{" "}
        <strong style={{ fontWeight: 600, color: "#1A1C22" }}>
          {cluster.unsolved_cases.toLocaleString()}
        </strong>{" "}
        remain unsolved — a{" "}
        <strong style={{ fontWeight: 600, color: "#1A1C22" }}>
          {solvePercent}%
        </strong>{" "}
        solve rate. The concentration of cases in{" "}
        <strong style={{ fontWeight: 600, color: "#1A1C22" }}>
          {cluster.name}
        </strong>{" "}
        suggests a pattern that crossed jurisdictional boundaries, remaining
        invisible to any single agency.
      </p>
    </div>
  );
}
