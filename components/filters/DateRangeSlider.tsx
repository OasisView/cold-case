// DateRangeSlider — dual-thumb range slider for year filtering (1976–2023)
"use client";

import { useFilterStore } from "@/store/useFilterStore";
import { YEAR_RANGE } from "@/lib/constants";

export default function DateRangeSlider() {
  const dateRange = useFilterStore((s) => s.dateRange);
  const setDateRange = useFilterStore((s) => s.setDateRange);

  const totalSpan = YEAR_RANGE.MAX - YEAR_RANGE.MIN;
  const leftPct = ((dateRange[0] - YEAR_RANGE.MIN) / totalSpan) * 100;
  const rightPct = ((dateRange[1] - YEAR_RANGE.MIN) / totalSpan) * 100;

  return (
    <div className="flex flex-col gap-[6px] overflow-hidden">
      <label
        className="font-[family-name:var(--font-mono)] text-muted2 uppercase"
        style={{ fontSize: "11px", letterSpacing: "2.5px" }}
      >
        Date Range
      </label>

      {/* Year labels */}
      <div className="flex items-center justify-between">
        <span
          className="font-[family-name:var(--font-mono)] text-amber"
          style={{ fontSize: "11px", letterSpacing: "1px" }}
        >
          {dateRange[0]}
        </span>
        <span
          className="font-[family-name:var(--font-mono)] text-amber"
          style={{ fontSize: "11px", letterSpacing: "1px" }}
        >
          {dateRange[1]}
        </span>
      </div>

      {/* Dual range slider */}
      <div className="relative" style={{ height: "20px" }}>
        {/* Track background */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-full bg-border"
          style={{ height: "2px", borderRadius: "1px" }}
        />
        {/* Active track */}
        <div
          className="absolute top-1/2 -translate-y-1/2 bg-amber"
          style={{
            height: "2px",
            borderRadius: "1px",
            left: `${leftPct}%`,
            width: `${rightPct - leftPct}%`,
          }}
        />
        {/* Start thumb input */}
        <input
          type="range"
          min={YEAR_RANGE.MIN}
          max={YEAR_RANGE.MAX}
          value={dateRange[0]}
          onChange={(e) => {
            const val = Number(e.target.value);
            setDateRange([val, dateRange[1]]);
          }}
          className="date-range-thumb absolute top-0 left-0 w-full"
          style={{ height: "20px" }}
          aria-label="Start year"
        />
        {/* End thumb input */}
        <input
          type="range"
          min={YEAR_RANGE.MIN}
          max={YEAR_RANGE.MAX}
          value={dateRange[1]}
          onChange={(e) => {
            const val = Number(e.target.value);
            setDateRange([dateRange[0], val]);
          }}
          className="date-range-thumb absolute top-0 left-0 w-full"
          style={{ height: "20px" }}
          aria-label="End year"
        />
      </div>
    </div>
  );
}
