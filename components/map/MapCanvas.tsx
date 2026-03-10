// MapCanvas — Mapbox GL JS dark basemap, renders cluster markers, stats bar, hover tooltip
// SSR disabled at page level via next/dynamic. Token from NEXT_PUBLIC_MAPBOX_TOKEN env var.
"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Cluster } from "@/lib/types";
import { useFilterStore } from "@/store/useFilterStore";
import { CLUSTER_HEAT, STATE_BOUNDS, DEFAULT_MAP_VIEW } from "@/lib/constants";
import StatsBar from "@/components/map/StatsBar";
import HoverTooltip from "@/components/map/HoverTooltip";

interface MapCanvasProps {
  clusters: Cluster[];
  totalCases: number;
  totalUnsolved: number;
  loading: boolean;
}

/** Classify cluster heat level by solve rate */
function getHeatLevel(solveRate: number): "hot" | "warm" | "cold" {
  if (solveRate <= CLUSTER_HEAT.HOT_MAX_SOLVE_RATE) return "hot";
  if (solveRate <= CLUSTER_HEAT.WARM_MAX_SOLVE_RATE) return "warm";
  return "cold";
}

/** Scale marker size by case count (min 28px, max 64px, log scale) */
function getMarkerSize(totalCases: number): number {
  const minSize = 28;
  const maxSize = 64;
  const minCases = 5;
  const maxCases = 8000;
  const t = Math.min(
    1,
    Math.max(
      0,
      (Math.log(totalCases) - Math.log(minCases)) /
        (Math.log(maxCases) - Math.log(minCases))
    )
  );
  return Math.round(minSize + t * (maxSize - minSize));
}

/** Get color tokens for a heat level */
function getHeatColors(heat: "hot" | "warm" | "cold") {
  switch (heat) {
    case "hot":
      return {
        outerBg: "rgba(200,16,46,0.12)",
        outerBorder: "rgba(200,16,46,0.35)",
        outerShadow: "0 0 28px rgba(200,16,46,0.15)",
        innerBg: "rgba(200,16,46,0.65)",
        innerBorder: "#C8102E",
        pulseColor: "rgba(200,16,46,0.5)",
        spinColor: "#C8102E",
      };
    case "warm":
      return {
        outerBg: "rgba(232,160,32,0.08)",
        outerBorder: "rgba(232,160,32,0.25)",
        outerShadow: "none",
        innerBg: "rgba(232,160,32,0.50)",
        innerBorder: "#E8A020",
        pulseColor: "rgba(232,160,32,0.4)",
        spinColor: "#E8A020",
      };
    default:
      return {
        outerBg: "rgba(90,96,112,0.08)",
        outerBorder: "rgba(90,96,112,0.25)",
        outerShadow: "none",
        innerBg: "rgba(90,96,112,0.35)",
        innerBorder: "#5A6070",
        pulseColor: "rgba(90,96,112,0.3)",
        spinColor: "#5A6070",
      };
  }
}

/** Build a DOM-based marker element for a cluster */
function buildMarkerElement(
  cluster: Cluster,
  isSelected: boolean
): HTMLDivElement {
  const size = getMarkerSize(cluster.total_cases);
  const heat = getHeatLevel(cluster.solve_rate);
  const colors = getHeatColors(heat);
  const innerSize = Math.round(size * 0.5);

  const el = document.createElement("div");
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.position = "relative";
  el.style.cursor = "pointer";
  el.style.animation = "clusterIn 0.4s ease-out both";
  el.setAttribute("data-testid", `cluster-node-${cluster.id}`);
  el.setAttribute("data-heat", heat);

  // Outer ring
  const outer = document.createElement("div");
  outer.style.cssText = `
    position:absolute; inset:0; border-radius:50%;
    background:${colors.outerBg};
    border:1px solid ${colors.outerBorder};
    box-shadow:${colors.outerShadow};
  `;
  el.appendChild(outer);

  // Pulse ring — hot nodes only
  if (heat === "hot") {
    const pulse = document.createElement("div");
    pulse.style.cssText = `
      position:absolute; inset:0; border-radius:50%;
      border:1.5px solid ${colors.pulseColor};
      animation:pulseRing 2.5s infinite;
      pointer-events:none;
    `;
    el.appendChild(pulse);
  }

  // Selected: spinning dashed rings
  if (isSelected) {
    const outerSpin = document.createElement("div");
    outerSpin.style.cssText = `
      position:absolute; inset:-4px; border-radius:50%;
      border:1.5px dashed ${colors.spinColor};
      animation:spin 8s linear infinite;
      pointer-events:none;
    `;
    el.appendChild(outerSpin);

    const innerSpin = document.createElement("div");
    innerSpin.style.cssText = `
      position:absolute; inset:-8px; border-radius:50%;
      border:1px dashed ${colors.spinColor};
      animation:spin 14s linear infinite reverse;
      opacity:0.6; pointer-events:none;
    `;
    el.appendChild(innerSpin);
  }

  // Inner circle
  const inner = document.createElement("div");
  inner.style.cssText = `
    width:${innerSize}px; height:${innerSize}px;
    border-radius:50%;
    background:${colors.innerBg};
    border:1.5px solid ${colors.innerBorder};
    position:relative; z-index:1;
    display:flex; align-items:center; justify-content:center;
  `;
  el.style.display = "flex";
  el.style.alignItems = "center";
  el.style.justifyContent = "center";

  // Case count label
  if (innerSize >= 20) {
    const label = document.createElement("span");
    label.style.cssText = `
      font-family:var(--font-mono); font-size:${innerSize >= 28 ? 8 : 7}px;
      letter-spacing:0.5px; color:#F0F2F5; font-weight:500;
      line-height:1; text-align:center;
    `;
    label.textContent =
      cluster.total_cases >= 1000
        ? `${(cluster.total_cases / 1000).toFixed(1)}k`
        : String(cluster.total_cases);
    inner.appendChild(label);
  }
  el.appendChild(inner);

  return el;
}

