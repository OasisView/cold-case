// CaseFileDoc — white document card with dark header, detail grid, story brief, actions footer
// All sections are isolated blocks with overflow: hidden
"use client";

import type { Cluster, Case } from "@/lib/types";
import { WEAPON_CODE_MAP } from "@/lib/constants";
import StoryBrief from "@/components/casefile/StoryBrief";
import MiniCaseTable from "@/components/casefile/MiniCaseTable";

interface CaseFileDocProps {
  cluster: Cluster;
  cases: Case[];
}

export default function CaseFileDoc({ cluster, cases }: CaseFileDocProps) {
  const solvePercent = Math.round(cluster.solve_rate * 100);

  // Determine the most common weapon in the cluster's cases
  const topWeapon = cases.length > 0
    ? mostCommonWeapon(cases)
    : "Unknown";

  // Determine the victim profile summary
  const victimProfile = cases.length > 0
    ? buildVictimProfile(cases)
    : "Data unavailable";

  return (
    <div
      data-testid="casefile-doc"
      style={{
        background: "#F2F0EC",
        borderRadius: "2px",
        boxShadow:
          "0 8px 48px rgba(0,0,0,0.55), 0 2px 12px rgba(0,0,0,0.35)",
        maxWidth: "800px",
        width: "100%",
        overflow: "hidden",
      }}
    >
      {/* Section 1: Dark header band */}
      <div
        className="overflow-hidden"
        style={{ background: "#1A1C22", padding: "20px 28px" }}
        data-testid="casefile-header"
      >
        <div className="flex items-start justify-between">
          {/* Left: blinking dot + eyebrow + location */}
          <div className="flex flex-col gap-[8px]">
            <div className="flex items-center gap-[8px]">
              {/* Blinking red dot */}
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "#C8102E",
                  display: "inline-block",
                  animation: "blink 2s infinite",
                  flexShrink: 0,
                }}
                data-testid="blink-dot"
              />
              <span
                className="font-[family-name:var(--font-mono)] uppercase"
                style={{
                  fontSize: "8px",
                  letterSpacing: "2.5px",
                  color: "#C8102E",
                }}
              >
                Active Cluster — Priority Review
              </span>
            </div>
            <span
              className="font-[family-name:var(--font-display)]"
              style={{
                fontSize: "24px",
                letterSpacing: "2px",
                color: "#F0F2F5",
                lineHeight: 1,
              }}
            >
              {cluster.name}
            </span>
          </div>

          {/* Right: case count + year range */}
          <div className="flex flex-col items-end gap-[4px] shrink-0">
            <span
              className="font-[family-name:var(--font-display)]"
              style={{
                fontSize: "40px",
                letterSpacing: "2px",
                color: "#F0F2F5",
                lineHeight: 1,
              }}
              data-testid="header-case-count"
            >
              {cluster.total_cases.toLocaleString()}
            </span>
            <span
              className="font-[family-name:var(--font-mono)]"
              style={{
                fontSize: "9px",
                letterSpacing: "1.5px",
                color: "#5A6070",
              }}
            >
              {cluster.year_start}–{cluster.year_end}
            </span>
          </div>
        </div>
      </div>

      {/* Section 2: 2×2 Detail Grid */}
      <div
        className="overflow-hidden"
        style={{ borderBottom: "1px solid #D8D4CE" }}
        data-testid="detail-grid"
      >
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {/* Peak Period */}
          <div
            style={{
              padding: "16px 28px",
              borderRight: "1px solid #D8D4CE",
              borderBottom: "1px solid #D8D4CE",
            }}
          >
            <DetailCell
              label="Peak Period"
              value={`${cluster.year_start}–${cluster.year_end}`}
            />
          </div>

          {/* Weapon / Cause */}
          <div
            style={{
              padding: "16px 28px",
              borderBottom: "1px solid #D8D4CE",
            }}
          >
            <DetailCell label="Weapon / Cause" value={topWeapon} />
          </div>

          {/* Victim Profile */}
          <div
            style={{
              padding: "16px 28px",
              borderRight: "1px solid #D8D4CE",
            }}
          >
            <DetailCell label="Victim Profile" value={victimProfile} />
          </div>

          {/* Jurisdictions */}
          <div style={{ padding: "16px 28px" }}>
            <DetailCell
              label="Jurisdictions"
              value={`${cluster.jurisdictions} ${cluster.jurisdictions === 1 ? "agency" : "agencies"} · ${solvePercent}% solve rate`}
            />
          </div>
        </div>
      </div>

      {/* Section 3: Story Brief */}
      <div
        className="overflow-hidden"
        style={{
          padding: "20px 28px",
          borderBottom: "1px solid #D8D4CE",
        }}
      >
        <StoryBrief cluster={cluster} />
      </div>

      {/* Section 4: Mini Case Table */}
      <div
        className="overflow-hidden"
        style={{
          padding: "20px 28px",
          borderBottom: "1px solid #D8D4CE",
        }}
      >
        <MiniCaseTable cases={cases} />
      </div>

      {/* Section 5: Actions footer */}
      <div
        className="flex items-center justify-between overflow-hidden"
        style={{ background: "#EBE8E2", padding: "14px 28px" }}
        data-testid="casefile-footer"
      >
        {/* Primary action */}
        <button
          type="button"
          className="font-[family-name:var(--font-mono)] uppercase cursor-pointer"
          style={{
            fontSize: "10px",
            letterSpacing: "2px",
            background: "#C8102E",
            color: "#F0F2F5",
            border: "none",
            borderRadius: "2px",
            padding: "8px 20px",
          }}
          data-testid="download-btn"
        >
          Download Brief
        </button>

        {/* Secondary actions */}
        <div className="flex items-center gap-[8px]">
          <button
            type="button"
            className="font-[family-name:var(--font-mono)] uppercase cursor-pointer"
            style={{
              fontSize: "10px",
              letterSpacing: "2px",
              background: "transparent",
              color: "#4A4840",
              border: "1px solid #B8B4AC",
              borderRadius: "2px",
              padding: "7px 16px",
            }}
          >
            Export
          </button>
          <button
            type="button"
            className="font-[family-name:var(--font-mono)] uppercase cursor-pointer"
            style={{
              fontSize: "10px",
              letterSpacing: "2px",
              background: "transparent",
              color: "#4A4840",
              border: "1px solid #B8B4AC",
              borderRadius: "2px",
              padding: "7px 16px",
            }}
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
}

