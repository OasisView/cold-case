// ClusterStepper — +/- stepper for min cluster size, reads/writes useFilterStore
"use client";

import { useFilterStore } from "@/store/useFilterStore";
import { CLUSTER_THRESHOLD } from "@/lib/constants";

export default function ClusterStepper() {
  const minClusterSize = useFilterStore((s) => s.minClusterSize);
  const setMinClusterSize = useFilterStore((s) => s.setMinClusterSize);

  return (
    <div className="flex flex-col gap-[6px] overflow-hidden">
      <label
        className="font-[family-name:var(--font-mono)] text-muted2 uppercase"
        style={{ fontSize: "11px", letterSpacing: "2.5px" }}
      >
        Min Cluster Size
      </label>
      <div
        className="flex items-center border border-border w-full"
        style={{ borderRadius: "2px" }}
      >
        <button
          type="button"
          onClick={() =>
            setMinClusterSize(minClusterSize - CLUSTER_THRESHOLD.STEP)
          }
          disabled={minClusterSize <= CLUSTER_THRESHOLD.MIN}
          className="flex items-center justify-center bg-bg3 text-muted2 hover:text-ice disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
          style={{ width: "28px", height: "28px" }}
          aria-label="Decrease cluster size"
        >
          &minus;
        </button>
        <div
          className="flex flex-1 items-center justify-center font-[family-name:var(--font-mono)] text-ice border-x border-border"
          style={{ height: "28px", fontSize: "12px" }}
        >
          {minClusterSize}
        </div>
        <button
          type="button"
          onClick={() =>
            setMinClusterSize(minClusterSize + CLUSTER_THRESHOLD.STEP)
          }
          disabled={minClusterSize >= CLUSTER_THRESHOLD.MAX}
          className="flex items-center justify-center bg-bg3 text-muted2 hover:text-ice disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
          style={{ width: "28px", height: "28px" }}
          aria-label="Increase cluster size"
        >
          +
        </button>
      </div>
    </div>
  );
}
