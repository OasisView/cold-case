/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { KEY_STATS } from "@/lib/constants";

// Mock next/dynamic to render BullseyeBackground synchronously
jest.mock("next/dynamic", () => {
  return function mockDynamic(
    loader: () => Promise<{ default: React.ComponentType }>,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const BullseyeBackground = require("@/components/landing/BullseyeBackground").default;
    return BullseyeBackground;
  };
});

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

// Import after mocks
import LandingPage from "@/app/page";

// ── Page Structure ──
describe("LandingPage", () => {
  beforeEach(() => {
    render(<LandingPage />);
  });

  it("renders without crashing", () => {
    expect(screen.getByTestId("landing-page")).toBeInTheDocument();
  });

  it("renders the landing content container", () => {
    expect(screen.getByTestId("landing-content")).toBeInTheDocument();
  });

  it("has no TopNav", () => {
    expect(screen.queryByTestId("top-nav")).not.toBeInTheDocument();
  });
});

// ── Eyebrow ──
describe("Landing Eyebrow", () => {
  beforeEach(() => {
    render(<LandingPage />);
  });

  it("renders the eyebrow text", () => {
    expect(screen.getByTestId("landing-eyebrow")).toHaveTextContent(
      "Cold Case Intelligence Platform"
    );
  });
});

// ── Headline ──
describe("Landing Headline", () => {
  beforeEach(() => {
    render(<LandingPage />);
  });

  it("renders 'Cold. Clustered.' and 'Connected.'", () => {
    const headline = screen.getByTestId("landing-headline");
    expect(headline).toHaveTextContent("Cold. Clustered.");
    expect(headline).toHaveTextContent("Connected.");
  });
});

// ── Tagline ──
describe("Landing Tagline", () => {
  beforeEach(() => {
    render(<LandingPage />);
  });

  it("renders the tagline text", () => {
    const tagline = screen.getByTestId("landing-tagline");
    expect(tagline).toHaveTextContent("What the data sees.");
    expect(tagline).toHaveTextContent("What detectives missed.");
    expect(tagline).toHaveTextContent("The map they never made.");
  });
});

// ── Stat Block ──
describe("Landing Stat Block", () => {
  beforeEach(() => {
    render(<LandingPage />);
  });

  it("renders stat number from KEY_STATS constant", () => {
    expect(screen.getByTestId("landing-stat-number")).toHaveTextContent(
      KEY_STATS.UNSOLVED_SINCE_1980
    );
  });

  it("renders stat label", () => {
    const stat = screen.getByTestId("landing-stat");
    expect(stat).toHaveTextContent("Unsolved Homicides Since 1980");
  });
});

// ── Enter Button ──
describe("Landing Enter Button", () => {
  beforeEach(() => {
    render(<LandingPage />);
  });

  it("renders the ENTER button", () => {
    expect(screen.getByTestId("landing-enter-btn")).toBeInTheDocument();
  });

  it("ENTER button navigates to /dashboard", () => {
    const btn = screen.getByTestId("landing-enter-btn");
    expect(btn).toHaveAttribute("href", "/dashboard");
  });

  it("ENTER button text is 'Enter'", () => {
    expect(screen.getByTestId("landing-enter-btn")).toHaveTextContent("Enter");
  });
});

// ── BullseyeBackground ──
describe("BullseyeBackground", () => {
  beforeEach(() => {
    render(<LandingPage />);
  });

  it("renders the bullseye grid", () => {
    expect(screen.getByTestId("bullseye-grid")).toBeInTheDocument();
  });

  it("renders 192 bullseye cells (16 x 12)", () => {
    const cells = screen.getAllByTestId("bullseye-cell");
    expect(cells).toHaveLength(192);
  });
});
