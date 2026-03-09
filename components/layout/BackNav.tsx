// BackNav — case file back bar with arrow + "CLUSTER DEEP DIVE" eyebrow
"use client";

import { useRouter } from "next/navigation";

export default function BackNav() {
  const router = useRouter();

  return (
    <nav
      className="flex items-center justify-between overflow-hidden shrink-0"
      style={{
        height: "56px",
        padding: "0 32px",
        background: "#111216",
        borderBottom: "1px solid #1F2430",
      }}
      data-testid="back-nav"
    >
      {/* Left: Back button */}
      <button
        type="button"
        onClick={() => router.push("/dashboard")}
        className="font-[family-name:var(--font-mono)] cursor-pointer transition-colors"
        style={{
          fontSize: "13px",
          letterSpacing: "1.5px",
          color: "#F0F2F5",
          background: "transparent",
          border: "none",
          borderBottom: "1px solid transparent",
          padding: "2px 0",
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLElement).style.borderBottomColor = "#C8102E";
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLElement).style.borderBottomColor = "transparent";
        }}
        data-testid="back-btn"
      >
        <span style={{ fontSize: "16px", marginRight: "6px" }}>←</span>
        Back to Dashboard
      </button>

      {/* Right: Eyebrow */}
      <span
        className="font-[family-name:var(--font-mono)] uppercase"
        style={{
          fontSize: "9px",
          letterSpacing: "2px",
          color: "#C8102E",
        }}
      >
        Cluster Deep Dive
      </span>
    </nav>
  );
}
