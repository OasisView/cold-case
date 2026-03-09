// BackNav — case file back bar with arrow + "CLUSTER DEEP DIVE" eyebrow
"use client";

import Link from "next/link";

export default function BackNav() {
  return (
    <nav
      className="flex items-center justify-between bg-bg2 border-b border-border overflow-hidden shrink-0 px-[16px]"
      style={{ height: "50px" }}
    >
      {/* Left: Back link */}
      <Link
        href="/dashboard"
        className="font-[family-name:var(--font-mono)] text-muted hover:text-ice transition-colors"
        style={{ fontSize: "9px", letterSpacing: "1px" }}
      >
        &larr; Back to Dashboard
      </Link>

      {/* Right: Eyebrow */}
      <span
        className="font-[family-name:var(--font-mono)] text-red uppercase"
        style={{ fontSize: "9px", letterSpacing: "2px" }}
      >
        CLUSTER DEEP DIVE
      </span>
    </nav>
  );
}
