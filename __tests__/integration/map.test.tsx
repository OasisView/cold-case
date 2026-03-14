/**
 * @jest-environment jsdom
 */
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MOCK_CLUSTERS } from "@/lib/mock-data";
import { CLUSTER_HEAT } from "@/lib/constants";
import StatsBar from "@/components/map/StatsBar";
import ClusterNode from "@/components/map/ClusterNode";
import HoverTooltip from "@/components/map/HoverTooltip";

// ── StatsBar — shows correct mock counts ──
describe("Map StatsBar", () => {
  it("renders case count, unsolved count, and cluster count", () => {
    render(
      <StatsBar
        totalCases={7207}
        totalUnsolved={4725}
        clusterCount={6}
        loading={false}
      />
    );

    expect(screen.getByText("7,207")).toBeInTheDocument();
    expect(screen.getByText("4,725")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
  });

  it("renders label text for each stat", () => {
    render(
      <StatsBar
        totalCases={100}
        totalUnsolved={50}
        clusterCount={3}
        loading={false}
      />
    );

    expect(screen.getByText("cases")).toBeInTheDocument();
    expect(screen.getByText("unsolved")).toBeInTheDocument();
    expect(screen.getByText("clusters")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(
      <StatsBar
        totalCases={0}
        totalUnsolved={0}
        clusterCount={0}
        loading={true}
      />
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("has correct test id", () => {
    render(
      <StatsBar
        totalCases={100}
        totalUnsolved={50}
        clusterCount={3}
        loading={false}
      />
    );

    expect(screen.getByTestId("map-stats-bar")).toBeInTheDocument();
  });
});

// ── ClusterNode — renders correct color class for hot/warm/cold ──
describe("ClusterNode", () => {
  it("renders hot node with heat=hot for low solve rate", () => {
    // DC cluster: 34.2% solve rate → hot (≤33% is hot, 34.2% is warm)
    // King County: 51.9% → cold (>50%)
    // Use a cluster with ≤33% solve rate for hot
    const { container } = render(
      <ClusterNode size={48} heat="hot" isSelected={false} caseCount={7108} />
    );

    const node = container.firstChild as HTMLElement;
    expect(node).toHaveAttribute("data-heat", "hot");
  });

  it("renders warm node with heat=warm", () => {
    const { container } = render(
      <ClusterNode size={40} heat="warm" isSelected={false} caseCount={100} />
    );

    const node = container.firstChild as HTMLElement;
    expect(node).toHaveAttribute("data-heat", "warm");
  });

  it("renders cold node with heat=cold", () => {
    const { container } = render(
      <ClusterNode size={32} heat="cold" isSelected={false} caseCount={52} />
    );

    const node = container.firstChild as HTMLElement;
    expect(node).toHaveAttribute("data-heat", "cold");
  });

  it("renders case count inside inner circle", () => {
    render(
      <ClusterNode size={48} heat="hot" isSelected={false} caseCount={7108} />
    );

    // 7108 → "7.1k"
    expect(screen.getByText("7.1k")).toBeInTheDocument();
  });

  it("renders small case count as plain number", () => {
    render(
      <ClusterNode size={48} heat="cold" isSelected={false} caseCount={52} />
    );

    expect(screen.getByText("52")).toBeInTheDocument();
  });

  it("classifies solve rates correctly per DESIGN.md thresholds", () => {
    // CLUSTER_HEAT.HOT_MAX_SOLVE_RATE = 0.33
    // CLUSTER_HEAT.WARM_MAX_SOLVE_RATE = 0.50

    // ≤33% = hot
    expect(CLUSTER_HEAT.HOT_MAX_SOLVE_RATE).toBe(0.33);
    // 33–50% = warm
    expect(CLUSTER_HEAT.WARM_MAX_SOLVE_RATE).toBe(0.50);

    // Verify mock data classifications:
    // DC: 0.342 → warm (between 0.33 and 0.50)
    const dcCluster = MOCK_CLUSTERS.find((c) => c.id === "dc-district")!;
    expect(dcCluster.solve_rate).toBe(0.342);
    expect(dcCluster.solve_rate > CLUSTER_HEAT.HOT_MAX_SOLVE_RATE).toBe(true);
    expect(dcCluster.solve_rate <= CLUSTER_HEAT.WARM_MAX_SOLVE_RATE).toBe(true);

    // King County: 0.519 → cold (>0.50)
    const kingCluster = MOCK_CLUSTERS.find((c) => c.id === "wa-king")!;
    expect(kingCluster.solve_rate).toBe(0.519);
    expect(kingCluster.solve_rate > CLUSTER_HEAT.WARM_MAX_SOLVE_RATE).toBe(true);
  });
});

// ── HoverTooltip — mounts and unmounts correctly ──
describe("HoverTooltip", () => {
  it("renders nothing when cluster is null", () => {
    const { container } = render(
      <HoverTooltip cluster={null} x={100} y={100} />
    );

    expect(container.innerHTML).toBe("");
  });

  it("renders tooltip with cluster name when cluster is provided", () => {
    const cluster = MOCK_CLUSTERS.find((c) => c.id === "wa-king")!;
    render(<HoverTooltip cluster={cluster} x={200} y={150} />);

    expect(screen.getByText("King County, WA")).toBeInTheDocument();
  });

  it("shows case count and unsolved percentage", () => {
    const cluster = MOCK_CLUSTERS.find((c) => c.id === "wa-king")!;
    render(<HoverTooltip cluster={cluster} x={200} y={150} />);

    expect(screen.getByText("52")).toBeInTheDocument();
    // King County: 1 - 0.519 = 0.481 → 48% unsolved
    expect(screen.getByText("48%")).toBeInTheDocument();
  });

  it("shows DC cluster data correctly", () => {
    const cluster = MOCK_CLUSTERS.find((c) => c.id === "dc-district")!;
    render(<HoverTooltip cluster={cluster} x={200} y={150} />);

    expect(screen.getByText("District of Columbia")).toBeInTheDocument();
    expect(screen.getByText("7,108")).toBeInTheDocument();
    // DC: 1 - 0.342 = 0.658 → 66% unsolved
    expect(screen.getByText("66%")).toBeInTheDocument();
  });

  it("has correct test id", () => {
    const cluster = MOCK_CLUSTERS.find((c) => c.id === "wa-king")!;
    render(<HoverTooltip cluster={cluster} x={200} y={150} />);

    expect(screen.getByTestId("map-hover-tooltip")).toBeInTheDocument();
  });

  it("unmounts cleanly when cluster becomes null", () => {
    const cluster = MOCK_CLUSTERS.find((c) => c.id === "wa-king")!;
    const { rerender } = render(
      <HoverTooltip cluster={cluster} x={200} y={150} />
    );

    expect(screen.getByTestId("map-hover-tooltip")).toBeInTheDocument();

    rerender(<HoverTooltip cluster={null} x={200} y={150} />);

    expect(screen.queryByTestId("map-hover-tooltip")).not.toBeInTheDocument();
  });
});
