/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import MethodologyPage from "@/app/methodology/page";
import { KEY_STATS } from "@/lib/constants";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: () => "/methodology",
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

// ── Page Structure ──
describe("MethodologyPage", () => {
  beforeEach(() => {
    render(<MethodologyPage />);
  });

  it("renders the page header", () => {
    expect(screen.getByTestId("methodology-header")).toHaveTextContent(
      "How It Works"
    );
  });

  it("renders all 3 sections", () => {
    expect(screen.getByTestId("section-algorithm")).toBeInTheDocument();
    expect(screen.getByTestId("section-data-sources")).toBeInTheDocument();
    expect(screen.getByTestId("section-limitations")).toBeInTheDocument();
  });
});

// ── Algorithm Section ──
describe("Algorithm Section", () => {
  beforeEach(() => {
    render(<MethodologyPage />);
  });

  it("displays the formula block", () => {
    expect(screen.getByTestId("formula-block")).toBeInTheDocument();
  });

  it("shows both cluster conditions", () => {
    const formula = screen.getByTestId("formula-block");
    expect(formula).toHaveTextContent("total_cases");
    expect(formula).toHaveTextContent("min_cluster_size");
    expect(formula).toHaveTextContent("solve_rate");
    expect(formula).toHaveTextContent("0.33");
  });
});

// ── Data Sources Section ──
describe("Data Sources Section", () => {
  beforeEach(() => {
    render(<MethodologyPage />);
  });

  it("renders all 3 source cards", () => {
    expect(
      screen.getByTestId("source-shr65_23-csv")
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("source-ucr65_23a-sav")
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("source-state_reporting_rates_2022-xlsx")
    ).toBeInTheDocument();
  });

  it("shows correct record count for SHR65_23", () => {
    expect(
      screen.getByTestId("source-records-shr65_23-csv")
    ).toHaveTextContent("894,636 records");
  });

  it("shows correct record count for UCR65_23a", () => {
    expect(
      screen.getByTestId("source-records-ucr65_23a-sav")
    ).toHaveTextContent("180,298 records");
  });

  it("shows correct record count for State Reporting", () => {
    expect(
      screen.getByTestId("source-records-state_reporting_rates_2022-xlsx")
    ).toHaveTextContent("51 records");
  });
});

// ── Limitations Section ──
describe("Limitations Section", () => {
  beforeEach(() => {
    render(<MethodologyPage />);
  });

  it("renders all 4 limitation items", () => {
    expect(
      screen.getByTestId("limitation-low-confidence")
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("limitation-unmatched-oris")
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("limitation-rhode-island")
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("limitation-solve-definition")
    ).toBeInTheDocument();
  });

  it("mentions low-confidence state percentages", () => {
    const item = screen.getByTestId("limitation-low-confidence");
    expect(item).toHaveTextContent("24%");
    expect(item).toHaveTextContent("48%");
    expect(item).toHaveTextContent("59%");
  });

  it("mentions 252 unmatched ORIs", () => {
    expect(
      screen.getByTestId("limitation-unmatched-oris")
    ).toHaveTextContent("252");
  });

  it("mentions Rhode Island typo fix", () => {
    expect(
      screen.getByTestId("limitation-rhode-island")
    ).toHaveTextContent("1,211 records");
  });
});
