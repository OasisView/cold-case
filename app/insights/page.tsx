// Insights page — data findings with 4 finding cards in 2-column grid
// All data values match CLAUDE.md exactly — no invented numbers
"use client";

import TopNav from "@/components/layout/TopNav";
import {
  RACIAL_SOLVE_GAP,
  STATE_RELIABILITY,
  WORST_JURISDICTIONS,
  NATIONAL_TREND,
} from "@/lib/constants";

export default function InsightsPage() {
  return (
    <div
      className="flex flex-col min-h-screen overflow-hidden"
      style={{ background: "#0C0C0E", minWidth: "1280px", paddingTop: "64px" }}
    >
      <TopNav />

      {/* Scrollable content */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        <div
          style={{
            maxWidth: "1100px",
            width: "100%",
            margin: "0 auto",
            padding: "40px 32px 60px",
          }}
        >
          {/* Section eyebrow */}
          <div style={{ marginBottom: "32px" }} data-testid="insights-eyebrow">
            <span
              className="font-[family-name:var(--font-mono)] uppercase"
              style={{
                fontSize: "9px",
                letterSpacing: "3px",
                color: "#C8102E",
              }}
            >
              Data Insights
            </span>
            <h1
              className="font-[family-name:var(--font-display)]"
              style={{
                fontSize: "30px",
                letterSpacing: "2px",
                color: "#F0F2F5",
                lineHeight: 1,
                marginTop: "8px",
              }}
            >
              What the Data Sees
            </h1>
          </div>

          {/* 2-column grid of finding cards */}
          <div
            className="grid"
            style={{
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            <FindingRacialGap />
            <FindingJurisdictions />
            <FindingNationalTrend />
            <FindingReliability />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Finding 01: Racial Solve Rate Gap ──
function FindingRacialGap() {
  return (
    <div
      className="overflow-hidden"
      style={{
        background: "#111216",
        border: "1px solid #1F2430",
        borderRadius: "2px",
      }}
      data-testid="finding-racial-gap"
    >
      {/* Card header */}
      <div
        className="overflow-hidden"
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #1F2430",
        }}
      >
        <span
          className="font-[family-name:var(--font-mono)] uppercase"
          style={{
            fontSize: "8px",
            letterSpacing: "2.5px",
            color: "#C8102E",
          }}
        >
          Finding 01
        </span>
        <h3
          className="font-[family-name:var(--font-display)]"
          style={{
            fontSize: "22px",
            letterSpacing: "2px",
            color: "#F0F2F5",
            lineHeight: 1,
            marginTop: "6px",
          }}
        >
          Racial Solve Rate Gap
        </h3>
      </div>

      {/* Bar chart rows */}
      <div className="overflow-hidden" style={{ padding: "16px 20px" }}>
        {RACIAL_SOLVE_GAP.map((row) => (
          <div
            key={row.decade}
            style={{ marginBottom: "14px" }}
            data-testid={`gap-row-${row.decade}`}
          >
            {/* Decade label */}
            <div className="flex items-center justify-between" style={{ marginBottom: "6px" }}>
              <span
                className="font-[family-name:var(--font-mono)]"
                style={{ fontSize: "10px", color: "#8A929F", letterSpacing: "1px" }}
              >
                {row.decade}
              </span>
              <span
                className="font-[family-name:var(--font-mono)]"
                style={{ fontSize: "10px", color: "#E8A020", letterSpacing: "0.5px" }}
                data-testid={`gap-label-${row.decade}`}
              >
                +{row.gap}pp
              </span>
            </div>
            {/* Black solve rate bar */}
            <div style={{ marginBottom: "3px" }}>
              <div className="flex items-center gap-[8px]">
                <div
                  style={{
                    height: "8px",
                    width: `${row.black}%`,
                    background: "#C8102E",
                    borderRadius: "1px",
                  }}
                />
                <span
                  className="font-[family-name:var(--font-mono)]"
                  style={{ fontSize: "9px", color: "#C8102E", whiteSpace: "nowrap" }}
                  data-testid={`black-rate-${row.decade}`}
                >
                  {row.black}%
                </span>
              </div>
            </div>
            {/* White solve rate bar */}
            <div>
              <div className="flex items-center gap-[8px]">
                <div
                  style={{
                    height: "8px",
                    width: `${row.white}%`,
                    background: "#5A6070",
                    borderRadius: "1px",
                  }}
                />
                <span
                  className="font-[family-name:var(--font-mono)]"
                  style={{ fontSize: "9px", color: "#5A6070", whiteSpace: "nowrap" }}
                  data-testid={`white-rate-${row.decade}`}
                >
                  {row.white}%
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Legend */}
        <div className="flex items-center gap-[16px]" style={{ marginTop: "8px" }}>
          <div className="flex items-center gap-[6px]">
            <div style={{ width: "12px", height: "4px", background: "#C8102E", borderRadius: "1px" }} />
            <span
              className="font-[family-name:var(--font-mono)]"
              style={{ fontSize: "8px", color: "#8A929F", letterSpacing: "1px" }}
            >
              Black Victims
            </span>
          </div>
          <div className="flex items-center gap-[6px]">
            <div style={{ width: "12px", height: "4px", background: "#5A6070", borderRadius: "1px" }} />
            <span
              className="font-[family-name:var(--font-mono)]"
              style={{ fontSize: "8px", color: "#8A929F", letterSpacing: "1px" }}
            >
              White Victims
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Finding 02: Jurisdictional Accountability ──
function FindingJurisdictions() {
  const maxCases = Math.max(...WORST_JURISDICTIONS.map((j) => j.cases));

  return (
    <div
      className="overflow-hidden"
      style={{
        background: "#111216",
        border: "1px solid #1F2430",
        borderRadius: "2px",
      }}
      data-testid="finding-jurisdictions"
    >
      {/* Card header */}
      <div
        className="overflow-hidden"
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #1F2430",
        }}
      >
        <span
          className="font-[family-name:var(--font-mono)] uppercase"
          style={{
            fontSize: "8px",
            letterSpacing: "2.5px",
            color: "#C8102E",
          }}
        >
          Finding 02
        </span>
        <h3
          className="font-[family-name:var(--font-display)]"
          style={{
            fontSize: "22px",
            letterSpacing: "2px",
            color: "#F0F2F5",
            lineHeight: 1,
            marginTop: "6px",
          }}
        >
          Jurisdictional Accountability
        </h3>
      </div>

      {/* Horizontal bar chart */}
      <div className="overflow-hidden" style={{ padding: "16px 20px" }}>
        {WORST_JURISDICTIONS.map((j) => (
          <div
            key={j.name}
            style={{ marginBottom: "16px" }}
            data-testid={`jurisdiction-${j.name.replace(/[,\s]+/g, "-").toLowerCase()}`}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: "6px" }}>
              <span
                className="font-[family-name:var(--font-mono)]"
                style={{ fontSize: "11px", color: "#F0F2F5", letterSpacing: "0.5px" }}
              >
                {j.name}
              </span>
              <span
                className="font-[family-name:var(--font-mono)]"
                style={{ fontSize: "10px", color: "#8A929F" }}
              >
                {j.cases.toLocaleString()} cases
              </span>
            </div>
            <div
              style={{
                height: "20px",
                background: "#16181D",
                borderRadius: "1px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${(j.cases / maxCases) * 100}%`,
                  background: "#C8102E",
                  borderRadius: "1px",
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: "8px",
                }}
              >
                <span
                  className="font-[family-name:var(--font-mono)]"
                  style={{ fontSize: "10px", color: "#F0F2F5", whiteSpace: "nowrap" }}
                  data-testid={`solve-rate-${j.name.replace(/[,\s]+/g, "-").toLowerCase()}`}
                >
                  {j.solveRate}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Finding 03: National Trend ──
function FindingNationalTrend() {
  const maxHeight = 120;
  const peakHeight = maxHeight;
  const latestHeight = Math.round(maxHeight * (NATIONAL_TREND.LATEST_COUNT / NATIONAL_TREND.PEAK_COUNT));

  return (
    <div
      className="overflow-hidden"
      style={{
        background: "#111216",
        border: "1px solid #1F2430",
        borderRadius: "2px",
      }}
      data-testid="finding-national-trend"
    >
      {/* Card header */}
      <div
        className="overflow-hidden"
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #1F2430",
        }}
      >
        <span
          className="font-[family-name:var(--font-mono)] uppercase"
          style={{
            fontSize: "8px",
            letterSpacing: "2.5px",
            color: "#C8102E",
          }}
        >
          Finding 03
        </span>
        <h3
          className="font-[family-name:var(--font-display)]"
          style={{
            fontSize: "22px",
            letterSpacing: "2px",
            color: "#F0F2F5",
            lineHeight: 1,
            marginTop: "6px",
          }}
        >
          National Homicide Trend
        </h3>
      </div>

      {/* Trend visualization */}
      <div className="overflow-hidden" style={{ padding: "20px 20px" }}>
        <div className="flex items-end justify-center gap-[40px]">
          {/* 2022 Peak bar */}
          <div className="flex flex-col items-center gap-[8px]">
            <span
              className="font-[family-name:var(--font-display)]"
              style={{ fontSize: "36px", letterSpacing: "1px", color: "#F0F2F5", lineHeight: 1 }}
              data-testid="peak-count"
            >
              {NATIONAL_TREND.PEAK_COUNT.toLocaleString()}
            </span>
            <div
              style={{
                width: "80px",
                height: `${peakHeight}px`,
                background: "#C8102E",
                borderRadius: "2px 2px 0 0",
              }}
            />
            <span
              className="font-[family-name:var(--font-mono)]"
              style={{ fontSize: "11px", color: "#8A929F", letterSpacing: "1px" }}
              data-testid="peak-year"
            >
              {NATIONAL_TREND.PEAK_YEAR}
            </span>
          </div>

          {/* Arrow / decline label */}
          <div className="flex flex-col items-center" style={{ marginBottom: "40px" }}>
            <span
              className="font-[family-name:var(--font-mono)]"
              style={{ fontSize: "12px", color: "#E8A020", letterSpacing: "1px" }}
              data-testid="decline-label"
            >
              ▼ {NATIONAL_TREND.DECLINE_PCT}%
            </span>
            <span
              className="font-[family-name:var(--font-mono)]"
              style={{ fontSize: "8px", color: "#5A6070", letterSpacing: "1px", marginTop: "2px" }}
            >
              DECLINE
            </span>
          </div>

          {/* 2024 bar */}
          <div className="flex flex-col items-center gap-[8px]">
            <span
              className="font-[family-name:var(--font-display)]"
              style={{ fontSize: "36px", letterSpacing: "1px", color: "#F0F2F5", lineHeight: 1 }}
              data-testid="latest-count"
            >
              {NATIONAL_TREND.LATEST_COUNT.toLocaleString()}
            </span>
            <div
              style={{
                width: "80px",
                height: `${latestHeight}px`,
                background: "#5A6070",
                borderRadius: "2px 2px 0 0",
              }}
            />
            <span
              className="font-[family-name:var(--font-mono)]"
              style={{ fontSize: "11px", color: "#8A929F", letterSpacing: "1px" }}
              data-testid="latest-year"
            >
              {NATIONAL_TREND.LATEST_YEAR}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Finding 04: Data Reliability by State ──
function FindingReliability() {
  const states = [
    { abbr: "MS", pct: STATE_RELIABILITY.MS },
    { abbr: "FL", pct: STATE_RELIABILITY.FL },
    { abbr: "IA", pct: STATE_RELIABILITY.IA },
    { abbr: "WA", pct: STATE_RELIABILITY.WA },
    { abbr: "VA", pct: STATE_RELIABILITY.VA },
  ];

  function getColor(pct: number): string {
    if (pct < 50) return "#C8102E";
    if (pct < 80) return "#E8A020";
    return "#22C55E";
  }

  function getLabel(pct: number): string {
    if (pct < 50) return "LOW";
    if (pct < 80) return "MEDIUM";
    return "HIGH";
  }

  return (
    <div
      className="overflow-hidden"
      style={{
        background: "#111216",
        border: "1px solid #1F2430",
        borderRadius: "2px",
      }}
      data-testid="finding-reliability"
    >
      {/* Card header */}
      <div
        className="overflow-hidden"
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #1F2430",
        }}
      >
        <span
          className="font-[family-name:var(--font-mono)] uppercase"
          style={{
            fontSize: "8px",
            letterSpacing: "2.5px",
            color: "#C8102E",
          }}
        >
          Finding 04
        </span>
        <h3
          className="font-[family-name:var(--font-display)]"
          style={{
            fontSize: "22px",
            letterSpacing: "2px",
            color: "#F0F2F5",
            lineHeight: 1,
            marginTop: "6px",
          }}
        >
          Data Reliability by State
        </h3>
      </div>

      {/* 5-cell grid */}
      <div className="overflow-hidden" style={{ padding: "16px 20px" }}>
        <div
          className="grid"
          style={{ gridTemplateColumns: "repeat(5, 1fr)", gap: "8px" }}
        >
          {states.map((s) => {
            const color = getColor(s.pct);
            return (
              <div
                key={s.abbr}
                className="flex flex-col items-center overflow-hidden"
                style={{
                  background: "#16181D",
                  border: "1px solid #1F2430",
                  borderRadius: "2px",
                  padding: "14px 8px",
                }}
                data-testid={`reliability-${s.abbr}`}
              >
                <span
                  className="font-[family-name:var(--font-display)]"
                  style={{ fontSize: "28px", letterSpacing: "1px", color, lineHeight: 1 }}
                >
                  {s.pct}%
                </span>
                <span
                  className="font-[family-name:var(--font-mono)] uppercase"
                  style={{
                    fontSize: "10px",
                    letterSpacing: "2px",
                    color: "#F0F2F5",
                    marginTop: "6px",
                  }}
                >
                  {s.abbr}
                </span>
                <span
                  className="font-[family-name:var(--font-mono)] uppercase"
                  style={{
                    fontSize: "7px",
                    letterSpacing: "1.5px",
                    color,
                    marginTop: "4px",
                  }}
                  data-testid={`reliability-label-${s.abbr}`}
                >
                  {getLabel(s.pct)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
