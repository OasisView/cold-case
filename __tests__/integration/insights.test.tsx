/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import InsightsPage from "@/app/insights/page";
import {
  RACIAL_SOLVE_GAP,
  WORST_JURISDICTIONS,
  NATIONAL_TREND,
  STATE_RELIABILITY,
} from "@/lib/constants";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: () => "/insights",
}));

// Mock next/link
jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

describe("InsightsPage", () => {
  beforeEach(() => {
    render(<InsightsPage />);
  });

  it("renders the DATA INSIGHTS eyebrow", () => {
    expect(screen.getByTestId("insights-eyebrow")).toHaveTextContent(
      "Data Insights"
    );
  });

  it("renders all 4 finding cards", () => {
    expect(screen.getByTestId("finding-racial-gap")).toBeInTheDocument();
    expect(screen.getByTestId("finding-jurisdictions")).toBeInTheDocument();
    expect(screen.getByTestId("finding-national-trend")).toBeInTheDocument();
    expect(screen.getByTestId("finding-reliability")).toBeInTheDocument();
  });
});

// ── Finding 01: Racial Gap ──
describe("Finding 01 — Racial Solve Rate Gap", () => {
  beforeEach(() => {
    render(<InsightsPage />);
  });

  it("renders all 4 decade rows", () => {
    for (const row of RACIAL_SOLVE_GAP) {
      expect(screen.getByTestId(`gap-row-${row.decade}`)).toBeInTheDocument();
    }
  });

  it("displays correct gap values from constants", () => {
    expect(screen.getByTestId("gap-label-1980s")).toHaveTextContent("+0.3pp");
    expect(screen.getByTestId("gap-label-1990s")).toHaveTextContent("+7.4pp");
    expect(screen.getByTestId("gap-label-2000s")).toHaveTextContent("+12.5pp");
    expect(screen.getByTestId("gap-label-2010s")).toHaveTextContent("+17.8pp");
  });

  it("displays correct Black solve rates from constants", () => {
    expect(screen.getByTestId("black-rate-1980s")).toHaveTextContent("73%");
    expect(screen.getByTestId("black-rate-1990s")).toHaveTextContent("64.9%");
    expect(screen.getByTestId("black-rate-2000s")).toHaveTextContent("62.7%");
    expect(screen.getByTestId("black-rate-2010s")).toHaveTextContent("61.4%");
  });

  it("displays correct White solve rates from constants", () => {
    expect(screen.getByTestId("white-rate-1980s")).toHaveTextContent("73.3%");
    expect(screen.getByTestId("white-rate-1990s")).toHaveTextContent("72.3%");
    expect(screen.getByTestId("white-rate-2000s")).toHaveTextContent("75.2%");
    expect(screen.getByTestId("white-rate-2010s")).toHaveTextContent("79.1%");
  });
});

// ── Finding 02: Jurisdictions ──
describe("Finding 02 — Jurisdictional Accountability", () => {
  beforeEach(() => {
    render(<InsightsPage />);
  });

  it("renders all 3 jurisdiction bars", () => {
    expect(
      screen.getByTestId("jurisdiction-district-of-columbia")
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("jurisdiction-san-mateo-ca")
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("jurisdiction-los-angeles-ca")
    ).toBeInTheDocument();
  });

  it("displays correct solve rates", () => {
    expect(
      screen.getByTestId("solve-rate-district-of-columbia")
    ).toHaveTextContent("34.2%");
    expect(screen.getByTestId("solve-rate-san-mateo-ca")).toHaveTextContent(
      "32.9%"
    );
    expect(screen.getByTestId("solve-rate-los-angeles-ca")).toHaveTextContent(
      "38.3%"
    );
  });

  it("displays correct case counts", () => {
    const card = screen.getByTestId("finding-jurisdictions");
    expect(card).toHaveTextContent("7,108 cases");
    expect(card).toHaveTextContent("283 cases");
    expect(card).toHaveTextContent("1,113 cases");
  });
});

// ── Finding 03: National Trend ──
describe("Finding 03 — National Trend", () => {
  beforeEach(() => {
    render(<InsightsPage />);
  });

  it("displays peak year and count", () => {
    expect(screen.getByTestId("peak-year")).toHaveTextContent("2022");
    expect(screen.getByTestId("peak-count")).toHaveTextContent("20,306");
  });

  it("displays latest year and count", () => {
    expect(screen.getByTestId("latest-year")).toHaveTextContent("2024");
    expect(screen.getByTestId("latest-count")).toHaveTextContent("15,795");
  });

  it("displays decline percentage in amber", () => {
    expect(screen.getByTestId("decline-label")).toHaveTextContent("22%");
  });
});

// ── Finding 04: Data Reliability ──
describe("Finding 04 — Data Reliability", () => {
  beforeEach(() => {
    render(<InsightsPage />);
  });

  it("renders all 5 state cells", () => {
    expect(screen.getByTestId("reliability-MS")).toBeInTheDocument();
    expect(screen.getByTestId("reliability-FL")).toBeInTheDocument();
    expect(screen.getByTestId("reliability-IA")).toBeInTheDocument();
    expect(screen.getByTestId("reliability-WA")).toBeInTheDocument();
    expect(screen.getByTestId("reliability-VA")).toBeInTheDocument();
  });

  it("displays correct percentages", () => {
    expect(screen.getByTestId("reliability-MS")).toHaveTextContent("24%");
    expect(screen.getByTestId("reliability-FL")).toHaveTextContent("48%");
    expect(screen.getByTestId("reliability-IA")).toHaveTextContent("59%");
    expect(screen.getByTestId("reliability-WA")).toHaveTextContent("92%");
    expect(screen.getByTestId("reliability-VA")).toHaveTextContent("100%");
  });

  it("shows correct confidence labels with matching colors", () => {
    expect(screen.getByTestId("reliability-label-MS")).toHaveTextContent("LOW");
    expect(screen.getByTestId("reliability-label-FL")).toHaveTextContent("LOW");
    expect(screen.getByTestId("reliability-label-IA")).toHaveTextContent(
      "MEDIUM"
    );
    expect(screen.getByTestId("reliability-label-WA")).toHaveTextContent(
      "HIGH"
    );
    expect(screen.getByTestId("reliability-label-VA")).toHaveTextContent(
      "HIGH"
    );
  });
});
