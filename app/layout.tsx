import type { Metadata } from "next";
import { Bebas_Neue, IBM_Plex_Mono, DM_Sans } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-display",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["300", "400", "500"],
  variable: "--font-mono",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cold Case Cluster Finder",
  description:
    "Geographic intelligence tool that surfaces unsolved homicide clusters across jurisdictional boundaries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @media (max-width: 1279px) {
                .app-content { display: none !important; }
                .desktop-fallback { display: flex !important; }
              }
              @media (min-width: 1280px) {
                .desktop-fallback { display: none !important; }
              }
            `,
          }}
        />
      </head>
      <body
        className={`${bebasNeue.variable} ${ibmPlexMono.variable} ${dmSans.variable} antialiased h-full`}
        style={{ minWidth: 0 }}
      >
        {/* Desktop fallback — shown below 1280px */}
        <div
          className="desktop-fallback"
          data-testid="desktop-fallback"
          style={{
            display: "none",
            position: "fixed",
            inset: 0,
            background: "#0C0C0E",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            zIndex: 9999,
          }}
        >
          <span
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "28px",
              color: "#F0F2F5",
              letterSpacing: "3px",
            }}
          >
            COLD-CASE CLUSTER FINDER
          </span>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "14px",
              fontWeight: 300,
              color: "#8A929F",
            }}
          >
            This tool is optimized for desktop.
          </span>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "13px",
              fontWeight: 300,
              color: "#5A6070",
            }}
          >
            Please open on a screen wider than 1280px.
          </span>
        </div>

        {/* Main app content — hidden below 1280px */}
        <div className="app-content h-full">
          {children}
        </div>
      </body>
    </html>
  );
}
