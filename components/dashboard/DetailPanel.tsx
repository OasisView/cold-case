// DetailPanel — open right panel with drag handle for resizing, populates when cluster is selected in store.
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Cluster } from "@/lib/types";
import { useFilterStore } from "@/store/useFilterStore";
import { CLUSTER_HEAT } from "@/lib/constants";

interface DetailPanelProps {
  clusters: Cluster[];
}

function DetailRow({ label, value, scale }: { label: string; value: string; scale: number }) {
  return (
    <div className="flex items-center justify-between py-[8px] border-b border-border">
      <span
        className="font-[family-name:var(--font-mono)] text-muted uppercase"
        style={{ fontSize: `${Math.min(Math.round(9 * scale), 14)}px`, letterSpacing: "2px" }}
      >
        {label}
      </span>
      <span
        className="font-[family-name:var(--font-mono)] text-ice"
        style={{ fontSize: `${Math.min(Math.round(11 * scale), 18)}px`, letterSpacing: "0.5px" }}
      >
        {value}
      </span>
    </div>
  );
}

export default function DetailPanel({ clusters }: DetailPanelProps) {
  const [width, setWidth] = useState(340);
  const [dragging, setDragging] = useState(false);
  const [handleHovered, setHandleHovered] = useState(false);
  const dragStart = useRef({ x: 0, width: 340 });
  const selectedClusterId = useFilterStore((s) => s.selectedClusterId);

  const cluster = clusters.find((c) => c.id === selectedClusterId) ?? null;
  const scale = width / 340;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      dragStart.current = { x: e.clientX, width };
      setDragging(true);
      e.preventDefault();
    },
    [width]
  );

  useEffect(() => {
    if (!dragging) return;

    function handleMouseMove(e: MouseEvent) {
      const delta = dragStart.current.x - e.clientX;
      const newWidth = Math.min(
        600,
        Math.max(300, dragStart.current.width + delta)
      );
      setWidth(newWidth);
    }

    function handleMouseUp() {
      setDragging(false);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  return (
    <aside
      className="flex shrink-0 overflow-hidden border-l border-border"
      style={{
        width: `${width}px`,
        userSelect: dragging ? "none" : "auto",
      }}
    >
      {/* Drag handle — 4px strip on left edge with centered pill */}
      <div
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setHandleHovered(true)}
        onMouseLeave={() => setHandleHovered(false)}
        className="shrink-0 relative"
        style={{
          width: "4px",
          cursor: "col-resize",
          background: dragging
            ? "rgba(200,16,46,0.14)"
            : handleHovered
              ? "rgba(200,16,46,0.06)"
              : "transparent",
          transition: "background 150ms ease",
        }}
      >
        {/* Pill — centered vertically */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "3px",
            height: "32px",
            borderRadius: "999px",
            background:
              dragging || handleHovered ? "#C8102E" : "#2A2F3D",
            transition: "background 150ms ease",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Panel content */}
      <div
        className="flex flex-col flex-1 bg-bg2 overflow-hidden"
        style={{ minWidth: 0 }}
      >
        {!cluster ? (
          <div className="flex items-center justify-center flex-1">
            <span
              className="font-[family-name:var(--font-mono)] text-muted"
              style={{
                fontSize: "10px",
                letterSpacing: "1px",
                textAlign: "center",
                padding: "0 24px",
              }}
            >
              Select a cluster to view details
            </span>
          </div>
        ) : (
          <>
            {/* Header with red top border */}
            <div className="border-t-[3px] border-t-red bg-bg3 px-[16px] py-[12px] shrink-0">
              <span
                className="font-[family-name:var(--font-mono)] text-red uppercase"
                style={{ fontSize: "8px", letterSpacing: "2.5px" }}
              >
                Cluster Detail
              </span>
              <h2
                className="font-[family-name:var(--font-display)] text-ice mt-[4px]"
                style={{
                  fontSize: `${Math.min(Math.round(22 * scale), 36)}px`,
                  letterSpacing: "2px",
                  lineHeight: 1.1,
                }}
              >
                {cluster.name}
              </h2>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between px-[16px] py-[12px] bg-bg3 border-b border-border shrink-0">
              <div className="flex flex-col">
                <span
                  className="font-[family-name:var(--font-display)] text-ice"
                  style={{
                    fontSize: `${Math.min(Math.round(28 * scale), 48)}px`,
                    letterSpacing: "1px",
                    lineHeight: 1,
                  }}
                >
                  {cluster.total_cases.toLocaleString()}
                </span>
                <span
                  className="font-[family-name:var(--font-mono)] text-muted uppercase"
                  style={{ fontSize: `${Math.min(Math.round(8 * scale), 13)}px`, letterSpacing: "2px" }}
                >
                  Total Cases
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span
                  className={`font-[family-name:var(--font-display)] ${
                    cluster.solve_rate <= CLUSTER_HEAT.HOT_MAX_SOLVE_RATE
                      ? "text-red"
                      : cluster.solve_rate <= CLUSTER_HEAT.WARM_MAX_SOLVE_RATE
                        ? "text-amber"
                        : "text-ice"
                  }`}
                  style={{
                    fontSize: `${Math.min(Math.round(28 * scale), 48)}px`,
                    letterSpacing: "1px",
                    lineHeight: 1,
                  }}
                >
                  {Math.round(cluster.solve_rate * 100)}%
                </span>
                <span
                  className="font-[family-name:var(--font-mono)] text-muted uppercase"
                  style={{ fontSize: `${Math.min(Math.round(8 * scale), 13)}px`, letterSpacing: "2px" }}
                >
                  Solve Rate
                </span>
              </div>
            </div>

            {/* Status badge */}
            <div className="flex items-center gap-[6px] px-[16px] py-[8px] border-b border-border shrink-0">
              <div
                className={`rounded-full ${
                  cluster.solve_rate <= CLUSTER_HEAT.HOT_MAX_SOLVE_RATE
                    ? "bg-red"
                    : cluster.solve_rate <= CLUSTER_HEAT.WARM_MAX_SOLVE_RATE
                      ? "bg-amber"
                      : "bg-muted2"
                }`}
                style={{ width: "6px", height: "6px" }}
              />
              <span
                className={`font-[family-name:var(--font-mono)] ${
                  cluster.solve_rate <= CLUSTER_HEAT.HOT_MAX_SOLVE_RATE
                    ? "text-red"
                    : cluster.solve_rate <= CLUSTER_HEAT.WARM_MAX_SOLVE_RATE
                      ? "text-amber"
                      : "text-muted2"
                } uppercase`}
                style={{ fontSize: `${Math.min(Math.round(9 * scale), 14)}px`, letterSpacing: "2px" }}
              >
                {cluster.solve_rate <= CLUSTER_HEAT.HOT_MAX_SOLVE_RATE
                  ? "HOT"
                  : cluster.solve_rate <= CLUSTER_HEAT.WARM_MAX_SOLVE_RATE
                    ? "WARM"
                    : "COLD"}{" "}
                Cluster
              </span>
            </div>

            {/* Detail rows */}
            <div className="flex flex-col px-[16px] overflow-y-auto flex-1">
              <DetailRow
                label="Unsolved"
                value={`${cluster.unsolved_cases.toLocaleString()} cases`}
                scale={scale}
              />
              <DetailRow
                label="Jurisdictions"
                value={String(cluster.jurisdictions)}
                scale={scale}
              />
              <DetailRow label="State" value={cluster.state} scale={scale} />
              <DetailRow
                label="Year Range"
                value={`${cluster.year_start}\u2013${cluster.year_end}`}
                scale={scale}
              />
            </div>

            {/* Footer action — "OPEN CASE FILE →" with red slide-in hover */}
            <div className="px-[16px] py-[12px] border-t border-border shrink-0">
              <a
                href={`/cluster/${cluster.id}`}
                data-testid="open-case-file-btn"
                className="flex items-center justify-center font-[family-name:var(--font-display)] uppercase case-file-btn"
                style={{
                  width: "100%",
                  fontSize: `${Math.min(Math.round(13 * scale), 20)}px`,
                  letterSpacing: "3px",
                  padding: "9px 32px",
                  borderRadius: "2px",
                  border: "1px solid #C8102E",
                  color: "#C8102E",
                  textDecoration: "none",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <span style={{ position: "relative", zIndex: 1 }}>
                  Open Case File →
                </span>
              </a>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
