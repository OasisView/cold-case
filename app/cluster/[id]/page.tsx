// Case file page — cluster deep dive with BackNav + white document card
// Dark #0C0C0E background, no TopNav — back bar only
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getClusterById, getCasesForCluster } from "@/lib/supabase";
import type { Cluster, Case } from "@/lib/types";
import { DEFAULT_FILTERS } from "@/lib/constants";
import BackNav from "@/components/layout/BackNav";
import CaseFileDoc from "@/components/casefile/CaseFileDoc";

export default function CaseFilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [cluster, setCluster] = useState<Cluster | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      const [clusterResult, caseResult] = await Promise.all([
        getClusterById(id, DEFAULT_FILTERS),
        getCasesForCluster(id, DEFAULT_FILTERS),
      ]);

      if (cancelled) return;

      if (clusterResult.error) {
        setError(clusterResult.error);
        setLoading(false);
        return;
      }

      if (!clusterResult.cluster) {
        setError("Cluster not found");
        setLoading(false);
        return;
      }

      setCluster(clusterResult.cluster);
      setCases(caseResult.cases);
      setLoading(false);
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Loading state — isolated block
  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center h-screen overflow-hidden"
        style={{ background: "#0C0C0E", minWidth: "1280px" }}
        data-testid="casefile-loading"
      >
        <span
          className="font-[family-name:var(--font-mono)] uppercase"
          style={{ fontSize: "10px", letterSpacing: "2px", color: "#5A6070" }}
        >
          Loading case file...
        </span>
      </div>
    );
  }

  // Error state — isolated block
  if (error || !cluster) {
    return (
      <div
        className="flex flex-col items-center justify-center h-screen overflow-hidden"
        style={{ background: "#0C0C0E", minWidth: "1280px" }}
        data-testid="casefile-error"
      >
        <div className="flex flex-col items-center gap-[12px]">
          <span
            className="font-[family-name:var(--font-mono)] uppercase"
            style={{
              fontSize: "10px",
              letterSpacing: "2px",
              color: "#C8102E",
            }}
          >
            {error === "Cluster not found" ? "Cluster Not Found" : "Error Loading Case File"}
          </span>
          <span
            className="font-[family-name:var(--font-mono)]"
            style={{
              fontSize: "10px",
              letterSpacing: "1px",
              color: "#5A6070",
            }}
          >
            {error || "An unexpected error occurred"}
          </span>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="font-[family-name:var(--font-mono)] uppercase cursor-pointer"
            style={{
              fontSize: "10px",
              letterSpacing: "2px",
              color: "#F0F2F5",
              background: "transparent",
              border: "1px solid #1F2430",
              borderRadius: "2px",
              padding: "7px 16px",
              marginTop: "8px",
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col min-h-screen overflow-hidden"
      style={{ background: "#0C0C0E", minWidth: "1280px" }}
    >
      {/* BackNav — extracted component */}
      <BackNav />

      {/* Page content — click background to return to dashboard */}
      <div
        className="flex flex-col items-center flex-1 overflow-y-auto"
        style={{ padding: "40px 32px 60px", cursor: "pointer" }}
        onClick={() => router.push("/dashboard")}
        data-testid="casefile-background"
      >
        {/* Display title above card */}
        <div
          className="overflow-hidden"
          style={{ maxWidth: "800px", width: "100%", marginBottom: "24px", cursor: "default" }}
          onClick={(e) => e.stopPropagation()}
        >
          <span
            className="font-[family-name:var(--font-display)]"
            style={{
              fontSize: "30px",
              letterSpacing: "2px",
              color: "#F0F2F5",
              lineHeight: 1,
            }}
          >
            {cluster.name.split(",")[0]}
            {cluster.name.includes(",") && (
              <span style={{ color: "#C8102E" }}>
                , {cluster.name.split(",").slice(1).join(",")}
              </span>
            )}
          </span>
        </div>

        {/* White document card — click stops propagation */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ cursor: "default", maxWidth: "800px", width: "100%" }}
        >
          <CaseFileDoc cluster={cluster} cases={cases} />
        </div>
      </div>
    </div>
  );
}
