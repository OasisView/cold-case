// BullseyeBackground — 16x12 grid of concentric-ring bullseye circles with red-brown gradient
// Color logic from DESIGN.md: center cells rich dark red-brown, edges deep dark red. NOT grey.
"use client";

const COLS = 16;
const ROWS = 12;
const CX = (COLS - 1) / 2; // 7.5
const CY = (ROWS - 1) / 2; // 5.5
const MAX_DIST = Math.sqrt(CX * CX + CY * CY);

/** Pre-compute ring colors for a cell based on distance from grid center */
function getCellColors(col: number, row: number) {
  const dist = Math.sqrt((col - CX) ** 2 + (row - CY) ** 2);
  const proximity = 1 - dist / MAX_DIST; // 1.0 = center, 0.0 = corner

  const r = Math.round(55 + proximity * 80); // 55–135
  const g = Math.round(8 + proximity * 10); // 8–18
  const b = Math.round(10 + proximity * 12); // 10–22
  const alpha = 0.55 + proximity * 0.4; // 0.55–0.95

  // Outer ring
  const ring1 = `rgba(${r},${g},${b},${alpha.toFixed(2)})`;
  // Mid ring
  const ring2 = `rgba(${Math.round(r * 0.85)},${g},${b},${(alpha * 0.8).toFixed(2)})`;
  // Inner ring + dot
  const ring3 = `rgba(${Math.round(r * 0.7)},${g},${b},${(alpha * 0.65).toFixed(2)})`;

  return { ring1, ring2, ring3 };
}

export default function BullseyeBackground() {
  const cells: { col: number; row: number }[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      cells.push({ col, row });
    }
  }

  return (
    <div
      data-testid="bullseye-grid"
      style={{
        position: "absolute",
        inset: "-60px",
        display: "grid",
        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
        gridTemplateRows: `repeat(${ROWS}, 1fr)`,
        background: "#0C0A0A",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {cells.map(({ col, row }) => {
        const { ring1, ring2, ring3 } = getCellColors(col, row);
        return (
          <div
            key={`${col}-${row}`}
            data-testid="bullseye-cell"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Outer ring (58px) */}
            <div
              style={{
                width: "58px",
                height: "58px",
                borderRadius: "50%",
                border: `1.5px solid ${ring1}`,
                position: "relative",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Mid ring (38px) */}
              <div
                style={{
                  position: "absolute",
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  border: `1.5px solid ${ring2}`,
                }}
              />
              {/* Inner ring (20px) */}
              <div
                style={{
                  position: "absolute",
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  border: `1.5px solid ${ring3}`,
                }}
              />
              {/* Dot (6px) */}
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: ring3,
                  position: "relative",
                  zIndex: 1,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
