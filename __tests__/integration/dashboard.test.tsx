/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useFilterStore } from "@/store/useFilterStore";
import { MOCK_CLUSTERS } from "@/lib/mock-data";
import StatBar from "@/components/dashboard/StatBar";
import ClusterList from "@/components/dashboard/ClusterList";
import DetailPanel from "@/components/dashboard/DetailPanel";
import FilterSelect from "@/components/filters/FilterSelect";
import ClusterStepper from "@/components/filters/ClusterStepper";

// Mock next/navigation for components that use usePathname
jest.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
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

// Reset store between tests
beforeEach(() => {
  useFilterStore.getState().resetFilters();
});

// ── FilterSelect + useFilterStore ──
describe("FilterSelect integration", () => {
  it("renders with correct value and calls onChange", () => {
    const onChange = jest.fn();
    render(
      <FilterSelect
        label="Test Filter"
        value="all"
        options={[
          { label: "All", value: "all" },
          { label: "Option A", value: "a" },
          { label: "Option B", value: "b" },
        ]}
        onChange={onChange}
      />
    );

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("All");

    // Open dropdown and click an option
    fireEvent.click(trigger);
    const optionA = screen.getByRole("option", { name: "Option A" });
    fireEvent.click(optionA);
    expect(onChange).toHaveBeenCalledWith("a");
  });
});

describe("ClusterStepper integration", () => {
  it("renders current value from store", () => {
    render(<ClusterStepper />);
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("increments value when + is clicked", () => {
    render(<ClusterStepper />);
    const incrementBtn = screen.getByLabelText("Increase cluster size");
    fireEvent.click(incrementBtn);
    expect(useFilterStore.getState().minClusterSize).toBe(15);
  });

  it("decrements value when - is clicked", () => {
    render(<ClusterStepper />);
    const decrementBtn = screen.getByLabelText("Decrease cluster size");
    fireEvent.click(decrementBtn);
    expect(useFilterStore.getState().minClusterSize).toBe(5);
  });

  it("disables - at minimum (5)", () => {
    useFilterStore.getState().setMinClusterSize(5);
    render(<ClusterStepper />);
    const decrementBtn = screen.getByLabelText("Decrease cluster size");
    expect(decrementBtn).toBeDisabled();
  });

  it("disables + at maximum (50)", () => {
    useFilterStore.getState().setMinClusterSize(50);
    render(<ClusterStepper />);
    const incrementBtn = screen.getByLabelText("Increase cluster size");
    expect(incrementBtn).toBeDisabled();
  });
});

// ── StatBar renders correct mock counts ──
describe("StatBar", () => {
  it("renders all 4 stat cards with correct values", () => {
    render(
      <StatBar
        totalCases={7192}
        totalUnsolved={4725}
        clusterCount={6}
        jurisdictions={14}
        overallSolveRate={0.343}
        loading={false}
      />
    );

    expect(screen.getByText("7,192")).toBeInTheDocument();
    expect(screen.getByText("4,725")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("14")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(
      <StatBar
        totalCases={0}
        totalUnsolved={0}
        clusterCount={0}
        jurisdictions={0}
        overallSolveRate={0}
        loading={true}
      />
    );

    expect(screen.getByText("LOADING...")).toBeInTheDocument();
  });

  it("renders labels", () => {
    render(
      <StatBar
        totalCases={100}
        totalUnsolved={50}
        clusterCount={3}
        jurisdictions={5}
        overallSolveRate={0.5}
        loading={false}
      />
    );

    expect(screen.getByText("Total Cases")).toBeInTheDocument();
    expect(screen.getByText("Unsolved")).toBeInTheDocument();
    expect(screen.getByText("Clusters Flagged")).toBeInTheDocument();
    expect(screen.getByText("Jurisdictions")).toBeInTheDocument();
  });
});

// ── ClusterList sorts correctly ──
describe("ClusterList", () => {
  it("renders clusters sorted by unsolved count descending", () => {
    render(
      <ClusterList clusters={MOCK_CLUSTERS} loading={false} />
    );

    // DC has 4677 unsolved (highest), King has 25
    const rows = screen.getAllByRole("button");
    expect(rows[0]).toHaveTextContent("District of Columbia");
    expect(rows[1]).toHaveTextContent("King County, WA");
  });

  it("shows cluster count in header", () => {
    render(
      <ClusterList clusters={MOCK_CLUSTERS} loading={false} />
    );

    expect(screen.getByText(`${MOCK_CLUSTERS.length} clusters`)).toBeInTheDocument();
  });

  it("shows empty state when no clusters", () => {
    render(<ClusterList clusters={[]} loading={false} />);
    expect(
      screen.getByText("No clusters match current filters")
    ).toBeInTheDocument();
  });

  it("shows error state", () => {
    render(
      <ClusterList
        clusters={[]}
        loading={false}
        error="Failed to load clusters"
      />
    );
    expect(screen.getByText("Failed to load clusters")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(<ClusterList clusters={[]} loading={true} />);
    expect(screen.getByText("LOADING CLUSTERS...")).toBeInTheDocument();
  });

  it("clicking a cluster sets selectedClusterId in store", () => {
    render(
      <ClusterList clusters={MOCK_CLUSTERS} loading={false} />
    );

    const dcRow = screen.getByText("District of Columbia").closest("button")!;
    fireEvent.click(dcRow);
    expect(useFilterStore.getState().selectedClusterId).toBe("dc-district");
  });
});

// ── DetailPanel populates on cluster selection ──
describe("DetailPanel", () => {
  it("shows empty state when no cluster selected", () => {
    render(<DetailPanel clusters={MOCK_CLUSTERS} />);
    expect(
      screen.getByText("Select a cluster to view details")
    ).toBeInTheDocument();
  });

  it("shows cluster details when selected", () => {
    useFilterStore.getState().setSelectedClusterId("wa-king");
    render(<DetailPanel clusters={MOCK_CLUSTERS} />);

    expect(screen.getByText("King County, WA")).toBeInTheDocument();
    expect(screen.getByText("52")).toBeInTheDocument();
    expect(screen.getByText("52%")).toBeInTheDocument();
    expect(screen.getByText("25 cases")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("Washington")).toBeInTheDocument();
  });

  it("shows DC cluster when selected", () => {
    useFilterStore.getState().setSelectedClusterId("dc-district");
    render(<DetailPanel clusters={MOCK_CLUSTERS} />);

    const dcTexts = screen.getAllByText("District of Columbia");
    expect(dcTexts.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("7,108")).toBeInTheDocument();
    expect(screen.getByText("34%")).toBeInTheDocument();
    expect(screen.getByText("WARM Cluster")).toBeInTheDocument();
  });

  it("shows Open Case File link with correct href", () => {
    useFilterStore.getState().setSelectedClusterId("wa-king");
    render(<DetailPanel clusters={MOCK_CLUSTERS} />);

    const link = screen.getByText("Open Case File");
    expect(link).toHaveAttribute("href", "/cluster/wa-king");
  });
});
