/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MOCK_CLUSTERS, MOCK_CASES } from "@/lib/mock-data";
import CaseFileDoc from "@/components/casefile/CaseFileDoc";
import StoryBrief from "@/components/casefile/StoryBrief";
import MiniCaseTable from "@/components/casefile/MiniCaseTable";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useParams: () => ({ id: "wa-king" }),
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/cluster/wa-king",
}));

// ── King County cluster (Green River demo) ──
const kingCounty = MOCK_CLUSTERS.find((c) => c.id === "wa-king")!;
const kingCases = MOCK_CASES.filter((c) => c.county_fips === "53033");

// ── DC cluster ──
const dcCluster = MOCK_CLUSTERS.find((c) => c.id === "dc-district")!;

// ── CaseFileDoc ──
describe("CaseFileDoc", () => {
  it("renders all 4 sections with correct testids", () => {
    render(<CaseFileDoc cluster={kingCounty} cases={kingCases} />);
    expect(screen.getByTestId("casefile-doc")).toBeInTheDocument();
    expect(screen.getByTestId("casefile-header")).toBeInTheDocument();
    expect(screen.getByTestId("detail-grid")).toBeInTheDocument();
    expect(screen.getByTestId("story-brief")).toBeInTheDocument();
    expect(screen.getByTestId("casefile-footer")).toBeInTheDocument();
  });

  it("displays cluster name in header", () => {
    render(<CaseFileDoc cluster={kingCounty} cases={kingCases} />);
    const header = screen.getByTestId("casefile-header");
    expect(header).toHaveTextContent("King County, WA");
  });

  it("displays case count in header", () => {
    render(<CaseFileDoc cluster={kingCounty} cases={kingCases} />);
    expect(screen.getByTestId("header-case-count")).toHaveTextContent("52");
  });

  it("displays blinking red dot", () => {
    render(<CaseFileDoc cluster={kingCounty} cases={kingCases} />);
    expect(screen.getByTestId("blink-dot")).toBeInTheDocument();
  });

  it("displays ACTIVE CLUSTER eyebrow", () => {
    render(<CaseFileDoc cluster={kingCounty} cases={kingCases} />);
    expect(
      screen.getByText("Active Cluster — Priority Review")
    ).toBeInTheDocument();
  });

  it("renders Download Brief button", () => {
    render(<CaseFileDoc cluster={kingCounty} cases={kingCases} />);
    expect(screen.getByTestId("download-btn")).toHaveTextContent(
      "Download Brief"
    );
  });

  it("renders DC cluster with formatted case count", () => {
    render(<CaseFileDoc cluster={dcCluster} cases={[]} />);
    expect(screen.getByTestId("header-case-count")).toHaveTextContent("7,108");
  });

  it("renders year range in header", () => {
    render(<CaseFileDoc cluster={kingCounty} cases={kingCases} />);
    const header = screen.getByTestId("casefile-header");
    expect(header).toHaveTextContent("1980–2000");
  });
});

// ── StoryBrief ──
describe("StoryBrief", () => {
  it("renders with correct testid", () => {
    render(<StoryBrief cluster={kingCounty} />);
    expect(screen.getByTestId("story-brief")).toBeInTheDocument();
  });

  it("renders AI GENERATED badge", () => {
    render(<StoryBrief cluster={kingCounty} />);
    expect(screen.getByTestId("ai-badge")).toHaveTextContent("AI Generated");
  });

  it("includes cluster name in narrative", () => {
    render(<StoryBrief cluster={kingCounty} />);
    expect(screen.getByTestId("story-body")).toHaveTextContent(
      "King County, WA"
    );
  });

  it("includes correct year range in narrative", () => {
    render(<StoryBrief cluster={kingCounty} />);
    const body = screen.getByTestId("story-body").textContent!;
    expect(body).toContain("1980");
    expect(body).toContain("2000");
  });

  it("includes total cases in narrative", () => {
    render(<StoryBrief cluster={kingCounty} />);
    expect(screen.getByTestId("story-body")).toHaveTextContent("52");
  });

  it("includes unsolved count in narrative", () => {
    render(<StoryBrief cluster={kingCounty} />);
    expect(screen.getByTestId("story-body")).toHaveTextContent("25");
  });

  it("includes solve rate percentage in narrative", () => {
    render(<StoryBrief cluster={kingCounty} />);
    expect(screen.getByTestId("story-body")).toHaveTextContent("52%");
  });

  it("includes jurisdictions in narrative", () => {
    render(<StoryBrief cluster={kingCounty} />);
    expect(screen.getByTestId("story-body")).toHaveTextContent(
      "4 jurisdictions"
    );
  });

  it("uses singular 'jurisdiction' for DC cluster", () => {
    render(<StoryBrief cluster={dcCluster} />);
    expect(screen.getByTestId("story-body")).toHaveTextContent(
      "1 jurisdiction"
    );
  });

  it("generates correct narrative for DC", () => {
    render(<StoryBrief cluster={dcCluster} />);
    const body = screen.getByTestId("story-body").textContent!;
    expect(body).toContain("7,108");
    expect(body).toContain("4,677");
    expect(body).toContain("34%");
  });
});

// ── MiniCaseTable ──
describe("MiniCaseTable", () => {
  it("renders table with correct testid", () => {
    render(<MiniCaseTable cases={kingCases} />);
    expect(screen.getByTestId("case-table")).toBeInTheDocument();
  });

  it("renders all 6 column headers", () => {
    render(<MiniCaseTable cases={kingCases} />);
    expect(screen.getByText("Year")).toBeInTheDocument();
    expect(screen.getByText("Victim")).toBeInTheDocument();
    expect(screen.getByText("Age")).toBeInTheDocument();
    expect(screen.getByText("Weapon")).toBeInTheDocument();
    expect(screen.getByText("Solved")).toBeInTheDocument();
    expect(screen.getByText("Agency")).toBeInTheDocument();
  });

  it("renders correct number of case rows", () => {
    render(<MiniCaseTable cases={kingCases} />);
    for (const c of kingCases) {
      expect(screen.getByTestId(`case-row-${c.id}`)).toBeInTheDocument();
    }
  });

  it("renders solved indicator dots with correct colors", () => {
    render(<MiniCaseTable cases={kingCases} />);
    // case-001 is unsolved — red dot
    const unsolvedDot = screen.getByTestId("solved-dot-case-001");
    expect(unsolvedDot).toHaveStyle({ background: "#C8102E" });
    // case-002 is solved — green dot
    const solvedDot = screen.getByTestId("solved-dot-case-002");
    expect(solvedDot).toHaveStyle({ background: "#22C55E" });
  });

  it("shows Y/N text for solved status", () => {
    render(<MiniCaseTable cases={kingCases} />);
    // case-001 unsolved = N, case-002 solved = Y
    const rows = screen.getAllByText("N");
    expect(rows.length).toBeGreaterThanOrEqual(1);
    const yRows = screen.getAllByText("Y");
    expect(yRows.length).toBeGreaterThanOrEqual(1);
  });

  it("renders empty state when no cases", () => {
    render(<MiniCaseTable cases={[]} />);
    expect(screen.getByTestId("case-table-empty")).toBeInTheDocument();
  });

  it("displays weapon label for each case", () => {
    render(<MiniCaseTable cases={kingCases} />);
    const strangulations = screen.getAllByText("Strangulation");
    expect(strangulations.length).toBe(kingCases.length);
  });

  it("displays agency for each case", () => {
    render(<MiniCaseTable cases={kingCases} />);
    expect(
      screen.getAllByText("Seattle Police Department").length
    ).toBeGreaterThanOrEqual(1);
  });
});
