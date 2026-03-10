// Methodology page — algorithm explanation, data sources, limitations
// Single scrollable column with TopNav. Three isolated sections.
"use client";

import TopNav from "@/components/layout/TopNav";
import { KEY_STATS, EXPANDED_HOMICIDE_SOURCE } from "@/lib/constants";

export default function MethodologyPage() {
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
            maxWidth: "900px",
            width: "100%",
            margin: "0 auto",
            padding: "40px 32px 60px",
          }}
        >
          {/* Page header */}
          <div style={{ marginBottom: "40px" }} data-testid="methodology-header">
            <span
              className="font-[family-name:var(--font-mono)] uppercase"
              style={{
                fontSize: "9px",
                letterSpacing: "3px",
                color: "#C8102E",
              }}
            >
              Methodology
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
              How It Works
            </h1>
          </div>

          {/* Section 1: Algorithm */}
          <AlgorithmSection />

          {/* Section 2: Data Sources */}
          <DataSourcesSection />

          {/* Section 3: Limitations */}
          <LimitationsSection />
        </div>
      </div>
    </div>
  );
}

// ── Section 1: Algorithm ──
function AlgorithmSection() {
  return (
    <div
      className="overflow-hidden"
      style={{
        background: "#111216",
        border: "1px solid #1F2430",
        borderRadius: "2px",
        marginBottom: "24px",
      }}
      data-testid="section-algorithm"
    >
      <div
        className="overflow-hidden"
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid #1F2430",
        }}
      >
        <span
          className="font-[family-name:var(--font-mono)] uppercase"
          style={{ fontSize: "8px", letterSpacing: "2.5px", color: "#C8102E" }}
        >
          Algorithm
        </span>
        <h2
          className="font-[family-name:var(--font-display)]"
          style={{
            fontSize: "22px",
            letterSpacing: "2px",
            color: "#F0F2F5",
            lineHeight: 1,
            marginTop: "6px",
          }}
        >
          Cluster Detection
        </h2>
      </div>

      <div className="overflow-hidden" style={{ padding: "20px 24px" }}>
        <p
          className="font-[family-name:var(--font-body)]"
          style={{
            fontSize: "13px",
            fontWeight: 300,
            color: "#8A929F",
            lineHeight: 1.78,
            letterSpacing: "0.3px",
            marginBottom: "20px",
          }}
        >
          Cases are grouped by county FIPS code, weapon type, and victim demographic
          profile. A geographic cluster is flagged when the group meets both conditions:
        </p>

        {/* Formula block */}
        <div
          className="overflow-hidden"
          style={{
            background: "#16181D",
            border: "1px solid #1F2430",
            borderRadius: "2px",
            padding: "20px 24px",
          }}
          data-testid="formula-block"
        >
          <div className="flex flex-col gap-[12px]">
            <div className="flex items-center gap-[12px]">
              <span
                className="font-[family-name:var(--font-mono)]"
                style={{ fontSize: "12px", color: "#E8A020", letterSpacing: "0.5px" }}
              >
                Condition 1:
              </span>
              <span
                className="font-[family-name:var(--font-mono)]"
                style={{ fontSize: "12px", color: "#F0F2F5", letterSpacing: "0.5px" }}
              >
                total_cases &ge; min_cluster_size
              </span>
            </div>
            <div className="flex items-center gap-[12px]">
              <span
                className="font-[family-name:var(--font-mono)]"
                style={{ fontSize: "12px", color: "#E8A020", letterSpacing: "0.5px" }}
              >
                Condition 2:
              </span>
              <span
                className="font-[family-name:var(--font-mono)]"
                style={{ fontSize: "12px", color: "#F0F2F5", letterSpacing: "0.5px" }}
              >
                solve_rate &le; 0.33
              </span>
            </div>
          </div>
        </div>

        <p
          className="font-[family-name:var(--font-body)]"
          style={{
            fontSize: "13px",
            fontWeight: 300,
            color: "#8A929F",
            lineHeight: 1.78,
            letterSpacing: "0.3px",
            marginTop: "20px",
          }}
        >
          The minimum cluster size is user-adjustable (default 10, range 5–50, step 5).
          Solve rate is defined as the proportion of cases where the offender sex is not
          &quot;Unknown&quot; (OFFSEX &ne; &apos;U&apos;). Clusters are ranked by unsolved
          case count descending.
        </p>
      </div>
    </div>
  );
}

