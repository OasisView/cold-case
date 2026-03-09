// TopNav — 64px fixed nav bar with logo, route tabs, dataset meta, live badge
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { KEY_STATS } from "@/lib/constants";

const NAV_TABS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Map", href: "/map" },
  { label: "Insights", href: "/insights" },
  { label: "Methodology", href: "/methodology" },
] as const;

export default function TopNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex items-center justify-between bg-bg2 border-b border-border overflow-hidden shrink-0"
      style={{ height: "64px" }}
    >
      {/* Left: Logo + Tabs */}
      <div className="flex items-center h-full">
        {/* Logo */}
        <div className="flex items-center gap-[10px] px-[20px]">
          <div
            className="rounded-full bg-red"
            style={{ width: "9px", height: "9px" }}
          />
          <span
            className="font-[family-name:var(--font-display)] text-ice"
            style={{ fontSize: "18px", letterSpacing: "1.5px" }}
          >
            <span className="text-red">COLD</span>CASE CLUSTER FINDER
          </span>
        </div>

        {/* Divider */}
        <div className="bg-border" style={{ width: "1px", height: "28px" }} />

        {/* Tabs */}
        <div className="flex items-center h-full">
          {NAV_TABS.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center h-full px-[20px] font-[family-name:var(--font-mono)] uppercase transition-colors ${
                  isActive
                    ? "text-ice border-b-[2px] border-red"
                    : "text-muted border-b-[2px] border-transparent hover:text-muted2"
                }`}
                style={{ fontSize: "11px", letterSpacing: "2.5px" }}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Right: Dataset meta + Live badge */}
      <div className="flex items-center gap-[12px] px-[16px]">
        <span
          className="font-[family-name:var(--font-mono)] text-muted uppercase"
          style={{ fontSize: "9px", letterSpacing: "2px" }}
        >
          SHR65_23 &middot; {KEY_STATS.TOTAL_RECORDS.toLocaleString()} RECORDS
          &middot; {KEY_STATS.YEAR_START}&ndash;{KEY_STATS.YEAR_END}
        </span>

        {/* Live badge */}
        <div className="flex items-center gap-[6px]">
          <div
            className="rounded-full bg-green"
            style={{
              width: "6px",
              height: "6px",
              animation: "blink 2s ease-in-out infinite",
            }}
          />
          <span
            className="font-[family-name:var(--font-mono)] text-green uppercase"
            style={{ fontSize: "9px", letterSpacing: "2px" }}
          >
            Live Data
          </span>
        </div>
      </div>
    </nav>
  );
}
