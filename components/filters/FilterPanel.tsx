// FilterPanel — 260px fixed sidebar assembling all filter controls + reliability badge
"use client";

import { useFilterStore } from "@/store/useFilterStore";
import {
  WEAPON_FILTER_OPTIONS,
  US_STATES,
} from "@/lib/constants";
import FilterSelect from "@/components/filters/FilterSelect";
import ClusterStepper from "@/components/filters/ClusterStepper";
import DateRangeSlider from "@/components/filters/DateRangeSlider";

export default function FilterPanel() {
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
  const resetFilters = useFilterStore((s) => s.resetFilters);

  return (
    <aside
      className="flex flex-col bg-bg2 border-r border-border overflow-hidden shrink-0"
      style={{ width: "260px" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-[12px] border-b border-border shrink-0"
        style={{ height: "40px" }}
      >
        <span
          className="font-[family-name:var(--font-mono)] text-ice uppercase"
          style={{ fontSize: "13px", letterSpacing: "2.5px" }}
        >
          Filters
        </span>
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