// ── Section 2: Data Sources ──
function DataSourcesSection() {
  const sources = [
    {
      name: "SHR65_23.csv",
      records: KEY_STATS.TOTAL_RECORDS,
      years: `${KEY_STATS.YEAR_START}–${KEY_STATS.YEAR_END}`,
      role: "Primary dataset — single source of truth for all homicide records. Includes CNTYFIPS, MSA, Circumstance columns.",
    },
    {
      name: "UCR65_23a.sav",
      records: 180_298,
      years: "1965–2023",
      role: "Agency clearance rates. ORI to county FIPS mapping (5-digit codes). Join key: ORI.",
    },
    {
      name: "State_Reporting_Rates_2022.xlsx",
      records: 51,
      years: "2022",
      role: "State reporting reliability badges. Identifies low-confidence states: MS (24%), FL (48%), IA (59%).",
    },
    {
      name: EXPANDED_HOMICIDE_SOURCE.name,
      records: EXPANDED_HOMICIDE_SOURCE.records,
      years: EXPANDED_HOMICIDE_SOURCE.years,
      role: EXPANDED_HOMICIDE_SOURCE.role,
    },
  ];

  return (
    <div
      className="overflow-hidden"
      style={{
        background: "#111216",
        border: "1px solid #1F2430",
        borderRadius: "2px",
        marginBottom: "24px",
      }}
      data-testid="section-data-sources"
    >
      <div
        className="overflow-hidden"
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid #1F2430",
        }}
      >
        <span
          className="font-[family-name:var(--font-mono)] uppercase"
          style={{ fontSize: "8px", letterSpacing: "2.5px", color: "#C8102E" }}
        >
          Data Sources
        </span>
        <h2
          className="font-[family-name:var(--font-display)]"
          style={{
            fontSize: "22px",
            letterSpacing: "2px",
            color: "#F0F2F5",
            lineHeight: 1,
            marginTop: "6px",
          }}
        >
          Where the Data Comes From
        </h2>
      </div>

      <div className="overflow-hidden" style={{ padding: "20px 24px" }}>
        <div
          className="grid"
          style={{ gridTemplateColumns: "1fr 1fr", gap: "12px" }}
        >
          {sources.map((src) => (
            <div
              key={src.name}
              className="overflow-hidden"
              style={{
                background: "#16181D",
                border: "1px solid #1F2430",
                borderRadius: "2px",
                padding: "16px",
              }}
              data-testid={`source-${src.name.replace(/[.\s]+/g, "-").toLowerCase()}`}
            >
              <span
                className="font-[family-name:var(--font-mono)]"
                style={{ fontSize: "12px", color: "#F0F2F5", letterSpacing: "0.5px" }}
              >
                {src.name}
              </span>
              <div className="flex items-center gap-[12px]" style={{ marginTop: "8px" }}>
                <span
                  className="font-[family-name:var(--font-mono)]"
                  style={{ fontSize: "10px", color: "#E8A020", letterSpacing: "0.5px" }}
                  data-testid={`source-records-${src.name.replace(/[.\s]+/g, "-").toLowerCase()}`}
                >
                  {src.records.toLocaleString()} records
                </span>
                <span
                  className="font-[family-name:var(--font-mono)]"
                  style={{ fontSize: "10px", color: "#5A6070" }}
                >
                  {src.years}
                </span>
              </div>
              <p
                className="font-[family-name:var(--font-body)]"
                style={{
                  fontSize: "12px",
                  fontWeight: 300,
                  color: "#8A929F",
                  lineHeight: 1.6,
                  marginTop: "8px",
                }}
              >
                {src.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Section 3: Limitations ──
function LimitationsSection() {
  const limitations = [
    {
      id: "low-confidence",
      text: "Low-confidence states significantly underreport homicides. Mississippi reports only 24% of agencies, Florida 48%, and Iowa 59%. Clusters in these states may be underrepresented or invisible in the data.",
    },
    {
      id: "unmatched-oris",
      text: "252 agency ORI codes (0.04% of records) could not be matched to a county FIPS code. These records have county_fips set to NULL and are excluded from geographic clustering but retained in aggregate statistics.",
    },
    {
      id: "rhode-island",
      text: "1,211 records in the source data contain a \"Rhodes Island\" typo which is corrected to \"Rhode Island\" during data loading. This affects state-level filtering and clustering for Rhode Island.",
    },
    {
      id: "solve-definition",
      text: "Solve rate is defined as the proportion of cases where the offender sex field is not \"Unknown\" (OFFSEX \u2260 'U'). This is a proxy for case clearance and may overcount or undercount actual clearances depending on agency reporting practices.",
    },
  ];

  return (
    <div
      className="overflow-hidden"
      style={{
        background: "#111216",
        border: "1px solid #1F2430",
        borderRadius: "2px",
      }}
      data-testid="section-limitations"
    >
      <div
        className="overflow-hidden"
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid #1F2430",
        }}
      >
        <span
          className="font-[family-name:var(--font-mono)] uppercase"
          style={{ fontSize: "8px", letterSpacing: "2.5px", color: "#C8102E" }}
        >
          Limitations
        </span>
        <h2
          className="font-[family-name:var(--font-display)]"
          style={{
            fontSize: "22px",
            letterSpacing: "2px",
            color: "#F0F2F5",
            lineHeight: 1,
            marginTop: "6px",
          }}
        >
          Known Constraints
        </h2>
      </div>

      <div className="overflow-hidden" style={{ padding: "20px 24px" }}>
        <div className="flex flex-col gap-[16px]">
          {limitations.map((item) => (
            <div
              key={item.id}
              className="flex gap-[12px] overflow-hidden"
              data-testid={`limitation-${item.id}`}
            >
              <div
                className="shrink-0"
                style={{
                  width: "4px",
                  height: "4px",
                  borderRadius: "50%",
                  background: "#C8102E",
                  marginTop: "8px",
                }}
              />
              <p
                className="font-[family-name:var(--font-body)]"
                style={{
                  fontSize: "13px",
                  fontWeight: 300,
                  color: "#8A929F",
                  lineHeight: 1.78,
                  letterSpacing: "0.3px",
                }}
              >
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
