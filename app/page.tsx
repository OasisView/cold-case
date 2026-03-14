// Landing page — bullseye background + hero content + "Enter" CTA
// No TopNav. No redirect. Full viewport, overflow hidden. Phase 6.
"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { KEY_STATS } from "@/lib/constants";

const BullseyeBackground = dynamic(
  () => import("@/components/landing/BullseyeBackground"),
  { ssr: false }
);

export default function LandingPage() {
  return (
    <div
      data-testid="landing-page"
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        background: "#0C0A0A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Layer 0: Bullseye grid (absolute, inset -60px, z-index 0) */}
      <Suspense fallback={null}>
        <BullseyeBackground />
      </Suspense>

      {/* Layer 1: Radial dark overlay (absolute, inset 0, z-index 1) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at center,
            rgba(12,10,10,0.00) 0%,
            rgba(12,10,10,0.00) 35%,
            rgba(12,10,10,0.45) 60%,
            rgba(12,10,10,0.80) 78%,
            rgba(12,10,10,0.95) 92%
          )`,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Layer 2: Center glow — red bloom (absolute, z-index 2) */}
      <div
        style={{
          position: "absolute",
          width: "900px",
          height: "600px",
          background: `radial-gradient(ellipse at center,
            rgba(180,20,30,0.22) 0%,
            rgba(140,12,20,0.14) 40%,
            rgba(80,8,12,0.06) 65%,
            transparent 80%
          )`,
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

      {/* Layer 3: Landing content (relative, z-index 3) */}
      <div
        data-testid="landing-content"
        style={{
          position: "relative",
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {/* Eyebrow */}
        <span
          className="font-[family-name:var(--font-mono)] uppercase"
          data-testid="landing-eyebrow"
          style={{
            fontSize: "10px",
            letterSpacing: "4px",
            color: "#8A929F",
            marginBottom: "20px",
            animation: "fadeUp 0.9s ease-out 0.1s both",
          }}
        >
          INTELLIGENCE PLATFORM
        </span>

        {/* Headline */}
        <h1
          className="font-[family-name:var(--font-display)]"
          data-testid="landing-headline"
          style={{
            fontSize: "clamp(52px, 8vw, 88px)",
            lineHeight: 0.95,
            letterSpacing: "3px",
            margin: 0,
            animation: "fadeUp 0.9s ease-out 0.2s both",
          }}
        >
          <span style={{ color: "#F0F2F5" }}>Cold Case</span>
          <br />
          <span style={{ color: "#C8102E" }}>Network</span>
        </h1>

        {/* Tagline */}
        <p
          className="font-[family-name:var(--font-body)]"
          data-testid="landing-tagline"
          style={{
            fontSize: "14px",
            fontWeight: 300,
            color: "#8A929F",
            lineHeight: 1.7,
            marginTop: "24px",
            letterSpacing: "0.3px",
            animation: "fadeUp 0.9s ease-out 0.35s both",
          }}
        >
          What the data sees. What detectives missed.
          <br />
          The map they never made.
        </p>

        {/* Stat block */}
        <div
          data-testid="landing-stat"
          style={{
            marginTop: "36px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            animation: "fadeUp 0.9s ease-out 0.45s both",
          }}
        >
          <span
            className="font-[family-name:var(--font-display)]"
            data-testid="landing-stat-number"
            style={{
              fontSize: "52px",
              letterSpacing: "2px",
              color: "#F0F2F5",
              lineHeight: 1,
            }}
          >
            {KEY_STATS.UNSOLVED_SINCE_1980}
          </span>
          <span
            className="font-[family-name:var(--font-mono)] uppercase"
            style={{
              fontSize: "9px",
              letterSpacing: "3px",
              color: "#5A6070",
              marginTop: "8px",
            }}
          >
            Unsolved Homicides Since 1980
          </span>
        </div>

        {/* Enter button */}
        <Link
          href="/dashboard"
          data-testid="landing-enter-btn"
          className="font-[family-name:var(--font-display)] uppercase landing-enter-btn"
          style={{
            fontSize: "14px",
            letterSpacing: "4px",
            padding: "9px 32px",
            color: "#F0F2F5",
            border: "1px solid #C8102E",
            borderRadius: "2px",
            textDecoration: "none",
            marginTop: "44px",
            position: "relative",
            overflow: "hidden",
            display: "inline-block",
            animation: "fadeUp 0.9s ease-out 0.55s both",
          }}
        >
          <span style={{ position: "relative", zIndex: 1 }}>Enter</span>
        </Link>
      </div>
    </div>
  );
}
