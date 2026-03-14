// MiniCaseTable — scrollable table of individual cases for a cluster
// Columns: Year, Victim, Age, Weapon, Solved, Agency. Max 6 rows visible.
"use client";

import type { Case } from "@/lib/types";

interface MiniCaseTableProps {
  cases: Case[];
}

export default function MiniCaseTable({ cases }: MiniCaseTableProps) {
  if (cases.length === 0) {
    return (
      <div
        className="overflow-hidden"
        data-testid="case-table-empty"
        style={{ padding: "16px 0" }}
      >
        <span
          className="font-[family-name:var(--font-mono)] uppercase"
          style={{ fontSize: "10px", letterSpacing: "2px", color: "#888078" }}
        >
          No individual case records available
        </span>
      </div>
    );
  }

  return (
    <div className="overflow-hidden" data-testid="case-table">
      {/* Label */}
      <div style={{ marginBottom: "10px" }}>
        <span
          className="font-[family-name:var(--font-mono)] uppercase"
          style={{ fontSize: "8px", letterSpacing: "2.5px", color: "#888078" }}
        >
          Individual Cases
        </span>
      </div>

      {/* Scrollable table container — max 6 rows visible */}
      <div
        style={{
          maxHeight: "228px",
          overflowY: "auto",
          border: "1px solid #D8D4CE",
          borderRadius: "2px",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#EBE8E2" }}>
              {["Year", "Victim", "Age", "Weapon", "Solved", "Agency"].map(
                (header) => (
                  <th
                    key={header}
                    className="font-[family-name:var(--font-mono)] uppercase"
                    style={{
                      fontSize: "8px",
                      letterSpacing: "2px",
                      color: "#888078",
                      fontWeight: 400,
                      padding: "8px 10px",
                      textAlign: "left",
                      borderBottom: "1px solid #D8D4CE",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => (
              <tr
                key={c.id}
                style={{ borderBottom: "1px solid #D8D4CE" }}
                data-testid={`case-row-${c.id}`}
              >
                <td
                  className="font-[family-name:var(--font-mono)]"
                  style={{
                    fontSize: "10px",
                    color: "#1A1C22",
                    padding: "7px 10px",
                  }}
                >
                  {c.year}
                </td>
                <td
                  className="font-[family-name:var(--font-mono)]"
                  style={{
                    fontSize: "10px",
                    color: "#1A1C22",
                    padding: "7px 10px",
                  }}
                >
                  {c.victim_sex}, {c.victim_race}
                </td>
                <td
                  className="font-[family-name:var(--font-mono)]"
                  style={{
                    fontSize: "10px",
                    color: "#1A1C22",
                    padding: "7px 10px",
                  }}
                >
                  {c.victim_age}
                </td>
                <td
                  className="font-[family-name:var(--font-mono)]"
                  style={{
                    fontSize: "10px",
                    color: "#1A1C22",
                    padding: "7px 10px",
                  }}
                >
                  {c.weapon_label}
                </td>
                <td style={{ padding: "7px 10px" }}>
                  <span
                    className="flex items-center gap-[5px]"
                  >
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: c.solved ? "#22C55E" : "#C8102E",
                        display: "inline-block",
                        flexShrink: 0,
                      }}
                      data-testid={`solved-dot-${c.id}`}
                    />
                    <span
                      className="font-[family-name:var(--font-mono)]"
                      style={{
                        fontSize: "10px",
                        color: "#1A1C22",
                      }}
                    >
                      {c.solved ? "Y" : "N"}
                    </span>
                  </span>
                </td>
                <td
                  className="font-[family-name:var(--font-mono)]"
                  style={{
                    fontSize: "10px",
                    color: "#1A1C22",
                    padding: "7px 10px",
                    maxWidth: "160px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {c.agency}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
