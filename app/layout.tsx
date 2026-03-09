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
      <body
        className={`${bebasNeue.variable} ${ibmPlexMono.variable} ${dmSans.variable} antialiased h-full`}
        style={{ minWidth: "1280px" }}
      >
        {children}
      </body>
    </html>
  );
}
