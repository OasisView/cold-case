// TopNav — 64px fixed nav bar with logo, route tabs, dataset meta, live badge
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
      style={{ height: "64px", position: "fixed", top: 0, left: 0, right: 0, zIndex: 50 }}
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

    </nav>
  );
}
