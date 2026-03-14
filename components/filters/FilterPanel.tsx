// FilterPanel — 260px sidebar (collapsible to 40px) assembling all filter controls + reliability badge
"use client";

import { useState } from "react";
import { useFilterStore } from "@/store/useFilterStore";
import {
  WEAPON_FILTER_OPTIONS,
  US_STATES,
  YEAR_RANGE,
  CLUSTER_THRESHOLD,
} from "@/lib/constants";
import FilterSelect from "@/components/filters/FilterSelect";
import ClusterStepper from "@/components/filters/ClusterStepper";
import DateRangeSlider from "@/components/filters/DateRangeSlider";

export default function FilterPanel() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const dateRange = useFilterStore((s) => s.dateRange);
  const victimSex = useFilterStore((s) => s.victimSex);
  const setVictimSex = useFilterStore((s) => s.setVictimSex);
  const weaponType = useFilterStore((s) => s.weaponType);
  const setWeaponType = useFilterStore((s) => s.setWeaponType);
  const state = useFilterStore((s) => s.state);
  const setStateFilter = useFilterStore((s) => s.setStateFilter);
  const victimRace = useFilterStore((s) => s.victimRace);
  const setVictimRace = useFilterStore((s) => s.setVictimRace);
  const solveStatus = useFilterStore((s) => s.solveStatus);
  const setSolveStatus = useFilterStore((s) => s.setSolveStatus);
  const minClusterSize = useFilterStore((s) => s.minClusterSize);
  const resetFilters = useFilterStore((s) => s.resetFilters);

  // Active = not at default value
  const isDateActive =
    dateRange[0] !== YEAR_RANGE.MIN || dateRange[1] !== YEAR_RANGE.MAX;
  const isStateActive = state !== null;
  const isSexActive = victimSex !== "all";
  const isWeaponActive = weaponType !== null;
  const isRaceActive = victimRace !== "all";
  const isSolveActive = solveStatus !== "all";
  const isClusterActive = minClusterSize !== CLUSTER_THRESHOLD.DEFAULT;

  const icons: { symbol: string; active: boolean }[] = [
    { symbol: "\u{1F4C5}", active: isDateActive },
    { symbol: "\u{1F4CD}", active: isStateActive },
    { symbol: "\u{1F464}", active: isSexActive },
    { symbol: "\u2694", active: isWeaponActive },
    { symbol: "\u25C9", active: isRaceActive },
    { symbol: "\u2713", active: isSolveActive },
    { symbol: "#", active: isClusterActive },
  ];

  if (isCollapsed) {
    return (
      <aside
        className="flex flex-col bg-bg2 border-r border-border overflow-hidden shrink-0 h-full"
        style={{ width: "40px", transition: "width 200ms ease" }}
        data-testid="filter-panel"
      >
        {/* Expand chevron */}
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="font-[family-name:var(--font-mono)] cursor-pointer border-b border-border shrink-0 flex items-center justify-center"
          style={{
            height: "40px",
            fontSize: "14px",
            color: "#8A929F",
            background: "transparent",
            border: "none",
            borderBottom: "1px solid var(--border, #1F2430)",
            transition: "color 150ms ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#F0F2F5")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#8A929F")}
          data-testid="filter-expand-btn"
        >
          &#x203A;
        </button>

        {/* Icon strip */}
        <div className="flex flex-col items-center flex-1 overflow-hidden" style={{ paddingTop: "12px", gap: "14px" }}>
          {icons.map((icon, i) => (
            <span
              key={i}
              className="font-[family-name:var(--font-mono)]"
              style={{
                fontSize: "10px",
                color: icon.active ? "#C8102E" : "#2A3040",
              }}
            >
              {icon.symbol}
            </span>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside
      className="flex flex-col bg-bg2 border-r border-border overflow-hidden shrink-0 h-full"
      style={{ width: "260px", transition: "width 200ms ease" }}
      data-testid="filter-panel"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-[12px] border-b border-border shrink-0"
        style={{ height: "40px" }}
      >
        <div className="flex items-center gap-[8px]">
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            className="font-[family-name:var(--font-mono)] cursor-pointer"
            style={{
              fontSize: "14px",
              color: "#8A929F",
              background: "transparent",
              border: "none",
              padding: 0,
              lineHeight: 1,
              transition: "color 150ms ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#F0F2F5")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#8A929F")}
            data-testid="filter-collapse-btn"
          >
            &#x2039;
          </button>
          <span
            className="font-[family-name:var(--font-mono)] text-ice uppercase"
            style={{ fontSize: "13px", letterSpacing: "2.5px" }}
          >
            Filters
          </span>
        </div>
        <button
          type="button"
          onClick={resetFilters}
          className="font-[family-name:var(--font-mono)] text-red uppercase hover:text-ice transition-colors cursor-pointer"
          style={{ fontSize: "11px", letterSpacing: "2px" }}
        >
          Reset All
        </button>
      </div>

      {/* Filter blocks */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Date Range */}
        <div className="px-[12px] py-[12px] border-b border-border overflow-hidden">
          <DateRangeSlider />
        </div>

        {/* State / Region */}
        <div className="px-[12px] py-[12px] border-b border-border overflow-hidden">
          <FilterSelect
            label="State / Region"
            value={state ?? "null"}
            options={[
              { label: "All States", value: "null" },
              ...US_STATES.map((s) => ({ label: s, value: s })),
            ]}
            onChange={(v) => setStateFilter(v === "null" ? null : v)}
          />
        </div>

        {/* Victim Sex */}
        <div className="px-[12px] py-[12px] border-b border-border overflow-hidden">
          <FilterSelect
            label="Victim Sex"
            value={victimSex}
            options={[
              { label: "All", value: "all" },
              { label: "Female", value: "Female" },
              { label: "Male", value: "Male" },
            ]}
            onChange={(v) =>
              setVictimSex(v as "all" | "Female" | "Male")
            }
          />
        </div>

        {/* Weapon Type */}
        <div className="px-[12px] py-[12px] border-b border-border overflow-hidden">
          <FilterSelect
            label="Weapon Type"
            value={weaponType === null ? "null" : String(weaponType)}
            options={WEAPON_FILTER_OPTIONS.map((o) => ({
              label: o.label,
              value: o.code === null ? "null" : String(o.code),
            }))}
            onChange={(v) => setWeaponType(v === "null" ? null : Number(v))}
          />
        </div>

        {/* Victim Race */}
        <div className="px-[12px] py-[12px] border-b border-border overflow-hidden">
          <FilterSelect
            label="Victim Race"
            value={victimRace}
            options={[
              { label: "All Races", value: "all" },
              { label: "White", value: "White" },
              { label: "Black", value: "Black" },
              { label: "Asian-PI", value: "Asian-PI" },
              { label: "Native American", value: "Native American" },
            ]}
            onChange={(v) =>
              setVictimRace(
                v as "all" | "White" | "Black" | "Asian-PI" | "Native American"
              )
            }
          />
        </div>

        {/* Solve Status */}
        <div className="px-[12px] py-[12px] border-b border-border overflow-hidden">
          <FilterSelect
            label="Solve Status"
            value={solveStatus}
            options={[
              { label: "All", value: "all" },
              { label: "Unsolved Only", value: "unsolved" },
              { label: "Solved Only", value: "solved" },
            ]}
            onChange={(v) =>
              setSolveStatus(v as "all" | "unsolved" | "solved")
            }
          />
        </div>

        {/* Min Cluster Size */}
        <div className="px-[12px] py-[12px] border-b border-border overflow-hidden">
          <ClusterStepper />
        </div>
      </div>

      {/* Bottom: Reporting coverage badge */}
      <div
        className="flex items-center gap-[6px] px-[12px] border-t border-border shrink-0"
        style={{ height: "36px" }}
      >
        <span className="text-green" style={{ fontSize: "11px" }}>
          &#10003;
        </span>
        <span
          className="font-[family-name:var(--font-mono)] text-green uppercase"
          style={{ fontSize: "8px", letterSpacing: "1.5px" }}
        >
          Adequate Reporting Coverage
        </span>
      </div>
    </aside>
  );
}