/** Detail cell: label + value */
function DetailCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-[6px]">
      <div className="flex items-center gap-[6px]">
        {/* Small icon square */}
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "1px",
            border: "1px solid #B8B4AC",
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        <span
          className="font-[family-name:var(--font-mono)] uppercase"
          style={{
            fontSize: "8px",
            letterSpacing: "2.5px",
            color: "#888078",
          }}
        >
          {label}
        </span>
      </div>
      <span
        className="font-[family-name:var(--font-body)]"
        style={{
          fontSize: "13px",
          fontWeight: 500,
          color: "#1A1C22",
        }}
        data-testid={`detail-${label.toLowerCase().replace(/\s+\/?\s*/g, "-")}`}
      >
        {value}
      </span>
    </div>
  );
}

/** Find the most common weapon label from a list of cases */
function mostCommonWeapon(cases: Case[]): string {
  const counts: Record<number, number> = {};
  for (const c of cases) {
    counts[c.weapon_code] = (counts[c.weapon_code] || 0) + 1;
  }
  let maxCode = cases[0].weapon_code;
  let maxCount = 0;
  for (const [code, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      maxCode = Number(code);
    }
  }
  return WEAPON_CODE_MAP[maxCode] || "Unknown";
}

/** Build a summary of victim demographics from cases */
function buildVictimProfile(cases: Case[]): string {
  const sexCounts: Record<string, number> = {};
  const raceCounts: Record<string, number> = {};
  for (const c of cases) {
    sexCounts[c.victim_sex] = (sexCounts[c.victim_sex] || 0) + 1;
    raceCounts[c.victim_race] = (raceCounts[c.victim_race] || 0) + 1;
  }
  const topSex = Object.entries(sexCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Unknown";
  const topRace = Object.entries(raceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Unknown";
  return `${topSex}, ${topRace}`;
}