export default function MapCanvas({
  clusters,
  totalCases,
  totalUnsolved,
  loading,
}: MapCanvasProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const popupClusterIdRef = useRef<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [tokenMissing, setTokenMissing] = useState(false);
  const [boundaryReady, setBoundaryReady] = useState(false);

  const selectedClusterId = useFilterStore((s) => s.selectedClusterId);
  const setSelectedClusterId = useFilterStore((s) => s.setSelectedClusterId);

  // Hover state
  const [hoveredCluster, setHoveredCluster] = useState<Cluster | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const handleClusterHover = useCallback(
    (cluster: Cluster, e: MouseEvent) => {
      setHoveredCluster(cluster);
      setTooltipPos({ x: e.clientX, y: e.clientY });
    },
    []
  );

  const handleClusterLeave = useCallback(() => {
    setHoveredCluster(null);
  }, []);

  // Initialize map
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      setTokenMissing(true);
      return;
    }

    if (!mapContainerRef.current) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-98.5795, 39.8283],
      zoom: 3.8,
      attributionControl: false,
    });

    map.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      "bottom-left"
    );

    map.on("load", () => {
      setMapReady(true);

      // Fetch US state boundaries and add highlight layer
      fetch(
        "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json"
      )
        .then((res) => res.json())
        .then((geojson) => {
          if (!map.getSource("state-boundaries")) {
            map.addSource("state-boundaries", {
              type: "geojson",
              data: geojson,
            });
            map.addLayer({
              id: "state-highlight",
              type: "line",
              source: "state-boundaries",
              paint: {
                "line-color": "#E8A020",
                "line-width": 1.5,
                "line-opacity": 0,
                "line-opacity-transition": { duration: 600, delay: 0 },
              },
            });
            setBoundaryReady(true);
          }
        })
        .catch(() => {
          // Boundary data unavailable — feature degrades silently
        });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, []);

  // Render cluster markers
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    clusters.forEach((cluster) => {
      const isSelected = cluster.id === selectedClusterId;
      const el = buildMarkerElement(cluster, isSelected);

      // Click handler — toggle popup on same cluster, open on different cluster
      el.addEventListener("click", (e) => {
        e.stopPropagation();

        // If clicking the same cluster that already has an open popup, close it
        if (popupClusterIdRef.current === cluster.id && popupRef.current) {
          popupRef.current.remove();
          popupRef.current = null;
          popupClusterIdRef.current = null;
          return;
        }

        setSelectedClusterId(cluster.id);

        // Remove existing popup (different cluster)
        if (popupRef.current) {
          popupRef.current.remove();
          popupRef.current = null;
        }

        const heat = getHeatLevel(cluster.solve_rate);
        const accentColor = heat === "hot" ? "#C8102E" : heat === "warm" ? "#E8A020" : "#5A6070";

        const popup = new mapboxgl.Popup({
          offset: [0, -(getMarkerSize(cluster.total_cases) / 2 + 8)],
          closeButton: false,
          className: "cluster-popup",
          maxWidth: "220px",
        })
          .setLngLat([cluster.lng, cluster.lat])
          .setHTML(`
            <div style="background:#111216;border:1px solid #1F2430;padding:12px 14px;border-radius:2px;">
              <div style="font-family:var(--font-mono);font-size:8px;letter-spacing:2.5px;color:${accentColor};text-transform:uppercase;margin-bottom:4px;">
                Cluster
              </div>
              <div style="font-family:var(--font-display);font-size:18px;letter-spacing:2px;color:#F0F2F5;line-height:1.1;margin-bottom:8px;">
                ${cluster.name}
              </div>
              <div style="font-family:var(--font-mono);font-size:10px;color:#8A929F;letter-spacing:1px;margin-bottom:10px;">
                ${cluster.total_cases.toLocaleString()} cases · ${Math.round(cluster.solve_rate * 100)}% solved
              </div>
              <a href="/cluster/${cluster.id}" style="font-family:var(--font-display);font-size:11px;letter-spacing:3px;color:#C8102E;text-decoration:none;text-transform:uppercase;">
                Open Case File →
              </a>
            </div>
          `)
          .addTo(mapRef.current!);

        popupRef.current = popup;
        popupClusterIdRef.current = cluster.id;
      });

      // Hover handlers
      el.addEventListener("mouseenter", (e) => {
        handleClusterHover(cluster, e as MouseEvent);
      });
      el.addEventListener("mousemove", (e) => {
        setTooltipPos({ x: e.clientX, y: e.clientY });
      });
      el.addEventListener("mouseleave", () => {
        handleClusterLeave();
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([cluster.lng, cluster.lat])
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });
  }, [
    clusters,
    mapReady,
    selectedClusterId,
    setSelectedClusterId,
    handleClusterHover,
    handleClusterLeave,
  ]);

  // Fly to state when state filter changes
  const stateFilter = useFilterStore((s) => s.state);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    if (stateFilter && STATE_BOUNDS[stateFilter]) {
      const bounds = STATE_BOUNDS[stateFilter];
      mapRef.current.fitBounds(
        [
          [bounds[0], bounds[1]],
          [bounds[2], bounds[3]],
        ],
        {
          padding: { top: 80, bottom: 80, left: 80, right: 80 },
          duration: 1200,
          essential: true,
        }
      );
    } else {
      mapRef.current.flyTo({
        center: DEFAULT_MAP_VIEW.center,
        zoom: DEFAULT_MAP_VIEW.zoom,
        duration: 1200,
        essential: true,
      });
    }
  }, [stateFilter, mapReady]);

  // Highlight state boundary when state filter changes
  useEffect(() => {
    if (!boundaryReady || !mapRef.current) return;
    const map = mapRef.current;

    if (stateFilter && STATE_BOUNDS[stateFilter]) {
      // Show boundary for selected state
      map.setFilter("state-highlight", ["==", ["get", "name"], stateFilter]);
      map.setPaintProperty("state-highlight", "line-opacity-transition", {
        duration: 600,
        delay: 0,
      });
      map.setPaintProperty("state-highlight", "line-opacity", 0.5);
    } else {
      // Fade out boundary
      map.setPaintProperty("state-highlight", "line-opacity-transition", {
        duration: 400,
        delay: 0,
      });
      map.setPaintProperty("state-highlight", "line-opacity", 0);
    }
  }, [stateFilter, boundaryReady]);

  // Token missing — isolated error block
  if (tokenMissing) {
    return (
      <div
        className="flex items-center justify-center flex-1 bg-bg"
        data-testid="map-token-error"
      >
        <div className="flex flex-col items-center gap-[8px]">
          <span
            className="font-[family-name:var(--font-mono)] text-red uppercase"
            style={{ fontSize: "10px", letterSpacing: "2px" }}
          >
            Map Unavailable
          </span>
          <span
            className="font-[family-name:var(--font-mono)] text-muted"
            style={{ fontSize: "10px", letterSpacing: "1px" }}
          >
            Token not configured
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative flex-1 overflow-hidden"
      style={{ height: "100%", width: "100%" }}
      data-testid="map-container"
    >
      {/* Mapbox container */}
      <div
        ref={mapContainerRef}
        style={{ height: "100%", width: "100%" }}
      />

      {/* Stats bar — floating top-right overlay */}
      <StatsBar
        totalCases={totalCases}
        totalUnsolved={totalUnsolved}
        clusterCount={clusters.length}
        loading={loading}
      />

      {/* Hover tooltip — follows cursor */}
      <HoverTooltip
        cluster={hoveredCluster}
        x={tooltipPos.x}
        y={tooltipPos.y}
      />
    </div>
  );
}
